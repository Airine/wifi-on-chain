const WiFiAllocation = artifacts.require("WiFiAllocation");

module.exports = function () {
    WiFiAllocation.deployed().then(instance=> {
        instance.uponConnection(20,10,0, {from:'0x0cbbb79b02449ea575f6185dd3c541e9ab8d8182', gas:3000000, value:1000000000});
    });
};