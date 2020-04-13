const WiFiAllocation = artifacts.require("WiFiAllocation");

module.exports = function () {
    WiFiAllocation.deployed().then(instance => {
        instance.numUsers.call().then(res => {
            let num = parseInt(res);
            console.log(num);
        });
    });
};