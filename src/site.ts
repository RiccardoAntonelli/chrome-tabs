"use strict";
import * as vscode from "vscode";
import * as path from "path";

export class Site {
  name: string;
  url: string;
  protocol: string;

  constructor(name?: string, url?: string, protocol?: string) {
    this.name = name ?? "";
    this.url = url ?? "";
    this.protocol = protocol ?? "";
  }

  public equals(other: Site): boolean {
    if (
      this.name === other.name &&
      this.url === other.url &&
      this.protocol === other.protocol
    ) {
      return true;
    }
    return false;
  }

  public toString(): string {
    return `Site{name: ${this.name}, url: ${this.url}, protocol: ${this.protocol}}`;
  }
}

export class Folder {
  name: string;
  sites: (Site | Folder)[];

  constructor(name?: string, sites?: (Site | Folder)[]) {
    this.name = name ?? "";
    this.sites = sites ?? [];
  }

  public equals(other: Folder): boolean {
    if (this.name === other.name && this.sites === other.sites) {
      return this.sites.every((site, index) => {
        return site === other.sites[index];
      });
    }
    return false;
  }

  public toString(): string {
    return `Folder{name: ${this.name}, sites: ${this.sites}}`;
  }
}

export class TreeItem extends vscode.TreeItem {
  site: Site;

  //Tree Item
  contextValue: string;
  description: string;
  command: vscode.Command;
  children: TreeItem[];

  constructor(site: Site /*TODO: Site|Folder */) {
    super(site.name, vscode.TreeItemCollapsibleState.None);
    this.site = site;
    this.contextValue = "site"; //TODO: implement folders
    this.description = site.protocol + site.url;
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
