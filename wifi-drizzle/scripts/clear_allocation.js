const WiFiAllocation = artifacts.require("WiFiAllocation");

module.exports = function () {
    WiFiAllocation.deployed().then(instance=> {
        web3.eth.getAccounts().then(accounts=> {
            console.log('owner:', accounts[0]);
            instance.uponConnection(0,0,0, {from:accounts[1], gas:3000000});
            instance.uponConnection(0,0,0, {from:accounts[2], gas:3000000});
            instance.uponConnection(0,0,0, {from:accounts[3], gas:3000000});
            instance.uponConnection(0,0,0, {from:accounts[4], gas:3000000});
            instance.uponConnection(0,0,0, {from:accounts[5], gas:3000000});
            instance.uponConnection(0,0,0, {from:accounts[6], gas:3000000});
        });
    });
};