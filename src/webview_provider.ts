"use strict";
import * as vscode from "vscode";
import { Site } from "./site";

export class WebviewProvider {
  site: Site;

  constructor(site: Site) {
    this.site = site;
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
      currentPanel.webview.html = this.getWebViewContent(url);
    }
  }

  private getWebViewContent(url: string) {
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
  }
}
