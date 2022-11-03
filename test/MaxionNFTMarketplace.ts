import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { MaxionNFTMarketplace } from "../typechain-types";
import { getImplementationAddress } from "@openzeppelin/upgrades-core";
import { BigNumber, utils, constants } from "ethers";

describe("NFT Marketplace test", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.

  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, platformTreasury, partner, seller, buyer] = await ethers.getSigners();
    const totalFeePercent = "1000000000"; // 10%*10**8 (10**18-10**10) // Total fee 10%
    const platformFeePercent = "6000000000"; // 60%*10**8 (10**18-10**10)
    const partnerFeePercent = "4000000000"; // 40%*10**8 (10**18-10**10)
    const minimumTradePrice = utils.parseEther("1");

    const NFT = await ethers.getContractFactory("ERC1155Token");
    const nft = await NFT.deploy();
    await nft.deployed();

    const CurrencyToken = await ethers.getContractFactory("ERC20Token");
    const currencyToken = await CurrencyToken.deploy(
      "Currency Token",
      "CURRENCY"
    );
    await currencyToken.deployed();

    const NFTMarketplace = await ethers.getContractFactory(
      "MaxionNFTMarketplace"
    );

    const nftMarketplace = (await upgrades.deployProxy(NFTMarketplace, [
      nft.address, // NFT address
      currencyToken.address, // Currency token address
      platformTreasury.address, // Platform treasury wallet addfress
      partner.address, // Partner wallet address
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

    return {
      nftMarketplace,
      nft,
      currencyToken,
      nftMarketplaceImplAddress,
      owner,
      platformTreasury,
      partner,
      seller,
      buyer,
      totalFeePercent,
      platformFeePercent,
      partnerFeePercent,
      minimumTradePrice,
    };
  }

  describe("Deployment", function () {
    it("Currency and NFT must be correct", async () => {
      const {
        nftMarketplace,
        currencyToken,
        nft,
      } = await deployFixture();
      expect(await nftMarketplace.currencyContract()).to.be.eq(currencyToken.address);
      expect(await nftMarketplace.nft()).to.be.eq(nft.address);
    });

    it("Fee must be correct", async () => {
      const {
        nftMarketplace,
        totalFeePercent,
        platformFeePercent,
        partnerFeePercent,
      } = await deployFixture();
      expect(await nftMarketplace._totalFeePercent()).to.be.eq(totalFeePercent);
      expect(await nftMarketplace._platformFeePercent()).to.be.eq(platformFeePercent);
      expect(await nftMarketplace._partnerFeePercent()).to.be.eq(partnerFeePercent);
    });

    it("Minimum trade price must be correct", async () => {
      const {
        nftMarketplace,
        minimumTradePrice,
      } = await deployFixture();
      expect(await nftMarketplace._minimumTradePrice()).to.be.eq(minimumTradePrice);
    });

    it("Role has set correct", async () => {
      const {
        nftMarketplace,
        owner,
      } = await deployFixture();
      expect(await nftMarketplace.hasRole(await nftMarketplace.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.eq(true);
      expect(await nftMarketplace.hasRole(await nftMarketplace.PAUSER_ROLE(), owner.address)).to.be.eq(true);
      expect(await nftMarketplace.hasRole(await nftMarketplace.FEE_SETTER_ROLE(), owner.address)).to.be.eq(true);
    });

    it("Wallet address must be correct", async () => {
      const {
        nftMarketplace,
        platformTreasury,
        partner,
      } = await deployFixture();
      expect(await nftMarketplace.platformTreasury()).to.be.eq(platformTreasury.address);
      expect(await nftMarketplace.partner()).to.be.eq(partner.address);
    });

  });


});
