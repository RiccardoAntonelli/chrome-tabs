import * as vscode from "vscode";
import * as path from "path";

export class Site {
  name: string;
  url: string;
  pinned: boolean;
  type: string = "site"; //TODO: implement folder

  constructor(name?: string, url?: string, pinned?: boolean) {
    this.name = name ?? "";
    this.url = url ?? "";
    this.pinned = pinned ?? false;
  }

  public equals(other: Site): boolean {
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

export class TreeItem extends vscode.TreeItem {
  site: Site;

  //Tree Item
  contextValue: string;
  description: string;
  command: vscode.Command;
  children: TreeItem[];

  constructor(site: Site) {
    super(site.name, vscode.TreeItemCollapsibleState.None);
    this.site = site;
    this.contextValue = site.type;
    this.description = site.url;
    this.children = []; //TODO: implement folders
    this.command = {
      title: "View site",
      command: "pinnedSites.openSite",
      arguments: [this.site],
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
}
