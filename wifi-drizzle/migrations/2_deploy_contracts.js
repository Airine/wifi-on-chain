const WifiAllocation = artifacts.require("WifiAllocation");

module.exports = function(deployer) {
    // _totalBandwidth: 50, _minPrice: 1, _burstPrice: 1
    
    deployer.deploy(WifiAllocation, 30, 1, 1, {
        from: '0x0cbbb79b02449ea575f6185dd3c541e9ab8d8182',
        // from: '0xBfe977EfAc7e414A7a441f3be640aa42ed514093',
        overwrite: true
    });

};
