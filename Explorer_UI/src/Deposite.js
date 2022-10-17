import { ethers } from "ethers";
if (window.ethereum) {
	console.log("window.ethereum : ",window.ethereum);
//   const contractAddress= "0x5cfFB20aE061BaE7387Bfe249Ba0b5da87140D5A";
const contractAddrETH = '0x5f9593a343fB179C1517856A06BAC0626c0eF9F4';
const contractAddrBSC = '0x5fFD7DE1b3aF0747DBcc2624C27Ee3915AcD5C81';
const contractAddrDXT = '0x766DC779210d0f64230E94bfBa663E285C148fBb';
  

  const contractAbi=[
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "_owner",
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
		"name": "deposit",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getCurrentBalance",
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
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "transactions",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "reciever",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "exc_rate",
				"type": "uint256"
			},
			{
				"internalType": "bytes32",
				"name": "txn_hash",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address payable",
				"name": "_account",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "exc_rate",
				"type": "uint256"
			},
			{
				"internalType": "bytes32",
				"name": "txn_hash",
				"type": "bytes32"
			}
		],
		"name": "withdraw",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	}
]
  
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  var webETH = new ethers.Contract(contractAddrETH, contractAbi, signer);
  var webBSC = new ethers.Contract(contractAddrBSC, contractAbi, signer);
  var webDXT = new ethers.Contract(contractAddrDXT, contractAbi, signer);
  
}
console.log("window.ethereum out side : ",window.ethereum);
export default {
	webETH,
	webBSC,
	webDXT,
};