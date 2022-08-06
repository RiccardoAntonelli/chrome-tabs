"use strict";
import { log } from "console";
import * as vscode from "vscode";
import { LocalStorageService } from "./local_storage";
import { Site, TreeItem } from "./site";

export class ChromeTreeProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  constructor(localStorage: LocalStorageService) {
    this.data = localStorage.getSites().map((site) => {
      return new TreeItem(site);
    });
  }

  data: TreeItem[];

  private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined> =
    new vscode.EventEmitter<TreeItem | undefined>();

  readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined> =
    this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(
    element?: TreeItem | undefined
  ): vscode.ProviderResult<TreeItem[]> {
    if (element === undefined) {
      return this.data;
    }
    return element.children;
  }

  public deleteTreeItem(element: TreeItem) {
    delete this.data[this.data.indexOf(element)];
    this.refresh();
  }

  public addTreeItem(site: Site) {
    this.data.push(
      new TreeItem(
        site
      )
    );
    this.refresh();
  }

  public editTreeItem(previousElement: TreeItem, element: TreeItem) {
    this.data[this.data.indexOf(previousElement)] = element;
    this.refresh();
  }
}
