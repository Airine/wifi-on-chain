const path = require("path");
const Web3 = require("web3");
// const HDWalletProvider = require("truffle-hdwallet-provider");
//
// var mnemonic = "mountains supernatural bird ...";
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "app/src/contracts"),
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: "*",
      gas:0,
    },
    pow: {
      host: 'localhost',
      port: 7545,
      network_id: "*",
    },
    pi: {
      host: '192.168.1.140',
      port: 8545,
      network_id: "*",
      gas:0,
    }
  }
};
