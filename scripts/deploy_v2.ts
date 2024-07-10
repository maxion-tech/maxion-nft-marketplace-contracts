import hre, { ethers } from "hardhat";
import { utils } from "ethers";

async function main() {
  // Environment variable validation
  const { NFT_ADDRESS, CURRENCY_TOKEN_ADDRESS, PLATFORM_TREASURY_ADDRESS, ADMIN_ADDRESS, TRADING_FEE_ADDRESS } = process.env;

  if (!NFT_ADDRESS || !CURRENCY_TOKEN_ADDRESS || !PLATFORM_TREASURY_ADDRESS || !ADMIN_ADDRESS || !TRADING_FEE_ADDRESS) throw new Error("Environment variable not valid");

  const minimumTradePrice = utils.parseEther("3");

  const feePercentage = "1000000000"; // 10%*10**8 (10**18-10**10) // 10%
  const fixedFee = utils.parseEther("1");

  const NFTMarketplace = await ethers.getContractFactory(
    "MaxionNFTMarketplaceV2",
  );

  const nftMarketplace = await NFTMarketplace.deploy(NFT_ADDRESS, // NFT address
    CURRENCY_TOKEN_ADDRESS, // Currency token address
    PLATFORM_TREASURY_ADDRESS, // Platform treasury wallet addfress
    TRADING_FEE_ADDRESS, // Trading fee wallet address
    feePercentage, // Trading fees
    fixedFee, // Platform tresury fee,
    minimumTradePrice, // Minimum trade price
    ADMIN_ADDRESS); // Admin address

  await nftMarketplace.deployed();

  console.log(`Maxion NFT Marketplace deployed to: ${nftMarketplace.address}`);

  // verify contract
  await hre.run("verify:verify", {
    address: nftMarketplace.address,
    contract: "contracts/MaxionNFTMarketplaceV2/MaxionNFTMarketplaceV2.sol:MaxionNFTMarketplaceV2",
    constructorArguments: [NFT_ADDRESS, CURRENCY_TOKEN_ADDRESS, PLATFORM_TREASURY_ADDRESS, TRADING_FEE_ADDRESS, feePercentage, fixedFee, minimumTradePrice, ADMIN_ADDRESS],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
