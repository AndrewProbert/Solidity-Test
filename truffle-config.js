require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

const private_keys = [
  process.env.PRIVATE_KEY_0,
  process.env.PRIVATE_KEY_1,
];

module.exports = {
  networks: {
    sepolia: {
      provider: () => new HDWalletProvider({
        privateKeys: private_keys,
        providerOrUrl: "https://sepolia.infura.io/v3/b931e338739a41d7a537c683bb2f21d5",
        numberOfAddresses: 2,
      }),
      network_id: 11155111, // Modify the network id here
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 500, // Increased from 200
      skipDryRun: true,
      networkCheckTimeout: 1000000, // Increased from default 10000
    },
  },
  mocha: {},
  compilers: {
    solc: {
      version: "0.8.21",
    },
  },
};
