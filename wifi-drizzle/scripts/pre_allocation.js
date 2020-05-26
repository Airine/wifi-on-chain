const WiFiAllocation = artifacts.require("WiFiAllocation");

module.exports = function () {
    WiFiAllocation.deployed().then(instance=> {
        web3.eth.getAccounts().then(accounts=> {
            // function uponConnection(uint bandwidth, uint thresholdBid, uint burst) public payable onlyNotOwner {
            instance.uponConnection(30,1,0, {from:accounts[1], gas:3000000, value:1000000000}).then(() => {
                instance.uponConnection(10, 2, 0, {from: accounts[2], gas: 3000000, value: 1000000000});
            });
        });
    });
};