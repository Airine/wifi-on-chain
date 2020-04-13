// const SimpleStorage = artifacts.require("SimpleStorage");
const WiFiAllocation = artifacts.require("WiFiAllocation");

contract("WiFiAllocation", accounts=>{
  it('The total bandwidth should be 50 MB/s.', async () => {
    const instance = await WiFiAllocation.deployed();

    const totalBandwidth = await instance.totalBandwidth.call();

    assert.equal(totalBandwidth,50,"The total bandwidth should be 50 MB/s.");
  });

  it('The owner should be the account[0]. ', async () => {
    const instance = await WiFiAllocation.deployed();
    const owner = await instance.owner.call();
    assert.equal(owner, accounts[0], "Wrong owner!")
  });

  it('There should be 5 users.', async () => {
    const instance = await WiFiAllocation.deployed();
    await instance.uponConnection(10,5,0, {from:accounts[1], gas:3000000, value:1});
    await instance.uponConnection(10,6,0, {from:accounts[2], gas:3000000, value:1});
    await instance.uponConnection(10,10,0, {from:accounts[3], gas:3000000, value:1});
    await instance.uponConnection(10,4,0, {from:accounts[4], gas:3000000, value:1});
    await instance.uponConnection(10,1,0, {from:accounts[5], gas:3000000, value:1});
    const numUsers = await instance.numUsers.call();
    assert.equal(numUsers, 5, "Wrong # of users!")
  });

  it('Display allocated bandwidth', async () => {
    const instance = await WiFiAllocation.deployed();
    const numUsers = await instance.numUsers.call();
    for (let i = 0; i < numUsers; i++) {
      const allocated = await instance.allocatedBandwidth(i);
      console.log(allocated);
    }
    assert.equal(1,1, "just display");
  });

  it('There should be no user.', async () => {
    const instance = await WiFiAllocation.deployed();
      await instance.uponConnection(0,0,0, {from:accounts[1], gas:3000000, value:1});
      await instance.uponConnection(0,0,0, {from:accounts[2], gas:3000000, value:1});
      await instance.uponConnection(0,0,0, {from:accounts[3], gas:3000000, value:1});
      await instance.uponConnection(0,0,0, {from:accounts[4], gas:3000000, value:1});
      await instance.uponConnection(0,0,0, {from:accounts[5], gas:3000000, value:1});
    const numUsers = await instance.numUsers.call();
    assert.equal(numUsers, 0, "Wrong # of users!")
  });

});