"use strict";
import * as vscode from "vscode";
import { ChromeTreeProvider } from "./tree_provider";
import { LocalStorageService } from "./local_storage";
import { TreeItem } from "./site";

export function activate(context: vscode.ExtensionContext) {
  var localStorage = new LocalStorageService(context.workspaceState);

  var treeItems: TreeItem[];
  treeItems = localStorage.getSites();

  var treeProvider = new ChromeTreeProvider(localStorage);

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
    vscode.commands.registerCommand(
      "pinnedSites.deleteSite",
      (node: TreeItem) => {
        treeProvider.deleteTreeItem(node);
        let deleteIndex = -1;
        for (let i = 0; i < treeItems.length; i++) {
          if (treeItems[i].equals(node)) {
            deleteIndex = i;
            break;
          }
        }
        delete treeItems[deleteIndex];
        localStorage.saveSites(treeItems);
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
    var url = await vscode.window.showInputBox({
      prompt: "Search site - ",
      placeHolder: "Site url | (www.sitename.domain)",
      validateInput: (text) => {
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
      },
    });
    if (url === undefined) {
      return;
    }
    url = "https://" + url + "/";
    openSite(new TreeItem("", url, false));
  };

  function saveNewSite(name: string, url: string, pinned: boolean) {
    var site = new TreeItem(name, url, pinned);
    treeItems.push(site);
    localStorage.saveSites(treeItems);
    treeProvider.addTreeItem(new TreeItem(name, url, pinned));
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
              for (let treeItem of treeItems) {
                if (treeItem.name === text) {
                  validation = "This name already exists";
                }
              }
            }
            return validation;
          },
        });
        resultName !== undefined
          ? ((element.label = resultName), element.set(resultName))
          : null;
        break;
      case "Change url":
        let resultUrl = await vscode.window.showInputBox({
          prompt: "Rename site - ",
          placeHolder: "Site url | (www.sitename.domain)",
          validateInput: (text) => {
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
          },
        });
        if (resultUrl !== undefined) {
          resultUrl = "https://" + resultUrl + "/";
          element.description = resultUrl;
          element.set(undefined, resultUrl);
        }
        break;
    }
    let editIndex = -1;
    for (let i = 0; i < treeItems.length; i++) {
      if (
        treeItems[i].get("name") === previousElement.get("name") &&
        treeItems[i].get("url") === previousElement.get("url") &&
        treeItems[i].get("pinned") === previousElement.get("pinned")
      ) {
        editIndex = i;
        break;
      }
    }
    treeItems[editIndex] = element;
    console.log("Edit Site: " + element);
    treeProvider.editTreeItem(previousElement, element);
    localStorage.saveSites(treeItems);
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
          for (let treeItem of treeItems) {
            if (treeItem.name === text) {
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
      validateInput: (text) => {
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
      },
    });
    if (url === undefined) {
      return;
    }
    vscode.window.showInformationMessage("created" + name);
    url = "https://" + url + "/";
    saveNewSite(name, url, true);
  };

  const openSite = (site: TreeItem) => {
    if (site.get("url") === "" || site.get("url") === undefined) {
    } else {
      let currentPanel = vscode.window.createWebviewPanel(
        site.get("name") === "" ? "Search results" : site.get("name"),
        site.get("name") === "" ? "Search results" : site.get("name"),
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );
      currentPanel.webview.html = getWebViewContent(site.get("url"));

      currentPanel.webview.onDidReceiveMessage(
        (message) => {
          switch (message.command) {
            case "noconnection":
              currentPanel.webview.html = getNoConnectionContent();
              return;
          }
        },
        undefined,
        context.subscriptions
      );
    }
  };

  const getWebViewContent = (url: string) => {
    return (
      `<!DOCTYPE html>
		<html lang="en">
		<head>
    <script>
    function listenForIframe() {
      vscode.postMessage({
        command: 'noconnection',
        text: 'noconnection'});
      const iframe = document.getElementById("iframe");
      var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  
      // Check if loading is complete
      if (iframeDoc.readyState == 'complete') {
      } else {
        
      
      }
      window.setTimeout(listenForIframe, 3000);
  }
    </script>
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

  const getNoConnectionContent = () => {
    return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title></title>
			<style>
				body, html {
					margin: 0; padding: 0; height: 100%; overflow: hidden; background-color: #fff;
				  }
          h1 {
            font-size: 1.5em;
            font-weight: bold;
            color: #121212;
            text-align: center;
          }
          p {
            font-size: 1em;
            color: #121212;
            text-align: center;
          }
          img {
            width: 30%;
            height: auto;
          }
			  </style>
		</head>
		<body>  
		<h1>No internet connection<h1>
    <p>Try reconnecting<p>
		</body>
		</html>`;
  };
}

export function deactivate() {}
