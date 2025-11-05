const hre = require("hardhat");

async function main() {
  console.log("Deploying Lending contract...");

  const Lending = await hre.ethers.getContractFactory("Lending");
  const lending = await Lending.deploy();

  await lending.waitForDeployment();

  const address = await lending.getAddress();
  console.log("Lending contract deployed to:", address);
  console.log("\nUpdate CONTRACT_ADDRESS in app/page.tsx to:", address);

  // Fund the contract with some ETH for borrowing
  const [deployer] = await hre.ethers.getSigners();
  const fundTx = await deployer.sendTransaction({
    to: address,
    value: hre.ethers.parseEther("100")
  });
  await fundTx.wait();
  console.log("\nContract funded with 100 ETH for lending pool");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
