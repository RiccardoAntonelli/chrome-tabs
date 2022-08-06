"use strict";
import * as vscode from "vscode";
import { LocalStorageProvider } from "./local_storage";
import { Site, TreeItem } from "./site";

export class ChromeTreeProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  data: TreeItem[];
  localStorage: LocalStorageProvider;

  constructor(localStorage: LocalStorageProvider) {
    this.localStorage = localStorage;
    this.data = this.loadData(this.localStorage);
  }

  private loadData(localStorage: LocalStorageProvider): TreeItem[] {
    return localStorage.getSites().map((site) => {
      if (site instanceof Site) {
        return new TreeItem(site as Site);
      } else {
        return new TreeItem(new Site());
      } //TODO: manage folders
    });
  }

  private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined> =
    new vscode.EventEmitter<TreeItem | undefined>();

  readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined> =
    this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
    this.data = this.loadData(this.localStorage);
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
    this.data.push(new TreeItem(site));
    this.refresh();
  }

  public editTreeItem(previousElement: TreeItem, element: TreeItem) {
    this.data[
      this.data.findIndex((treeItem) => {
        return treeItem.site.equals(previousElement.site);
      })
    ] = element;
    this.refresh();
  }
}
