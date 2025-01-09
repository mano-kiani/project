require("@nomicfoundation/hardhat-toolbox");
module.exports = {
 solidity: {
 // Change the version if needed by your contract
 version: "0.8.20",
 settings: {
 optimizer: {
  enabled: true,
 runs: 200
 }
 }
 },
 networks: {
 // You can rename "sepolia" if desired or add more networks

 sepolia: {
 // Replace "YOUR_RPC_URL" with your actual RPC URL
 url: "https://eth-sepolia.g.alchemy.com/v2/InR6QE9UbummkQ-DWwlFKJNp3A9DtfGW",
 // Replace the string below with your actual private key

 // Make sure this account has test ETH on Sepolia for gas

 accounts: ["5e263e5d27ede241647b7a77143055adf9a7535007dab0d9dae0e5edce2e94d5"],
 // Correct chain ID for Sepolia
 chainId: 11155111
 }
 },
 // Use "sepolia" as the default network (can be changed)
 defaultNetwork: "sepolia"
};