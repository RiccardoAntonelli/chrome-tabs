import * as vscode from "vscode";
import * as path from "path";

export class TreeItem extends vscode.TreeItem {
  name: string;
  url: string;
  pinned: boolean;

  //Tree Item
  contextValue: string;
  description: string;
  command: vscode.Command;

  constructor(name?: string, url?: string, pinned?: boolean) {
    super(name ?? "", vscode.TreeItemCollapsibleState.None);
    this.name = name ?? "";
    this.url = url ?? "";
    this.pinned = pinned ?? false;
    this.contextValue = "site";
    this.description = url ?? "";
    this.command = {
      title: "View site",
      command: "pinnedSites.openSite",
      arguments: [this],
    };
    this.iconPath = {
      light: path.join(
        __filename,
        "..",
        "..",
        "resources",
        "light",
        "globe.svg"
      ),
      dark: path.join(__filename, "..", "..", "resources", "dark", "globe.svg"),
    };
  }

  public get(key: string): any {
    switch (key) {
      case "name":
        return this.name;
      case "url":
        return this.url;
      case "pinned":
        return this.pinned;
    }
  }

  public set(name?: string, url?: string, pinned?: boolean): void {
    this.name = name ?? this.name;
    this.url = url ?? this.url;
    this.pinned = pinned ?? this.pinned;
    this.contextValue = "site";
    this.description = url ?? this.url;
    this.command = {
      title: "View site",
      command: "pinnedSites.openSite",
      arguments: [this],
    };
    this.iconPath = {
      light: path.join(
        __filename,
        "..",
        "..",
        "resources",
        "light",
        "globe.svg"
      ),
      dark: path.join(__filename, "..", "..", "resources", "dark", "globe.svg"),
    };
    super.label = name ?? this.name;
    super.collapsibleState = vscode.TreeItemCollapsibleState.None;
  }

  public equals(other: TreeItem): boolean {
    if (
      this.name === other.name &&
      this.url === other.url &&
      this.pinned === other.pinned
    ) {
      return true;
    }
    return false;
  }
}
