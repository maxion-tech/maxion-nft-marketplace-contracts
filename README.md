# Maxion NFT Marketplace Contracts

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
# Compile
npm run build
# Test
npm run test
```

Constructure required for deployment
- NFT contract address
- Currency contract address
- Platform treasury wallet address
- Partner wallet address
- Total fee percent (from each trade transaction)
- Platform fee percent (split from total fee percent)
- Partner fee percent (split from total fee percent)
- Mininum trade price (amount * price)


#### Note: all of fee is ?%*10**8 format example 10% is "1000000000"