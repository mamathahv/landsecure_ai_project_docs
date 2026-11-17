// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LandRecordRegistry {
    address public owner;

    struct Record {
        bytes32 hash;
        uint256 version;
        uint256 updatedAt;
        bool exists;
    }

    mapping(string => Record) private records;

    event RecordRegistered(string indexed recordId, bytes32 hash, uint256 version, address indexed by);
    event RecordUpdated(string indexed recordId, bytes32 hash, uint256 version, address indexed by);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerRecord(string calldata recordId, bytes32 hash, uint256 version) external onlyOwner {
        require(!records[recordId].exists, "Record already registered");
        records[recordId] = Record(hash, version, block.timestamp, true);
        emit RecordRegistered(recordId, hash, version, msg.sender);
    }

    function updateRecord(string calldata recordId, bytes32 hash, uint256 version) external onlyOwner {
        require(records[recordId].exists, "Record not found");
        records[recordId].hash = hash;
        records[recordId].version = version;
        records[recordId].updatedAt = block.timestamp;
        emit RecordUpdated(recordId, hash, version, msg.sender);
    }

    function getHash(string calldata recordId) external view returns (bytes32, uint256, bool) {
        Record memory r = records[recordId];
        return (r.hash, r.version, r.exists);
    }

    function verifyHash(string calldata recordId, bytes32 hash) external view returns (bool) {
        if (!records[recordId].exists) return false;
        return records[recordId].hash == hash;
    }
}
