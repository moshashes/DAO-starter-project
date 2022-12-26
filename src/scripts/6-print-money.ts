import sdk from "./1-initialize-sdk.js";

const token = sdk.getContract("0x0618698652b69adeBAfbaA1dCa4Bfe55BD101D49", "token");

(async () => {
  try {
    const amount = 1000000;
    await (await token).mint(amount);
    const totalSupply = await (await token).totalSupply();

    console.log(
      "✅ There now is",
      totalSupply.displayValue,
      "$MGT in circulation"
    );
  } catch (error) {
    console.error("Failed to print money", error);
  }
})();