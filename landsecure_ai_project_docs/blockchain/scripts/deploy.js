const hre = require("hardhat");

async function main() {
  const Registry = await hre.ethers.getContractFactory("LandRecordRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const address = await registry.getAddress();
  console.log("LandRecordRegistry deployed to:", address);
  const fs = require("fs");
  fs.writeFileSync("deployed_address.txt", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
