import sdk from "./1-initialize-sdk.js";
import { ethers } from "ethers";

const vote = sdk.getContract("0x38F03A3143041E85E56D2287b5A47Ae20DcD9b06", "vote");

const token = sdk.getContract("0x0618698652b69adeBAfbaA1dCa4Bfe55BD101D49", "token");

(async () => {
  try {
    const amount = 420_000;
    const description = "Should the DAO mint an additional " + amount + " tokens into the treasury?";
    const executions = [
      {
        toAddress: (await token).getAddress(),
        nativeTokenValue: 0,
        transactionData: (await token).encoder.encode(
          "mintTo", [
            (await vote).getAddress(),
            ethers.utils.parseUnits(amount.toString(), 18),
          ]
        ),
      }
    ];

    await (await vote).propose(description, executions);
    console.log("✅ Successfully created proposal to mint tokens");
  } catch (error) {
    console.error("failed to create first proposal", error);
    process.exit(1);
  }

  try {
    const amount = 6_900;
    const description = "Should the DAO transfer " + amount + " tokens from the treasury to " + process.env.WALLET_ADDRESS + " for being awesome?";
    const executions = [
      {
        nativeTokenValue: 0,
        transactionData: (await token).encoder.encode(
          "transfer",
          [
            process.env.WALLET_ADDRESS!,
            ethers.utils.parseUnits(amount.toString(), 18),
          ]
        ),
        toAddress: (await token).getAddress(),
      },
    ];

    await (await vote).propose(description, executions);

    console.log(
      "✅ Successfully created proposal to reward ourselves from the treasury, let's hope people vote for it!"
    );
  } catch (error) {
    console.error("failed to create second proposal", error);
  }
})();