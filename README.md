# 🎨 Maxion NFT Marketplace V2

`MaxionNFTMarketplaceV2` is a smart contract developed on the Ethereum blockchain using Solidity. This contract facilitates the secure trading of ERC1155 NFTs in exchange for a specified ERC20 token.

## 🚀 Features:

- 🔐 Role-Based Access Control for administrative tasks, parameter updates, and trade handling.
- ⏸️ Pausable functionality to temporarily halt trading in emergency situations.
- 🔄 Supports safe ERC1155 transfers and ERC20 transfers using OpenZeppelin's libraries.
- 💸 Fees on trades, both fixed and percentage-based.
- 📦 Configurable fee beneficiaries.

## 🛠 Installation:

Make sure you have `hardhat` set up in your project.

### 📦 Dependencies:

To install necessary dependencies:
```bash
npm install @openzeppelin/contracts
```

## 📑 Contract Details:

### 🤝 Trade Handler (`TRADE_HANDLER_ROLE`):

The Trade Handler is a designated role within the contract, designed to oversee and execute trades between users. The inclusion of the `TRADE_HANDLER_ROLE` ensures trading activities are handled securely and are exclusively conducted by entities possessing this role. In essence, the trade handler serves as a mediator between the buyer and seller to ensure the safe exchange of NFTs for the stated ERC20 token.

Functions the trade handler can access:
- **trade()**: Facilitates the trade between a buyer and seller. The handler ensures both parties meet the necessary criteria, calculates associated fees, and oversees the asset transfers.

### 📈 Fee Denominator:

Represented as `FEE_DENOMINATOR`, this constant is integral for fee calculations. With a value of `10 ** 10` in this contract, its primary role is to support precise calculations without resorting to decimals. Since Ethereum smart contracts don't natively support floating-point arithmetic, the fee denominator is our solution to ensuring percentage-based fees are computed with utmost accuracy.

To demonstrate its use: to implement a 1% fee on a trade, you would assign `feePercentage` the value of `FEE_DENOMINATOR * 0.01`.

#### Note: all of fee is ?%*10**8 format example 10% is "1000000000"

## 📢 Events:

- **FeeUpdated**: Triggered when the percentage or fixed fee is updated.
- **MinimumTradePriceUpdated**: Emitted when the minimum trade price is adjusted.
- **Sold**: Logs trade details, including seller, buyer, and associated fees.

## 📚 Functions:

Detailing a few significant functions:

- **setFees**: Update the fee parameters.
- **setMinimumTradePrice**: Modify the minimum allowable trade price.
- **pause**: Temporarily halt all trading activities.
- **unpause**: Resume trading functionalities.

For a comprehensive list of functions and their descriptions, refer to the contract's code.

## 🧪 Development and Testing:

To compile the contract using hardhat:
```bash
npx hardhat compile
```

To run tests (assuming you have tests written):
```bash
npx hardhat test
```

## 🌐 Deployment:

Replace placeholders with actual values and use the following to deploy:
```bash
npx hardhat run --network bscTestnet scripts/deploy.ts
```

## ⚖️ License:

This contract uses the MIT license.

## 🛡️ Security:

For any security concerns or issues, please reach out to dev@maxion.tech.

## 🤲 Contribute:

For contributions, raise a PR or open an issue.

