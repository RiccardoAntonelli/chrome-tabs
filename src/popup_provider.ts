"use strict";
import * as vscode from "vscode";
import { Folder, Site } from "./site";

export abstract class PopupProvider {
  public static async showProtocolPopup(
    title: string,
    initialProtocol: string = ""
  ): Promise<string | undefined> {
    let protocol = await vscode.window.showQuickPick(
      [
        {
          label: "https://",
          picked: initialProtocol === "https://" || initialProtocol === "",
        },
        {
          label: "http://",
          picked: initialProtocol === "http://",
        },
      ],
      {
        title: title,
        placeHolder: "Site protocol",
        canPickMany: false,
      }
    );
    return protocol?.label;
  }

  public static async showNamePopup(
    title: string,
    initialName: string = "",
    sites: (Site | Folder)[]
  ): Promise<string | undefined> {
    let name = await vscode.window.showInputBox({
      prompt: `${title} - `,
      placeHolder: "Site name",
      value: initialName,
      validateInput: (text) => {
        let validation = "";

        if (text === undefined || text.length === 0) {
          validation = "Insert a valid name";
        } else {
          for (let site of sites) {
            if (site instanceof Site && site.name === text) {
              validation = "This name already exists";
            }
          }
        }
        return validation;
      },
    });
    return name;
  }

  public static async showUrlPopup(
    title: string,
    initialUrl: string = ""
  ): Promise<string | undefined> {
    let url = await vscode.window.showInputBox({
      prompt: `${title} - `,
      placeHolder: "Site url",
      value: initialUrl,
      validateInput: (text) => {
        let validation = "";
        /*text.includes("www.")
                  ? ""
                  : (validation = validation.concat("Add www."));
                text.substring(4, text.length).includes(".")
                  ? ""
                  : validation.length === 0
                  ? (validation = validation.concat("Add domain"))
                  : (validation = validation.concat(" | Add domain"));
                  let validation = "";*/

        if (text === undefined || text.length === 0) {
          validation = "Insert a valid url";
        }
        return validation;
      },
    });
    return url;
  }
}
