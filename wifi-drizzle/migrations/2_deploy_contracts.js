const WifiAllocation = artifacts.require("WifiAllocation");

module.exports = function(deployer) {
    // _totalBandwidth: 50, _minPrice: 1, _burstPrice: 1
    
    deployer.deploy(WifiAllocation, 100, 1, 1, {
        from: '0x0671a40872727Ff3c610DD287e88c5b3672A6b30',
        // from: '0xBfe977EfAc7e414A7a441f3be640aa42ed514093',
        overwrite: true
    });

};
