import sdk from "./1-initialize-sdk.js";

const editionDrop = sdk.getContract("0xf2FF744A826Ea1c33cC5C0Be0e48ca2959493760", "edition-drop");

const token = sdk.getContract("0x0618698652b69adeBAfbaA1dCa4Bfe55BD101D49", "token");

(async () => {
  try {
    const walletAddresses = await (await editionDrop).history.getAllClaimerAddresses(0);

    if (walletAddresses.length === 0) {
      console.log(
        "No NFTs have been claimed yet, maybe get some friends to claim your free NFTs!",
      );
      process.exit(0)
    }

    const airdropTargets = walletAddresses.map((address) => {
      const randomAmount = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
      console.log("✅ Going to airdrop", randomAmount, "tokens to", address);
      
      const airdropTarget = {
        toAddress: address,
        amount: randomAmount,
      };

      return airdropTarget;
    });
    console.log("🌈 Starting airdrop...");
    await (await token).transferBatch(airdropTargets);
    console.log("✅ Successfully airdropped tokens to all the holders of the NFT!");
  } catch (err) {
    console.error("Failed to airdrop tokens", err);
  }
})();