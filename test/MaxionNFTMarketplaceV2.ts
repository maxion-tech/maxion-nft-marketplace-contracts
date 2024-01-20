import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { utils, constants, BigNumber } from "ethers";
import _ from "lodash";

describe("NFT Marketplace V2 test", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.

  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, admin, parameterSetter, platformTreasuryWallet, tradingFeeWallet, seller, buyer, receiver, tradeHandler] = await ethers.getSigners();
    const minimumTradePrice = utils.parseEther("3");

    const feePercentage = "1000000000"; // 10%*10**8 (10**18-10**10) // 10%
    const fixedFee = utils.parseEther("1");

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
      "MaxionNFTMarketplaceV2"
    );

    const nftMarketplace = await NFTMarketplace.deploy(nft.address, // NFT address
      currencyToken.address, // Currency token address
      platformTreasuryWallet.address, // Platform treasury wallet addfress
      tradingFeeWallet.address, // Trading fee wallet address
      feePercentage, // Trading fee
      fixedFee, // Platform tresury fee,
      minimumTradePrice, // Minimum trade price
      admin.address); // Admin address

    await nftMarketplace.deployed();

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
      owner,
      admin,
      parameterSetter,
      platformTreasuryWallet,
      tradingFeeWallet,
      seller,
      buyer,
      receiver,
      tradeHandler,
      feePercentage,
      fixedFee,
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
        feePercentage,
        fixedFee,
      } = await deployFixture();
      expect(await nftMarketplace.feePercentage()).to.be.eq(feePercentage);
      expect(await nftMarketplace.fixedFee()).to.be.eq(fixedFee);
    });

    it("Minimum trade price must be correct", async () => {
      const {
        nftMarketplace,
        minimumTradePrice,
      } = await deployFixture();
      expect(await nftMarketplace.minimumTradePrice()).to.be.eq(minimumTradePrice);
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
        platformTreasuryWallet,
        tradingFeeWallet,
      } = await deployFixture();
      expect(await nftMarketplace.platformTreasuryWallet()).to.be.eq(platformTreasuryWallet.address);
      expect(await nftMarketplace.tradingFeeWallet()).to.be.eq(tradingFeeWallet.address);
    });
  });

  describe("Calculation test", () => {
    const calculationTest = async (data: {
      minimumTradePrice: BigNumber,
      price: BigNumber,
      amount: BigNumber,
      feePercentage: number,
      fixedFee: BigNumber,
    }) => {
      const { nftMarketplace, parameterSetter } = await deployFixture();

      await nftMarketplace.connect(parameterSetter).setMinimumTradePrice(data.minimumTradePrice);
      await nftMarketplace.connect(parameterSetter).setFees(data.feePercentage * 10 ** 8, data.fixedFee);

      const { totalPrice, percentageFee, totalFee, netAmount } = await nftMarketplace.calculateTradeDetails(data.price, data.amount);

      expect(totalPrice).to.be.eq(data.price.mul(data.amount));
      expect(percentageFee).to.be.eq(data.price.mul(data.amount).mul(data.feePercentage).div(100));
      expect(totalFee).to.be.eq(data.price.mul(data.amount).mul(data.feePercentage).div(100).add(data.fixedFee));
      expect(netAmount).to.be.eq(data.price.mul(data.amount).sub(data.price.mul(data.amount).mul(data.feePercentage).div(100)).sub(data.fixedFee));
    }

    it("Can calculation 20 times with random data", async (numberOfTest: number = 20) => {
      for (let index = 0; index < numberOfTest; index++) {

        const minimumTradePrice = utils.parseEther(_.random(1, 100).toString());
        const price = utils.parseEther(_.random(Number(ethers.utils.formatEther(minimumTradePrice)), Number(ethers.utils.formatEther(minimumTradePrice)) + 100_000_000).toString());
        const amount = utils.parseEther(_.random(1, 100_000_000).toString());
        const feePercentage = _.random(1, 100);
        const fixedFee = feePercentage === 100 ? ethers.BigNumber.from(0) : utils.parseEther(_.random(0, Number(ethers.utils.formatEther(minimumTradePrice)) - 1).toString());

        await calculationTest({
          minimumTradePrice,
          price,
          amount,
          feePercentage,
          fixedFee,
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
      const { nftMarketplace, currencyToken, nft, parameterSetter, buyer, seller, platformTreasuryWallet, tradingFeeWallet, tradeHandler } = await deployFixture();

      // Check seller insufficient NFT amount
      await expect(nftMarketplace.connect(tradeHandler).trade(seller.address, buyer.address, buyer.address, 1, 1, utils.parseEther("100"), false)).to.be.revertedWith("Seller insufficient NFT amount");

      // Mint NFT to seller
      await nft.mint(seller.address, 1, 1, constants.HashZero);

      // Check seller does not approve NFT yet
      await expect(nftMarketplace.connect(tradeHandler).trade(seller.address, buyer.address, buyer.address, 1, 1, utils.parseEther("100"), false)).to.be.revertedWith("Seller does not approve NFT yet");

      // Seller approve NFT to marketplace
      await nft.connect(seller).setApprovalForAll(nftMarketplace.address, true);

      // Check Buyer insufficient allowance
      await expect(nftMarketplace.connect(tradeHandler).trade(seller.address, buyer.address, buyer.address, 1, 1, utils.parseEther("100"), false)).to.be.revertedWith("Buyer insufficient allowance");

      await currencyToken.connect(buyer).approve(nftMarketplace.address, constants.MaxUint256);

      // Check buyer insufficient balance
      await expect(nftMarketplace.connect(tradeHandler).trade(seller.address, buyer.address, buyer.address, 1, 1, utils.parseEther("100"), false)).to.be.revertedWith("Buyer insufficient balance");

      // Mint currency token to buyer
      await currencyToken.mint(buyer.address, utils.parseEther("100"));

      // Check mininum trade price
      await nftMarketplace.connect(parameterSetter).setMinimumTradePrice(utils.parseEther("1000"));
      await expect(nftMarketplace.connect(tradeHandler).trade(seller.address, buyer.address, buyer.address, 1, 1, utils.parseEther("100"), false)).to.be.revertedWith("Total price must be >= minimum trade price");
      await nftMarketplace.connect(parameterSetter).setMinimumTradePrice(utils.parseEther("100"));

      // All operation pass
      await nftMarketplace.connect(tradeHandler).trade(seller.address, buyer.address, buyer.address, 1, 1, utils.parseEther("100"), false);
    });

    const tradeTest = async (tradeData: {
      nftId: number,
      price: BigNumber,
      amountToSell: number,
      amountToBuy: number
    }) => {
      const { nftMarketplace, currencyToken, nft, buyer, seller, platformTreasuryWallet, tradingFeeWallet, tradeHandler, fixedFee } = await deployFixture();

      const { totalPrice, percentageFee, totalFee, netAmount } = await nftMarketplace.calculateTradeDetails(tradeData.price, tradeData.amountToBuy);

      // Mint currency token to buyer
      await currencyToken.mint(buyer.address, tradeData.price.mul(tradeData.amountToBuy));

      // Mint NFT to seller
      await nft.mint(seller.address, tradeData.nftId, tradeData.amountToSell, constants.HashZero);

      // Buyer approve currency token to marketplace
      await currencyToken.connect(buyer).approve(nftMarketplace.address, constants.MaxUint256);

      // Seller approve NFT to marketplace
      await nft.connect(seller).setApprovalForAll(nftMarketplace.address, true);
      await nftMarketplace.connect(tradeHandler).trade(seller.address, buyer.address, buyer.address, tradeData.nftId, tradeData.amountToBuy, tradeData.price, false);

      expect(await currencyToken.balanceOf(buyer.address)).to.be.eq(constants.Zero);
      expect(await currencyToken.balanceOf(seller.address)).to.be.eq(netAmount);
      expect(await currencyToken.balanceOf(platformTreasuryWallet.address)).to.be.eq(fixedFee);
      expect(await currencyToken.balanceOf(tradingFeeWallet.address)).to.be.eq(percentageFee);

      const amountLeft = tradeData.amountToSell - tradeData.amountToBuy;
      expect(await nft.balanceOf(seller.address, tradeData.nftId)).to.be.eq(amountLeft);
      expect(await nft.balanceOf(buyer.address, tradeData.nftId)).to.be.eq(tradeData.amountToBuy);
    }

    const tradeTestWithSentTo = async (tradeData: {
      nftId: number,
      price: BigNumber,
      amountToSell: number,
      amountToBuy: number,
    }) => {
      const { nftMarketplace, currencyToken, nft, buyer, seller, receiver, platformTreasuryWallet, tradingFeeWallet, tradeHandler, fixedFee } = await deployFixture();

      const { totalPrice, percentageFee, totalFee, netAmount } = await nftMarketplace.calculateTradeDetails(tradeData.price, tradeData.amountToBuy);

      // Mint currency token to buyer
      await currencyToken.mint(buyer.address, tradeData.price.mul(tradeData.amountToBuy));

      // Mint NFT to seller
      await nft.mint(seller.address, tradeData.nftId, tradeData.amountToSell, constants.HashZero);

      // Buyer approve currency token to marketplace
      await currencyToken.connect(buyer).approve(nftMarketplace.address, constants.MaxUint256);

      // Seller approve NFT to marketplace
      await nft.connect(seller).setApprovalForAll(nftMarketplace.address, true);
      await nftMarketplace.connect(tradeHandler).trade(seller.address, buyer.address, receiver.address, tradeData.nftId, tradeData.amountToBuy, tradeData.price, false);

      expect(await currencyToken.balanceOf(buyer.address)).to.be.eq(constants.Zero);
      expect(await currencyToken.balanceOf(seller.address)).to.be.eq(netAmount);
      expect(await currencyToken.balanceOf(platformTreasuryWallet.address)).to.be.eq(fixedFee);
      expect(await currencyToken.balanceOf(tradingFeeWallet.address)).to.be.eq(percentageFee);

      const amountLeft = tradeData.amountToSell - tradeData.amountToBuy;
      expect(await nft.balanceOf(seller.address, tradeData.nftId)).to.be.eq(amountLeft);
      expect(await nft.balanceOf(receiver.address, tradeData.nftId)).to.be.eq(tradeData.amountToBuy);
    }

    it("Can trade price of 100", async () => {
      await tradeTest({
        nftId: _.random(1, 100_000_000),
        price: utils.parseEther((100).toString()),
        amountToSell: 1,
        amountToBuy: 1,
      });
    });

    it("Can trade price of 100 with sent to", async () => {
      await tradeTestWithSentTo({
        nftId: _.random(1, 100_000_000),
        price: utils.parseEther((100).toString()),
        amountToSell: 1,
        amountToBuy: 1,
      });
    });

    it("Can trade 20 times with random data", async (numberOfTest: number = 20) => {
      for (let index = 0; index < numberOfTest; index++) {
        const amountToSell = _.random(1, 100_000_000);
        await tradeTest({
          nftId: _.random(1, 100_000_000),
          price: utils.parseEther(_.random(1, 100_000_000).toString()),
          amountToSell: amountToSell,
          amountToBuy: _.random(1, amountToSell)
        });
      }
    });

    it("Can trade 20 times with random data with sent to", async (numberOfTest: number = 20) => {
      for (let index = 0; index < numberOfTest; index++) {
        const amountToSell = _.random(1, 100_000_000);
        await tradeTestWithSentTo({
          nftId: _.random(1, 100_000_000),
          price: utils.parseEther(_.random(1, 100_000_000).toString()),
          amountToSell: amountToSell,
          amountToBuy: _.random(1, amountToSell)
        });
      }
    });
  });

});
