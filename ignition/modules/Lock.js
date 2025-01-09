const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const AcademicCredentialsModule = buildModule("AcademicCredentialsModule", (m) => {
    // Deploy the main contract
    const academicCredentials = m.contract("AcademicCredentials");

    // You can add initial setup here if needed
    // For example, adding an initial institution:
    // m.call(academicCredentials, "addInstitution", ["0xYourInstitutionAddress", "First University"]);

    return { academicCredentials };
});

module.exports = AcademicCredentialsModule;