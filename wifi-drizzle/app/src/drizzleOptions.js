import Web3 from "web3";
import WifiAllocation from "./contracts/WifiAllocation.json"

// const ip = '192.168.1.140'; // ip address of raspberry pi
const ip = '192.168.1.27'; // development

const options = {
    web3: {
        httpProvider: new Web3(new Web3.providers.HttpProvider('http://'+ip+':8545')),
        block: false,
        customProvider: new Web3('ws://'+ip+':8546')
    },
    contracts: [WifiAllocation],
};

export default options;
