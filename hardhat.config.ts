import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ledger";

const config: HardhatUserConfig = {
  solidity: "0.8.7",
  networks: {
    bscTestnet: {
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY as string] : [],
      chainId: 97,
      url: process.env.BSC_TESTNET_URL || ""
    },
    bsc: {
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY as string] : [],
      chainId: 56,
      url: process.env.BSC_MAINNET_URL || ""
    },
    maxiTestnet: {
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY as string] : [],
      chainId: 898,
      url: process.env.MAXI_TESTNET_URL || "https://rpc-testnet.maxi.network",
    },
    maxiTestnetHW: {
      chainId: 898,
      url: process.env.MAXI_TESTNET_URL || "https://rpc-testnet.maxi.network",
      ledgerAccounts: process.env.LEDGER_ACCOUNT ? [process.env.LEDGER_ACCOUNT] : [],
    },
    maxiMainnet: {
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY as string] : [],
      chainId: 899,
      url: process.env.MAXI_MAINNET_URL || "https://rpc.maxi.network",
    },
    maxiMainnetHW: {
      chainId: 899,
      url: process.env.MAXI_MAINNET_URL || "https://rpc.maxi.network",
      ledgerAccounts: process.env.LEDGER_ACCOUNT ? [process.env.LEDGER_ACCOUNT] : [],
    },
  },
  etherscan: {
    apiKey: {
      bscTestnet: process.env.ETHERSCAN_API_KEY as string,
      bsc: process.env.ETHERSCAN_API_KEY as string,
      maxiTestnetHW: process.env.ETHERSCAN_API_KEY as string,
      maxiMainnetHW: process.env.ETHERSCAN_API_KEY as string,
    },
    customChains: [
      {
        network: "maxiTestnetHW",
        chainId: 898,
        urls: {
          apiURL: "https://testnet.maxi.network/api",
          browserURL: "https://testnet.maxi.network/"
        }
      },
      {
        network: "maxiMainnetHW",
        chainId: 899,
        urls: {
          apiURL: "https://mainnet.maxi.network/api",
          browserURL: "https://mainnet.maxi.network/"
        }
      }
    ]
  }
};

export default config;
