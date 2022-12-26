import sdk from "./1-initialize-sdk.js";

const vote = sdk.getContract("0x38F03A3143041E85E56D2287b5A47Ae20DcD9b06", "vote");

const token = sdk.getContract("0x0618698652b69adeBAfbaA1dCa4Bfe55BD101D49", "token");

(async () => {
  try {
    await (await token).roles.grant("minter", (await vote).getAddress());

    console.log(
      "Successfully gave vote contract permissions to act on token contract"
    );
  } catch (error) {
    console.error(
      "failed to grant vote contract permissions on token contract",
      error
    );
    process.exit(1);
  }

  try {
    const ownedTokenBalance = await (await token).balanceOf(
      process.env.WALLET_ADDRESS!
    );

    const ownedAmount = ownedTokenBalance.displayValue;
    const percent90 = Number(ownedAmount) / 100 * 90;

    await (await token).transfer(
      (await vote).getAddress(),
      percent90
    );

    console.log("✅ Successfully transferred " + percent90 + " tokens to vote contract");
  } catch (err) {
    console.error("failed to transfer tokens to vote contract", err);
  }
})();