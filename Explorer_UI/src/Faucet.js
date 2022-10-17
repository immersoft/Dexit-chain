import { ethers } from "ethers";

if (window.ethereum) {
//   const contractAddress= "0x36264383C8554f85d4216007ac07cf41a9FE8DD3";
  const contractAddress= "0xF0cC53BaB1940b56c814173cd7030913787312B7";
  

  const contractAbi=[
	{
		"inputs": [],
		"name": "AMOUNT",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "PERIOD",
		"outputs": [
			{
				"internalType": "uint64",
				"name": "",
				"type": "uint64"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "claimFaucet",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "faucetAccount",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getFaucetContractBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getFaucetOwnerBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "transferToContract",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "userRecords",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]



  
  const provider = new ethers.providers.Web3Provider(window.ethereum);
//   const signer = provider.getSigner();
    const signer=new ethers.Wallet("145e7dcb3449d6ade4ec74ffcad58a0c872c48cd547bf2fd53079b2f1bdf9ce8",provider);
    // console.log(signer,"insode ethes")
  var web = new ethers.Contract(contractAddress, contractAbi, signer);

}
export default web;