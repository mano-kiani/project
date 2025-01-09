// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract AcademicCredentials is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _credentialIds;

    struct Institution {
        string name;
        address institutionAddress;
        bool isActive;
    }

    struct Credential {
        uint256 id;
        string studentName;
        string courseName;
        string credentialHash;  // IPFS hash or other document hash
        uint256 issueDate;
        address issuingInstitution;
        bool isValid;
    }

    mapping(address => Institution) public institutions;
    mapping(uint256 => Credential) public credentials;
    mapping(string => bool) public usedHashes;

    event InstitutionAdded(address indexed institutionAddress, string name);
    event InstitutionDeactivated(address indexed institutionAddress);
    event CredentialIssued(
        uint256 indexed credentialId,
        string studentName,
        address indexed issuingInstitution
    );
    event CredentialRevoked(uint256 indexed credentialId);

    modifier onlyActiveInstitution() {
        require(
            institutions[msg.sender].isActive,
            "Caller is not an active institution"
        );
        _;
    }

    constructor() {}

    function addInstitution(
        address institutionAddress,
        string memory name
    ) external onlyOwner {
        require(
            institutions[institutionAddress].isActive == false,
            "Institution already exists"
        );
        
        institutions[institutionAddress] = Institution({
            name: name,
            institutionAddress: institutionAddress,
            isActive: true
        });

        emit InstitutionAdded(institutionAddress, name);
    }

    function deactivateInstitution(address institutionAddress) external onlyOwner {
        require(
            institutions[institutionAddress].isActive,
            "Institution is not active"
        );
        
        institutions[institutionAddress].isActive = false;
        emit InstitutionDeactivated(institutionAddress);
    }

    function issueCredential(
        string memory studentName,
        string memory courseName,
        string memory credentialHash
    ) external onlyActiveInstitution returns (uint256) {
        require(!usedHashes[credentialHash], "Credential hash already exists");

        _credentialIds.increment();
        uint256 newCredentialId = _credentialIds.current();

        credentials[newCredentialId] = Credential({
            id: newCredentialId,
            studentName: studentName,
            courseName: courseName,
            credentialHash: credentialHash,
            issueDate: block.timestamp,
            issuingInstitution: msg.sender,
            isValid: true
        });

        usedHashes[credentialHash] = true;

        emit CredentialIssued(newCredentialId, studentName, msg.sender);
        return newCredentialId;
    }

    function revokeCredential(uint256 credentialId) external {
        require(
            credentials[credentialId].issuingInstitution == msg.sender,
            "Only issuing institution can revoke"
        );
        require(credentials[credentialId].isValid, "Credential already revoked");

        credentials[credentialId].isValid = false;
        emit CredentialRevoked(credentialId);
    }

    function verifyCredential(
        uint256 credentialId,
        string memory credentialHash
    ) external view returns (bool) {
        Credential memory credential = credentials[credentialId];
        return (
            credential.isValid &&
            keccak256(bytes(credential.credentialHash)) == keccak256(bytes(credentialHash))
        );
    }

    function getCredential(
        uint256 credentialId
    ) external view returns (Credential memory) {
        return credentials[credentialId];
    }
}