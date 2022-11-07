import { ethers, upgrades } from "hardhat";
import { utils } from "ethers";
import { getImplementationAddress } from "@openzeppelin/upgrades-core";
import { MaxionNFTMarketplace } from "../typechain-types";

async function main() {
  // Environment variable validation
  const { NFT_ADDRESS, CURRENCY_TOKEN_ADDRESS, PLATFORM_TREASURY_ADDRESS, PARTNER_ADDRESS } = process.env;

  if (!NFT_ADDRESS || !CURRENCY_TOKEN_ADDRESS || !PLATFORM_TREASURY_ADDRESS || !PARTNER_ADDRESS) throw new Error("Environment variable not valid");

  const totalFeePercent = "1000000000"; // 10%*10**8 (10**18-10**10) // Total fee 10%
  const platformFeePercent = "6000000000"; // 60%*10**8 (10**18-10**10)
  const partnerFeePercent = "4000000000"; // 40%*10**8 (10**18-10**10)
  const minimumTradePrice = utils.parseEther("1");

  const NFTMarketplace = await ethers.getContractFactory(
    "MaxionNFTMarketplace"
  );

  const nftMarketplace = (await upgrades.deployProxy(NFTMarketplace, [
    NFT_ADDRESS, // NFT address
    CURRENCY_TOKEN_ADDRESS, // Currency token address
    PLATFORM_TREASURY_ADDRESS, // Platform treasury wallet addfress
    PARTNER_ADDRESS, // Partner wallet address
    totalFeePercent, // Total fee percent,
    platformFeePercent, // Partner fee
    partnerFeePercent, // Platform fee,
    minimumTradePrice, // Minimum trade price
  ])) as MaxionNFTMarketplace;

  await nftMarketplace.deployed();

  const nftMarketplaceImplAddress = await getImplementationAddress(
    ethers.provider,
    nftMarketplace.address
  );

  console.log(`Maxion NFT Marketplace deployed to: ${nftMarketplace.address}`);
  console.log(`Implementation address is: ${nftMarketplaceImplAddress}`);
  console.log(`Verify contract by command: npx hardhat verify ${nftMarketplace.address} --network ??`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
