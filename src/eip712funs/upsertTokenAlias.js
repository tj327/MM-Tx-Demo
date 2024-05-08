import { sendAsync } from "./sendAsync";

export async function upsertTokenAlias(web3, accounts, contract) {
    var signer = accounts[0];
    var upsertTokenAliasParam = {
      "symbol" : "symbol",
      "name" : "name",
      "icon" : "icon",
      "decimals" : 6,
      "denoms" : ["d1", "d2", "d3"],
      "invalidated" : true
    }

    web3.currentProvider.sendAsync({
      method: 'net_version',
      params: [],
      jsonrpc: "2.0"
    }, function (err, result) {
      const netId = result.result;
      console.log("netId", netId);
      const msgParams = JSON.stringify({types:
        {
        EIP712Domain:[
          {name:"name",type:"string"},
          {name:"version",type:"string"},
          {name:"chainId",type:"uint256"},
        ],
        upsertTokenAlias:[
          {name:"param",type:"string"},
        ]
      },
      //make sure to replace verifyingContract with address of deployed contract
      primaryType:"upsertTokenAlias",
      domain:{name:"Kira",version:"1",chainId:netId},
      message:{
        param : JSON.stringify(upsertTokenAliasParam)
      }
      })

      var from = signer;
    
      console.log('CLICKED, SENDING PERSONAL SIGN REQ', 'from', from, msgParams)
      var params = [from, msgParams]
      console.dir(params)
      var method = 'eth_signTypedData_v4'
    
      sendAsync(web3, method, params, from, 
        async(v, r, s) => await contract.methods.upsertTokenAlias(v,r,s,signer, JSON.stringify(upsertTokenAliasParam)).send({ from: accounts[0] }))
    })
}