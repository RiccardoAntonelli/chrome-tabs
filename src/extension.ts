"use strict";
import * as vscode from "vscode";
import { ChromeTreeProvider } from "./tree_provider";
import { LocalStorageService } from "./local_storage";
import { Site, TreeItem } from "./site";

export function activate(context: vscode.ExtensionContext) {
  var localStorage = new LocalStorageService(context.workspaceState);

  var sites: Site[];
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
        const previousElement = node;
        editSite(node, previousElement);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("pinnedSites.deleteSite", (node: Site) => {
      treeProvider.deleteTreeItem(new TreeItem(node));
      let deleteIndex = -1;
      for (let i = 0; i < sites.length; i++) {
        if (sites[i].equals(node)) {
          deleteIndex = i;
          break;
        }
      }
      vscode.window.showInformationMessage(
        "Deleted " + sites[deleteIndex].name
      );
      delete sites[deleteIndex];
      localStorage.saveSites(sites);
    })
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
    var url = await vscode.window.showInputBox({
      prompt: "Search site - ",
      placeHolder: "Site url | (www.sitename.domain)",
      /*validateInput: (text) => {
        //return text.includes("www.") ? "" : "Add www.";
        var validation = "";
        text.includes("www.")
          ? ""
          : (validation = validation.concat("Add www."));
        text.substring(4, text.length).includes(".")
          ? ""
          : validation.length === 0
          ? (validation = validation.concat("Add domain"))
          : (validation = validation.concat(" | Add domain"));
        return validation;
      },*/
    });
    if (url === undefined) {
      return;
    }
    var protocol = await vscode.window.showQuickPick(
      [{ label: "https://" }, { label: "http://" }],
      {
        title: "Search site -",
        placeHolder: "Site protocol",
        canPickMany: false,
      }
    );
    if (protocol === undefined) {
      protocol = { label: "https://" };
    }
    url = protocol.label + url + "/";
    openSite(new Site("", url, false));
  };

  function saveNewSite(name: string, url: string, pinned: boolean) {
    var site = new Site(name, url, pinned);
    sites.push(site);
    localStorage.saveSites(sites);
    treeProvider.addTreeItem(new Site(name, url, pinned));
  }

  const editSite = async (element: TreeItem, previousElement: TreeItem) => {
    let options = ["Rename", "Change url"];
    let result = await vscode.window.showQuickPick(options);
    switch (result) {
      case "Rename":
        let resultName = await vscode.window.showInputBox({
          prompt: "Rename site - ",
          placeHolder: "Site name",
          validateInput: (text) => {
            let validation = "";

            if (text === undefined || text.length === 0) {
              validation = "Insert a valid name";
            } else {
              for (let site of sites) {
                if (site.name === text) {
                  validation = "This name already exists";
                }
              }
            }
            return validation;
          },
        });
        resultName !== undefined ? (element.site.name = resultName) : null;
        break;
      case "Change url":
        let resultUrl = await vscode.window.showInputBox({
          prompt: "Edit site - ",
          placeHolder: "Site url | (www.sitename.domain)",
          /*validateInput: (text) => {
            var validation = "";
            text.includes("www.")
              ? ""
              : (validation = validation.concat("Add www."));
            text.substring(4, text.length).includes(".")
              ? ""
              : validation.length === 0
              ? (validation = validation.concat("Add domain"))
              : (validation = validation.concat(" | Add domain"));
            return validation;
          },*/
        });
        if (resultUrl !== undefined) {
          var protocol = await vscode.window.showQuickPick(
            [{ label: "https://" }, { label: "http://" }],
            {
              title: "Edit site -",
              placeHolder: "Site protocol",
              canPickMany: false,
            }
          );
          if (protocol === undefined) {
            protocol = { label: "https://" };
          }
          resultUrl = protocol.label + resultUrl + "/";
          element.site.url = resultUrl;
        }
        break;
    }
    let editIndex = -1;
    for (let i = 0; i < sites.length; i++) {
      if (sites[i] === previousElement.site) {
        editIndex = i;
        break;
      }
    }
    sites[editIndex] = element.site;
    console.log("Edit Site: " + element);
    treeProvider.editTreeItem(previousElement, element);
    localStorage.saveSites(sites);
    vscode.window.showInformationMessage("Edited successfully");
  };

  const addNewSite = async (): Promise<any> => {
    let name = await vscode.window.showInputBox({
      prompt: "New site - ",
      placeHolder: "Site name",
      validateInput: (text) => {
        let validation = "";

        if (text === undefined || text.length === 0) {
          validation = "Insert a valid name";
        } else {
          for (let site of sites) {
            if (site.name === text) {
              validation = "This name already exists";
            }
          }
        }
        return validation;
      },
    });
    if (name === undefined) {
      return;
    }
    let url = await vscode.window.showInputBox({
      prompt: "New site - ",
      placeHolder: "Site url | (www.sitename.domain)",
      /*validateInput: (text) => {
        //return text.includes("www.") ? "" : "Add www.";
        let validation = "";
        if (text === undefined || text.length === 0) {
          validation = "Insert a valid address";
        }
        text.includes("www.")
          ? ""
          : (validation = validation.concat("Add www."));
        text.substring(4, text.length).includes(".")
          ? ""
          : validation.length === 0
          ? (validation = validation.concat("Add domain"))
          : (validation = validation.concat(" | Add domain"));
        return validation;
      },*/
    });
    if (url === undefined) {
      return;
    }
    var protocol = await vscode.window.showQuickPick(
      [{ label: "https://" }, { label: "http://" }],
      {
        title: "New site",
        placeHolder: "Site protocol",
        canPickMany: false,
      }
    );
    if (protocol === undefined) {
      protocol = { label: "https://" };
    }
    url = protocol.label + url + "/";
    vscode.window.showInformationMessage("Created " + name);
    saveNewSite(name, url, true);
  };

  const openSite = (site: Site) => {
    if (site.url === "" || site.url === undefined) {
    } else {
      let currentPanel = vscode.window.createWebviewPanel(
        site.url === "" ? "Search results" : site.url,
        site.name === "" ? "Search results" : site.name,
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );

      currentPanel.webview.html = getWebViewContent(site.url);
    }
  };

  const getWebViewContent = (url: string) => {
    return (
      `<!DOCTYPE html>
		<html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title></title>
        <style>
          body, html
            {
            margin: 0; padding: 0; height: 100%; overflow: hidden; background-color: #fff;
            }
          </style>
      </head>
      <body>
        <iframe src="` +
      url +
      `" width="100%" height="100%" id="iframe"></iframe>
      </body>
		</html>`
    );
  };
}

export function deactivate() {}
