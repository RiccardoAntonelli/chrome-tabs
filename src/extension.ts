"use strict";
import * as vscode from "vscode";
import { ChromeTreeProvider } from "./tree_provider";
import { LocalStorageProvider } from "./local_storage";
import { Folder, Site, TreeItem } from "./site";
import { PopupProvider } from "./popup_provider";
import { WebviewProvider } from "./webview_provider";

export function activate(context: vscode.ExtensionContext) {
  var localStorage = new LocalStorageProvider(context.workspaceState);

  var sites: (Site | Folder)[];
  sites = localStorage.getSites();

  var treeProvider = new ChromeTreeProvider(localStorage);
  treeProvider.refresh();

  vscode.window.registerTreeDataProvider("pinnedSites", treeProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand("pinnedSites.searchSite", () => {
      searchAndOpenSite();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("pinnedSites.refresh", () => {
      treeProvider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "pinnedSites.editSite",
      (node: TreeItem) => {
        const previousSite = node.site;
        editSite(
          new TreeItem(
            new Site(previousSite.name, previousSite.url, previousSite.protocol)
          ),
          node
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "pinnedSites.deleteSite",
      (node: TreeItem) => {
        treeProvider.deleteTreeItem(node);
        let deleteIndex = -1;
        for (let i = 0; i < sites.length; i++) {
          if (
            sites[i] instanceof Site &&
            (sites[i] as Site).equals(node.site)
          ) {
            deleteIndex = i;
            break;
          }
        }
        vscode.window.showInformationMessage(
          "Deleted " + sites[deleteIndex].name
        );
        sites.splice(deleteIndex, 1);
        localStorage.saveSites(sites);
        treeProvider.refresh();
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("pinnedSites.newSite", () => {
      addNewSite();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("pinnedSites.openSite", (item: any) => {
      openSite(item);
    })
  );

  const searchAndOpenSite = async () => {
    let options = ["Search with Google", "Open site"];
    let result = await vscode.window.showQuickPick(options);
    let url = "",
      protocol = "";

    switch (result) {
      case "Search with Google":
        let query = await PopupProvider.showSearchPopup("Search with Google");

        if (query === undefined) {
          return;
        }

        protocol = "https://";
        url =
          "www.google.com/search?q=" +
          query.replaceAll(" ", "+") +
          "&output=embed";
        break;
      case "Open website":
        let result = await PopupProvider.showUrlPopup("Open site");
        if (result === undefined) {
          return;
        }
        url = result;

        result = await PopupProvider.showProtocolPopup("Open site");
        if (result === undefined) {
          return;
        }
        protocol = result;
        break;
      default:
        return;
    }
    openSite(new Site("", url, protocol));
  };

  function saveNewSite(name: string, url: string, protocol: string) {
    let site = new Site(name, url, protocol);
    sites.push(site);
    localStorage.saveSites(sites);
    treeProvider.addTreeItem(site);
  }

  const editSite = async (element: TreeItem, previousElement: TreeItem) => {
    let options = ["Rename", "Change url"];
    let result = await vscode.window.showQuickPick(options);
    switch (result) {
      case "Rename":
        let name = await PopupProvider.showNamePopup(
          "Edit site",
          previousElement.site.name,
          sites
        );
        if (name === undefined) {
          return;
        }
        element.site.name = name;
        break;
      case "Change url":
        let url = await PopupProvider.showUrlPopup(
          "Edit site",
          previousElement.site.url
        );
        if (url === undefined) {
          return;
        }

        let protocol = await PopupProvider.showProtocolPopup(
          "Edit site",
          previousElement.site.protocol
        );
        if (protocol === undefined) {
          return;
        }
        url = url;
        element.site.url = url;
        element.site.protocol = protocol;
        break;
    }

    let editIndex = sites.findIndex((site) => {
      return (
        site instanceof Site && (site as Site).equals(previousElement.site)
      );
    });
    console.log("Edit previous site:" + previousElement.site);
    sites[editIndex] = element.site;
    console.log("Edit index: " + editIndex);
    localStorage.saveSites(sites);
    treeProvider.editTreeItem(previousElement, element);

    console.log("Edit Site: " + element.site);
    vscode.window.showInformationMessage("Edited successfully");
  };

  const addNewSite = async (): Promise<any> => {
    let name = await PopupProvider.showNamePopup("New site", "", sites);
    if (name === undefined) {
      return;
    }

    let url = await PopupProvider.showUrlPopup("New site");
    if (url === undefined) {
      return;
    }

    let protocol = await PopupProvider.showProtocolPopup("New site");
    if (protocol === undefined) {
      return;
    }

    vscode.window.showInformationMessage("Created " + name);
    saveNewSite(name, url, protocol);
  };

  function openSite(site: Site) {
    new WebviewProvider(site, context);
  }
}

export function deactivate() {}
