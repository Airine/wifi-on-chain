const WifiAllocation = artifacts.require("WifiAllocation");

module.exports = function(deployer) {
    // _totalBandwidth: 50, _minPrice: 1, _burstPrice: 1
    deployer.deploy(WifiAllocation, 50, 1, 1, {
        from: '0x0cbbb79b02449ea575f6185dd3c541e9ab8d8182',
        overwrite: true
    });

};
