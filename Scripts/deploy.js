// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
    // 1. Get the contract factory
    const AcademicCredentials = await ethers.getContractFactory("AcademicCredentials");
    console.log("Deploying AcademicCredentials contract...");

    // 2. Deploy the contract
    const academicCredentials = await AcademicCredentials.deploy();
    await academicCredentials.deployed();

    // 3. Log the deployed contract address
    console.log("AcademicCredentials deployed to:", academicCredentials.address);

    // Optional: Add an initial institution (replace with real data if needed)
    const institutionAddress = "0xYourInstitutionAddress"; // Replace with actual institution address
    const institutionName = "First University"; // Replace with actual institution name

    // Adding an institution (ensure the owner is calling this function)
    const tx = await academicCredentials.addInstitution(institutionAddress, institutionName);
    await tx.wait();

    console.log(`Institution added: ${institutionName} at ${institutionAddress}`);
}

// For async/await error handling
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
