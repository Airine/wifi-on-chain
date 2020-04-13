const WiFiAllocation = artifacts.require("WiFiAllocation");

module.exports = function () {
    WiFiAllocation.deployed().then(instance=> {
        instance.uponConnection(20,10,0, {from:'0x3f10927D1Be4d3e8253277cd394bd7e3E953C7aB', gas:3000000, value:1000000000});
    });
};