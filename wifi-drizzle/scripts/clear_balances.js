module.exports = function () {
    web3.eth.getCoinbase().then(coinbase=> {
        web3.eth.getAccounts().then(accounts=> {
            accounts.forEach(account => {
                if (account.toUpperCase() !== coinbase.toUpperCase()) {
                    console.log(account);
                    web3.eth.getBalance(account).then(balance=> {
                        web3.eth.sendTransaction({from: account, to:coinbase, value:balance/2}).on("error", res=>{
                            console.log(res);
                        });
                    })
                }
            });
        });
    });
};