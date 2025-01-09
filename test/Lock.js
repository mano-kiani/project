const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("AcademicCredentials", function () {
  async function deployContractFixture() {
    // Get signers for testing
    const [owner, institution1, institution2, student] = await ethers.getSigners();

    // Deploy the contract
    const AcademicCredentials = await ethers.getContractFactory("AcademicCredentials");
    const academicCredentials = await AcademicCredentials.deploy();

    return { academicCredentials, owner, institution1, institution2, student };
  }

  describe("Institution Management", function () {
    it("Should allow owner to add new institution", async function () {
      const { academicCredentials, owner, institution1 } = await loadFixture(deployContractFixture);

      await academicCredentials.addInstitution(
        institution1.address,
        "Test University"
      );

      const institution = await academicCredentials.institutions(institution1.address);
      expect(institution.name).to.equal("Test University");
      expect(institution.isActive).to.equal(true);
    });

    it("Should not allow non-owner to add institution", async function () {
      const { academicCredentials, institution1, institution2 } = await loadFixture(deployContractFixture);

      await expect(
        academicCredentials.connect(institution1).addInstitution(
          institution2.address,
          "Test University"
        )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow owner to deactivate institution", async function () {
      const { academicCredentials, institution1 } = await loadFixture(deployContractFixture);

      await academicCredentials.addInstitution(
        institution1.address,
        "Test University"
      );
      await academicCredentials.deactivateInstitution(institution1.address);

      const institution = await academicCredentials.institutions(institution1.address);
      expect(institution.isActive).to.equal(false);
    });
  });

  describe("Credential Management", function () {
    it("Should allow active institution to issue credential", async function () {
      const { academicCredentials, owner, institution1 } = await loadFixture(deployContractFixture);

      await academicCredentials.addInstitution(
        institution1.address,
        "Test University"
      );

      await expect(
        academicCredentials.connect(institution1).issueCredential(
          "John Doe",
          "Computer Science",
          "QmHash123"
        )
      )
        .to.emit(academicCredentials, "CredentialIssued")
        .withArgs(1, "John Doe", institution1.address);

      const credential = await academicCredentials.credentials(1);
      expect(credential.studentName).to.equal("John Doe");
      expect(credential.courseName).to.equal("Computer Science");
      expect(credential.credentialHash).to.equal("QmHash123");
    });

    it("Should not allow inactive institution to issue credential", async function () {
      const { academicCredentials, institution1 } = await loadFixture(deployContractFixture);

      await expect(
        academicCredentials.connect(institution1).issueCredential(
          "John Doe",
          "Computer Science",
          "QmHash123"
        )
      ).to.be.revertedWith("Caller is not an active institution");
    });

    it("Should prevent duplicate credential hashes", async function () {
      const { academicCredentials, institution1 } = await loadFixture(deployContractFixture);

      await academicCredentials.addInstitution(
        institution1.address,
        "Test University"
      );

      await academicCredentials.connect(institution1).issueCredential(
        "John Doe",
        "Computer Science",
        "QmHash123"
      );

      await expect(
        academicCredentials.connect(institution1).issueCredential(
          "Jane Doe",
          "Computer Science",
          "QmHash123"
        )
      ).to.be.revertedWith("Credential hash already exists");
    });

    it("Should allow institution to revoke their issued credential", async function () {
      const { academicCredentials, institution1 } = await loadFixture(deployContractFixture);

      await academicCredentials.addInstitution(
        institution1.address,
        "Test University"
      );

      await academicCredentials.connect(institution1).issueCredential(
        "John Doe",
        "Computer Science",
        "QmHash123"
      );

      await expect(
        academicCredentials.connect(institution1).revokeCredential(1)
      )
        .to.emit(academicCredentials, "CredentialRevoked")
        .withArgs(1);

      const credential = await academicCredentials.credentials(1);
      expect(credential.isValid).to.equal(false);
    });

    it("Should not allow non-issuing institution to revoke credential", async function () {
      const { academicCredentials, institution1, institution2 } = await loadFixture(deployContractFixture);

      await academicCredentials.addInstitution(
        institution1.address,
        "Test University"
      );
      await academicCredentials.addInstitution(
        institution2.address,
        "Another University"
      );

      await academicCredentials.connect(institution1).issueCredential(
        "John Doe",
        "Computer Science",
        "QmHash123"
      );

      await expect(
        academicCredentials.connect(institution2).revokeCredential(1)
      ).to.be.revertedWith("Only issuing institution can revoke");
    });
  });

  describe("Credential Verification", function () {
    it("Should correctly verify valid credential", async function () {
      const { academicCredentials, institution1 } = await loadFixture(deployContractFixture);

      await academicCredentials.addInstitution(
        institution1.address,
        "Test University"
      );

      await academicCredentials.connect(institution1).issueCredential(
        "John Doe",
        "Computer Science",
        "QmHash123"
      );

      const isValid = await academicCredentials.verifyCredential(1, "QmHash123");
      expect(isValid).to.equal(true);
    });

    it("Should fail verification for revoked credential", async function () {
      const { academicCredentials, institution1 } = await loadFixture(deployContractFixture);

      await academicCredentials.addInstitution(
        institution1.address,
        "Test University"
      );

      await academicCredentials.connect(institution1).issueCredential(
        "John Doe",
        "Computer Science",
        "QmHash123"
      );

      await academicCredentials.connect(institution1).revokeCredential(1);

      const isValid = await academicCredentials.verifyCredential(1, "QmHash123");
      expect(isValid).to.equal(false);
    });

    it("Should fail verification for incorrect hash", async function () {
      const { academicCredentials, institution1 } = await loadFixture(deployContractFixture);

      await academicCredentials.addInstitution(
        institution1.address,
        "Test University"
      );

      await academicCredentials.connect(institution1).issueCredential(
        "John Doe",
        "Computer Science",
        "QmHash123"
      );

      const isValid = await academicCredentials.verifyCredential(1, "WrongHash");
      expect(isValid).to.equal(false);
    });
  });
});