"use strict";
import { Memento } from "vscode";
import { Folder, Site } from "./site";

export class LocalStorageProvider {
  constructor(private storage: Memento) {
    // Delete all data in json
    //this.storage.update("Sites", "");
  }

  public saveSites(data: (Site | Folder)[]) {
    let json = JSON.stringify(data);
    this.storage.update("Sites", json);
  }

  public getSites(): (Site | Folder)[] {
    let sites: (Site | Folder)[] = [];
    let json = this.storage.get<string>("Sites", "");

    if (json === undefined || json === "") {
      return [];
    }

    let jsons: Object[] = JSON.parse(json);

    if (!jsons.every((object) => !object.hasOwnProperty("command"))) {
      //Old system
      this.storage.update("Sites", "");
      return [];
    }

    sites = parseObjectList(jsons);

    return sites;
  }
}

const parseObjectList = (json: Object[]): (Site | Folder)[] => {
  return json.map((value) => {
    let result: Site | Folder;
    if (value.hasOwnProperty("url" as PropertyKey)) {
      return Object.assign(new Site(), value);
    } else {
      result = new Folder();
      result.name = (value as Folder).name;
      result.sites = parseObjectList((value as Folder).sites);
      return result;
    }
  });
};
