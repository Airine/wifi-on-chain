module.exports = function () {
    web3.eth.getCoinbase().then(coinbase=>{
        web3.eth.getAccounts().then(accounts=> {
            accounts.forEach(account => {
                web3.eth.getBalance(account).then(balance => {
                    if (balance < 100000000000000000000) {
                        web3.eth.sendTransaction({from: coinbase, to: account, value: 100000000000000000000 - balance});
                    }
                });
            });
        });
    });
};