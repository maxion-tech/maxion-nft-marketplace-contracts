import hre, { ethers } from "hardhat";
import { utils } from "ethers";

async function main() {
  // Environment variable validation
  const { NFT_ADDRESS, CURRENCY_TOKEN_ADDRESS, PLATFORM_TREASURY_ADDRESS, PARTNER_ADDRESS, ADMIN_ADDRESS } = process.env;

  if (!NFT_ADDRESS || !CURRENCY_TOKEN_ADDRESS || !PLATFORM_TREASURY_ADDRESS || !PARTNER_ADDRESS || !ADMIN_ADDRESS) throw new Error("Environment variable not valid");

  const totalFeePercent = "2000000000"; // 10%*10**8 (10**18-10**10) // Total fee 10%
  const platformFeePercent = "5000000000"; // 60%*10**8 (10**18-10**10)
  const partnerFeePercent = "5000000000"; // 40%*10**8 (10**18-10**10)
  const minimumTradePrice = utils.parseEther("10");

  const NFTMarketplace = await ethers.getContractFactory(
    "MaxionNFTMarketplace",
  );

  const nftMarketplace = await NFTMarketplace.deploy(
    NFT_ADDRESS, // NFT address
    CURRENCY_TOKEN_ADDRESS, // Currency token address
    PLATFORM_TREASURY_ADDRESS, // Platform treasury wallet addfress
    PARTNER_ADDRESS, // Partner wallet address
    totalFeePercent, // Total fee percent,
    platformFeePercent, // Partner fee
    partnerFeePercent, // Platform fee,
    minimumTradePrice, // Minimum trade price
    ADMIN_ADDRESS); // Admin address

  await nftMarketplace.deployed();

  console.log(`Maxion NFT Marketplace deployed to: ${nftMarketplace.address}`);
  console.log(`Verify contract by command: npx hardhat verify ${nftMarketplace.address} ${NFT_ADDRESS} ${CURRENCY_TOKEN_ADDRESS} ${PLATFORM_TREASURY_ADDRESS} ${PARTNER_ADDRESS} ${totalFeePercent} ${platformFeePercent} ${partnerFeePercent} ${minimumTradePrice} ${ADMIN_ADDRESS} --network ${hre.network.name}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
