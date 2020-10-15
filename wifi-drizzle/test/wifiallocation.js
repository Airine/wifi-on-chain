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

  it('First Request', async () => {
    const instance = await WiFiAllocation.deployed();
    await instance.uponConnection(20,5,0, {from:accounts[1], gas:3000000, value:1});
    assert.equal(1, 1, "complete")
  });

  it('Anoter Request', async () => {
    const instance = await WiFiAllocation.deployed();
    await instance.uponConnection(20,5,0, {from:accounts[1], gas:3000000, value:1});
    assert.equal(1, 1, "complete")
  });

  it('Top-up Balance', async () => {
    const instance = await WiFiAllocation.deployed();
    await instance.addBalance({from:accounts[1], gas:3000000, value:10000});
    assert.equal(1, 1, "complete")
  });

  it('Info', async () => {
    const instance = await WiFiAllocation.deployed();
    await instance.totalBandwidth.call();
    await instance.totalBandwidth.call();
    await instance.totalBandwidth.call();
    await instance.totalBandwidth.call();
    await instance.totalBandwidth.call();
    assert.equal(1, 1, "complete")
  })

  it('Exit', async () => {
    const instance = await WiFiAllocation.deployed();
    await instance.uponConnection(0,0,0, {from:accounts[1], gas:3000000, value:1});
    assert.equal(1, 1, "complete")
  });
  
});