module.exports = function () {
    web3.eth.getAccounts().then(res=>{
        res.forEach(account=>{
            web3.eth.getBalance(account).then(balance => {
                console.log(account, ':', balance);
            })
        });
    });
};