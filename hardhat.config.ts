import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-ledger";

const config: HardhatUserConfig = {
  solidity: "0.8.7",
  networks: {
    bscTestnet: {
      chainId: 97,
      url: process.env.BSC_TESTNET_URL || "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY as string] : [],
    },
    bscTestnetHW: {
      chainId: 97,
      url: process.env.BSC_TESTNET_URL || "https://data-seed-prebsc-1-s1.binance.org:8545/",
      ledgerAccounts: process.env.LEDGER_ACCOUNT ? [process.env.LEDGER_ACCOUNT] : [],
      gasPrice: 10000000000,
    },
    bscMainnet: {
      chainId: 56,
      url: process.env.BSC_MAINNET_URL || "https://bsc-dataseed.binance.org/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY as string] : [],
    },
    bscMainnetHW: {
      chainId: 56,
      url: process.env.BSC_MAINNET_URL || "https://bsc-dataseed.binance.org/",
      ledgerAccounts: process.env.LEDGER_ACCOUNT ? [process.env.LEDGER_ACCOUNT] : [],
    },
  },
  etherscan: {
    apiKey: {
      bscTestnet: process.env.ETHERSCAN_API_KEY as string,
      bsc: process.env.ETHERSCAN_API_KEY as string
    }
  }
};

export default config;
