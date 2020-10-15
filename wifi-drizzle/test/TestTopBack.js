const WiFiAllocation = artifacts.require("WiFiAllocation");

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

contract("WiFiAllocation", accounts=> {
    it('The total bandwidth should be 50 MB/s.', async () => {
        const instance = await WiFiAllocation.deployed();
    
        const totalBandwidth = await instance.totalBandwidth.call();
    
        assert.equal(totalBandwidth,50,"The total bandwidth should be 50 MB/s.");
    });

    it('The owner should be the account[0].', async () => {
        const instance = await WiFiAllocation.deployed();
        const owner = await instance.owner.call();
        assert.equal(owner, accounts[0], "Wrong owner!");
    });

    it('The userID should be 1.', async () => {
        const instance = await WiFiAllocation.deployed();
        await instance.uponConnection(20,5,0, {from:accounts[1], gas:1000000, value:1});
        const userID = await instance.getUserID.call(accounts[1]);
        const bandwidth = await instance.getUserAllocation.call(userID-1);
        const balance = await instance.getUserBalance.call(userID-1);
        
        assert.equal(userID, 1, "The user ID should be 1.");
        assert.equal(bandwidth, 20, "The allocated bandwidth should be 20MB/s");
        assert.equal(balance, 1000000, "The balace should be 1000000.");
    });

    it('The balance should be collected.', async () => {
        const instance = await WiFiAllocation.deployed();
        await instance.uponConnection(20,5,0, {from:accounts[1], gas:1000000, value:1});
        await instance.performAllocation.call();
        const userID = await instance.getUserID.call(accounts[1]);
        const bandwidth = await instance.getUserAllocation.call(userID-1);
        const balance = await instance.getUserBalance.call(userID-1);
        await sleep(2000);
        await instance.updateBalance.call();
        const newBalance = await instance.getUserBalance.call(userID-1);
        console.log(String(bandwidth));
        console.log(String(balance), String(newBalance));
        assert(userID, 1);
        assert(balance, newBalance);
    });

})