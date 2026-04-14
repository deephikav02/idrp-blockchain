const hre = require("hardhat");

async function main() {
  const RepairPassport = await hre.ethers.deployContract("RepairPassport");
  await RepairPassport.waitForDeployment();

  console.log(`RepairPassport deployed to: ${await RepairPassport.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
