import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";
import { describe } from "node:test";
import { Description } from "@ethersproject/properties";

const editionDrop = sdk.getContract("0xf2FF744A826Ea1c33cC5C0Be0e48ca2959493760", "edition-drop");

(async () => {
  try {
    await (await editionDrop).createBatch([
      {
        name: "Member's Limited Game Wallpaper",
        description: "Mosha Game DAO にアクセスすることができる限定アイテムです",
        image: readFileSync("src/scripts/assets/NFT.jpg"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.log("failed to create the new NFT", error);
  }
})();