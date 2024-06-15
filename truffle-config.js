require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const util = require("util");

const private_keys = [
  process.env.PRIVATE_KEY_0,
  process.env.PRIVATE_KEY_1,
];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

class DelayedProvider {
  constructor(provider, delayMs) {
    this.provider = provider;
    this.delayMs = delayMs;
  }

  send(...args) {
    const sendAsync = util.promisify(this.provider.send).bind(this.provider);
    return delay(this.delayMs).then(() => sendAsync(...args));
  }
}

module.exports = {
  networks: {
    sepolia: {
      provider: () => new DelayedProvider(new HDWalletProvider({
        privateKeys: private_keys,
        providerOrUrl: "https://sepolia.infura.io/v3/b931e338739a41d7a537c683bb2f21d5",
        numberOfAddresses: 2,
      }), 5000), // 5000 ms delay
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