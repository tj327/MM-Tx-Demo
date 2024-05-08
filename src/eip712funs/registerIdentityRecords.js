import { sendAsync } from "./sendAsync";
import converter from "bech32-converting";

function convertToBech32(addr, prefix) {
  return converter(prefix).toBech32(addr)
}

export async function registerIdentityRecords(web3, accounts, contract) {
    var signer = accounts[0];
    var registerIdentityRecordsParam = {
      "address": convertToBech32(signer, "kira"),
      "infos" : [
        {
          "key" : "key1",
          "info" : "info1"
        },
        {
          "key" : "key2",
          "info" : "info2"
        }
      ]
    }

    web3.currentProvider.sendAsync({
      method: 'net_version',
      params: [],
      jsonrpc: "2.0"
    }, async function (err, result) {
      const netId = result.result;
      console.log("netId", netId);
      const msgParams = JSON.stringify({
        domain:{
          name:"Kira",
          version:"1",
          chainId:netId
        },
        types: {
          EIP712Domain:[
            {name:"name",type:"string"},
            {name:"version",type:"string"},
            {name:"chainId",type:"uint256"},
          ],
          register_identity_records:[
            {name:"param",type:"string"},
            {name:"nonce",type:"uint256"}
          ]
        },
        //make sure to replace verifyingContract with address of deployed contract
        primaryType:"register_identity_records",
        message:{
          param: JSON.stringify(registerIdentityRecordsParam),
          nonce: await web3.eth.getTransactionCount(signer),
        }
      })
      console.log("msgParams", JSON.stringify(msgParams))

      var from = signer;
    
      console.log('CLICKED, SENDING PERSONAL SIGN REQ', 'from', from, msgParams)
      var params = [from, msgParams]
      console.dir(params)
      var method = 'eth_signTypedData_v4'
    
      sendAsync(web3, method, params, from, 
        async(v, r, s) => await contract.methods.registerIdentityRecords(v,r,s,signer, JSON.stringify(registerIdentityRecordsParam)).send({ from: accounts[0] }))
    })
}
