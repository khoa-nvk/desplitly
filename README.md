## DeSplitly Introduction 

DeSplitly.com is a decentrialized bill splitting. 

You can easily share your bill with your friends on DeSplitly for free

## DeSplitly features 

- Create expense and send it to your friends 
- Pay an expense 
- Receive DST (DeSplitly Token) after a sharer pay back an owned amount of the bill 
- Use DST tokens to claim a DeSplitly NFT

## Sample command lines 

Run the Clarinet console  
`clarinet console`

Create a bill  

`(contract-call? .desplitly create-expense "ex1" "launch" "description demo" "https://img.png" "10/08/2022" u10000000 (list { sharer: 'STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6, owned-amount: u1000000} { sharer: 'ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP, owned-amount: u5000000} { sharer: 'ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ, owned-amount: u4000000} ))`

Switch to other user wallet 

`::set_tx_sender STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6` 

Pay an expense and get DST token reward 

`(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.desplitly pay-expense "ex1" 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)`

Claim DeSplitlt NFT 

`(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dst-nft mint-with-dst )`

Check account balances 

`::get_assets_maps`


(Optional) You can switch to second sharer 

`::set_tx_sender ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ`
Pay the exenpse with the second sharer

`(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.desplitly pay-expense "ex1" 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)`

## Status 

DeSplitly.com is at the beta version that can have minor issues and bug. We can migrate to another contract, so please use DeSplitly as an experiment right now.

We do not take any responsibility for your lost.

We will announce the final version of DeSplitly soon.