"use strict";
const { stringify, parse } = require("flatted");
import { Memento } from "vscode";
import { TreeItem } from "./site";

export class LocalStorageService {
  constructor(private storage: Memento) {
    // Used to delete all data in json
    // this.storage.update("Sites", "");
  }

  public saveSites(data: TreeItem[]) {
    let json = "[";
    if (data !== [] && data !== undefined) {
      for (let item of data) {
        json += stringify(item);
        json += ";";
      }
      json = json.substring(0, json.length - 2);
    }
    json = json + "]";
    console.log(json);
    this.storage.update("Sites", json);
  }

  public getSites(): TreeItem[] {
    let sites: TreeItem[] = [];
    let json = this.storage.get<string>("Sites", "");

    let jsons: string[];
    if (json === "[]" || json === "") {
      return [];
    }
    if (json.includes(";")) {
      jsons = json.substring(1, json.length).split(";");
    } else {
      jsons = [json.substring(1, json.length)];
    }
    console.log(jsons.toString());

    jsons.forEach((value, index) => {
      let result = Object.assign(new TreeItem(), parse(value));
      result.set();
      sites[index] = result;
      console.log(result);
    });

    return sites;
  }
}
