import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { MaxionNFTMarketplace } from "../typechain-types";
import { getImplementationAddress } from "@openzeppelin/upgrades-core";
import { BigNumber, utils, constants } from "ethers";
import _ from "lodash";

describe("NFT Marketplace test", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.

  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, admin, parameterSetter, platformTreasury, partner, seller, buyer, tradeHandler] = await ethers.getSigners();
    const totalFeePercent = "2000000000"; // 10%*10**8 (10**18-10**10) // Total fee 10%
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
      admin.address, // Admin address
    ])) as MaxionNFTMarketplace;

    await nftMarketplace.deployed();

    const nftMarketplaceImplAddress = await getImplementationAddress(
      ethers.provider,
      nftMarketplace.address
    );

    const FEE_DENOMINATOR = await nftMarketplace.FEE_DENOMINATOR();
    const DEFAULT_ADMIN_ROLE = await nftMarketplace.DEFAULT_ADMIN_ROLE();
    const PAUSER_ROLE = await nftMarketplace.PAUSER_ROLE();
    const PARAMETER_SETTER_ROLE = await nftMarketplace.PARAMETER_SETTER_ROLE();
    const TRADE_HANDLER_ROLE = await nftMarketplace.TRADE_HANDLER_ROLE();

    await nftMarketplace.connect(admin).grantRole(TRADE_HANDLER_ROLE, tradeHandler.address);
    await nftMarketplace.connect(admin).grantRole(PARAMETER_SETTER_ROLE, parameterSetter.address);
    

    return {
      nftMarketplace,
      nft,
      currencyToken,
      nftMarketplaceImplAddress,
      owner,
      admin,
      parameterSetter,
      platformTreasury,
      partner,
      seller,
      buyer,
      tradeHandler,
      totalFeePercent,
      platformFeePercent,
      partnerFeePercent,
      minimumTradePrice,
      FEE_DENOMINATOR,
      DEFAULT_ADMIN_ROLE,
      PAUSER_ROLE,
      PARAMETER_SETTER_ROLE,
      TRADE_HANDLER_ROLE
    };
  }

  describe("Deployment", () => {
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
        admin,
        tradeHandler,
        DEFAULT_ADMIN_ROLE,
        PAUSER_ROLE,
        PARAMETER_SETTER_ROLE,
        TRADE_HANDLER_ROLE
      } = await deployFixture();
      // Owner check
      expect(await nftMarketplace.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.eq(true);
      // Transaction handler check
      expect(await nftMarketplace.hasRole(TRADE_HANDLER_ROLE, tradeHandler.address)).to.be.eq(true);
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

  describe("Calculation test", () => {
    const calculationTest = async (data: {
      price: number,
      amount: number,
      totalFeePercent: number,
      platformFeePercent: number,
      partnerFeePercent: number,
    }) => {
      const { nftMarketplace, parameterSetter } = await deployFixture();

      await nftMarketplace.connect(parameterSetter).setTotalFeePercent(data.totalFeePercent * 10 ** 8);
      await nftMarketplace.connect(parameterSetter).setFeePercent(data.partnerFeePercent * 10 ** 8, data.platformFeePercent * 10 ** 8);

      const {
        totalPrice,
        totalFee,
        priceAfterFee,
        platformFee,
        partnerFee } = await nftMarketplace.calculatePriceAndFee(utils.parseEther(data.price.toString()), data.amount);

      const calTotalPrice = data.amount * data.price;
      expect(Number(utils.formatEther(totalPrice))).to.be.closeTo(calTotalPrice, 1);
      const calTotalFee = (calTotalPrice * data.totalFeePercent) / 100;
      expect(Number(utils.formatEther(totalFee))).to.be.closeTo(calTotalFee, 1);
      const calPriceAfterFee = calTotalPrice - calTotalFee;
      expect(Number(utils.formatEther(priceAfterFee))).to.be.closeTo(calPriceAfterFee, 1);
      const calPlatformFee = (calTotalFee * data.platformFeePercent) / 100;
      expect(Number(utils.formatEther(platformFee))).to.be.closeTo(calPlatformFee, 1);
      const calPartnerFee = (calTotalFee * data.partnerFeePercent) / 100;
      expect(Number(utils.formatEther(partnerFee))).to.be.closeTo(calPartnerFee, 1);
    }

    it("Can calculation 20 times with random data", async (numberOfTest: number = 20) => {
      for (let index = 0; index < numberOfTest; index++) {
        const platformFeePercent = _.random(1, 99);
        const partnerFeePercent = 100 - platformFeePercent;
        await calculationTest({
          price: _.random(1, 100_000_000),
          amount: _.random(1, 100_000_000),
          totalFeePercent: _.random(1, 99),
          platformFeePercent,
          partnerFeePercent,
        });
      }
    });
  });

  describe("Trade test", () => {
    /**
     * This test will cover all tradeable modifier and test setMinimumTradePrice function too
     * 1) Check seller insufficient NFT amount
     * 2) Check seller does not approve NFT yet
     * 3) Check Buyer insufficient allowance
     * 4) Check buyer insufficient balance
     * 5) Check mininum trade price
     */
    it("Must error validation not pass tradable modifier", async () => {
      const { nftMarketplace, currencyToken, nft, parameterSetter, buyer, seller, platformTreasury, partner, tradeHandler } = await deployFixture();
      // Check seller insufficient NFT amount
      await expect(nftMarketplace.connect(tradeHandler).trade(seller.address, buyer.address, 1, 1, utils.parseEther("100"), false)).to.be.revertedWith("Seller insufficient NFT amount");
      // Mint NFT to seller
      await nft.mint(seller.address, 1, 1, constants.HashZero);
      // Check seller does not approve NFT yet
      await expect(nftMarketplace.connect(tradeHandler).trade(seller.address, buyer.address, 1, 1, utils.parseEther("100"), false)).to.be.revertedWith("Seller does not approve NFT yet");
      // Seller approve NFT to marketplace
      await nft.connect(seller).setApprovalForAll(nftMarketplace.address, true);
      // Check Buyer insufficient allowance
      await expect(nftMarketplace.connect(tradeHandler).trade(seller.address, buyer.address, 1, 1, utils.parseEther("100"), false)).to.be.revertedWith("Buyer insufficient allowance");
      await currencyToken.connect(buyer).approve(nftMarketplace.address, constants.MaxUint256);
      // Check buyer insufficient balance
      await expect(nftMarketplace.connect(tradeHandler).trade(seller.address, buyer.address, 1, 1, utils.parseEther("100"), false)).to.be.revertedWith("Buyer insufficient balance");
      // Mint currency token to buyer
      await currencyToken.mint(buyer.address, utils.parseEther("100"));
      // Check mininum trade price
      await nftMarketplace.connect(parameterSetter).setMinimumTradePrice(utils.parseEther("1000"));
      await expect(nftMarketplace.connect(tradeHandler).trade(seller.address, buyer.address, 1, 1, utils.parseEther("100"), false)).to.be.revertedWith("Total price must be >= minimum trade price");
      await nftMarketplace.connect(parameterSetter).setMinimumTradePrice(utils.parseEther("100"));
      // All operation pass
      await nftMarketplace.connect(tradeHandler).trade(seller.address, buyer.address, 1, 1, utils.parseEther("100"), false);
    });

    const tradeTest = async (tradeData: {
      nftId: number, price: number, amountToSell: number, amountToBuy: number
    }) => {
      const { nftMarketplace, currencyToken, nft, buyer, seller, platformTreasury, partner, tradeHandler } = await deployFixture();
      const {
        priceAfterFee,
        platformFee,
        partnerFee } = await nftMarketplace.calculatePriceAndFee(utils.parseEther(tradeData.price.toString()), tradeData.amountToBuy);
      // Mint currency token to buyer
      await currencyToken.mint(buyer.address, utils.parseEther((tradeData.price * tradeData.amountToBuy).toString()));
      // Mint NFT to seller
      await nft.mint(seller.address, tradeData.nftId, tradeData.amountToSell, constants.HashZero);
      // Buyer approve currency token to marketplace
      await currencyToken.connect(buyer).approve(nftMarketplace.address, constants.MaxUint256);
      // Seller approve NFT to marketplace
      await nft.connect(seller).setApprovalForAll(nftMarketplace.address, true);
      await nftMarketplace.connect(tradeHandler).trade(seller.address, buyer.address, tradeData.nftId, tradeData.amountToBuy, utils.parseEther(tradeData.price.toString()), false);
      expect(await currencyToken.balanceOf(buyer.address)).to.be.eq(constants.Zero);
      expect(await currencyToken.balanceOf(seller.address)).to.be.eq(priceAfterFee);
      expect(await currencyToken.balanceOf(platformTreasury.address)).to.be.eq(platformFee);
      expect(await currencyToken.balanceOf(partner.address)).to.be.eq(partnerFee);
      const amountLeft = tradeData.amountToSell - tradeData.amountToBuy;
      expect(await nft.balanceOf(seller.address, tradeData.nftId)).to.be.eq(amountLeft);
      expect(await nft.balanceOf(buyer.address, tradeData.nftId)).to.be.eq(tradeData.amountToBuy);
    }
    it("Can trade 20 times with random data", async (numberOfTest: number = 20) => {
      for (let index = 0; index < numberOfTest; index++) {
        const amountToSell = _.random(1, 100_000_000);
        await tradeTest({
          nftId: _.random(1, 100_000_000),
          price: _.random(1, 100_000_000),
          amountToSell,
          amountToBuy: _.random(1, amountToSell)
        });
      }
    });

  });


});
