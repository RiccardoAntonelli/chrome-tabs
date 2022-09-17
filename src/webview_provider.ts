"use strict";
import * as vscode from "vscode";
import { Site } from "./site";

export class WebviewProvider {
  site: Site;
  context: vscode.ExtensionContext;

  constructor(site: Site, context: vscode.ExtensionContext) {
    this.site = site;
    this.context = context;
    this.setupWebview();
  }

  private setupWebview() {
    if (this.site.url === "" || this.site.url === undefined) {
    } else {
      let currentPanel = vscode.window.createWebviewPanel(
        this.site.url === "" ? "Search results" : this.site.url,
        this.site.name === "" ? "Search results" : this.site.name,
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );
      let url = this.site.protocol + this.site.url;
      currentPanel.webview.html = this.getWebViewContent(
        url,
        currentPanel.webview,
        this.context.extensionUri
      );
    }
  }

  private getUri(
    webview: vscode.Webview,
    extensionUri: vscode.Uri,
    pathList: string[]
  ) {
    return webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, ...pathList));
  }

  private getWebViewContent(
    url: string,
    webview: vscode.Webview,
    extensionUri: vscode.Uri
  ) {
    const toolkitUri = this.getUri(webview, extensionUri, [
      "node_modules",
      "@vscode",
      "webview-ui-toolkit",
      "dist",
      "toolkit.js", // A toolkit.min.js file is also available
    ]);

    const iconsUri = this.getUri(webview, extensionUri, [
      "node_modules",
      "@vscode",
      "codicons",
      "dist",
      "codicon.css",
    ]);

    return (
      `<!DOCTYPE html>
            <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script type="module" src="${toolkitUri}"></script>
            <link rel="stylesheet" href="${iconsUri}">
            <title></title>
            <script>
            var iframe = document.getElementById('website_iframe');
            iframe.onload = function load() {
              var iframe = document.getElementById('website_iframe');
              var head = iframe.contentWindow.document.getElementsByTagName('head')[0];
              var script = iframe.contentWindow.document.createElement('script');
              script.innerText = 'window.addEventListener("message", function(event) {if (event.data === "reload") {location.reload();}if (event.data === "back") {window.history.back();}if (event.data === "forward") {window.history.forward();}console.log(event.data)})';
              script.type = 'text/javascript';
              head.appendChild(script);
            };

              function back() {
                iframe.contentWindow.postMessage('back', '*');
              }
              function forward() {
                iframe.contentWindow.postMessage('forward', '*');
              }
              function reload() {
                iframe.contentWindow.postMessage('reload', '*');
              }
            </script>
            <style>
              body, html {
                margin: 0;
                padding: 0;
                height: 100%;
                overflow: hidden;
              }
              .header {
                height: fit-content;
                width: 100%;
                display: flex;
                flex-direction: row;
                padding: 5px 0;
              }
              .header > * {
                margin: 0 2.5px;
              }
              #website_iframe {
                width: 100%;
                flex-grow: 1;
                border: none;
              }
              .column {
                height: 100%;
                width: 100%;
                display: flex;
                flex-direction: column;
              }
              </style>
          </head>
          <body>
          <div class="column">
          <div class="header">
            <vscode-button appearance="icon" aria-label="Back" onclick="back()">
              <span class="codicon codicon-arrow-left"></span>
            </vscode-button>
            <vscode-button appearance="icon" aria-label="Forward" onclick="forward()">
              <span class="codicon codicon-arrow-right"></span>
            </vscode-button>
            <vscode-button appearance="icon" aria-label="Forward" onclick="reload()">
              <span class="codicon codicon-debug-restart"></span>
            </vscode-button>
            <vscode-text-field placeholder="Url">
              <span slot="start" class="codicon codicon-search"></span>
            </vscode-text-field>
          </div>
          <iframe src="` +
      url +
      `" id="website_iframe">
      </iframe>
          </div>
          </body>
          </html>`
    );
  }
}
