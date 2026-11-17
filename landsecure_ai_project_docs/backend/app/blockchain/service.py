import os
import json
from web3 import Web3
from ..config import settings

RPC_URL = os.getenv("BLOCKCHAIN_RPC_URL", "http://127.0.0.1:8545")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS", "0x5FbDB2315678afecb367f032d93F642f64180aa3")
PRIVATE_KEY = os.getenv("BLOCKCHAIN_PRIVATE_KEY", "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80")

w3 = Web3(Web3.HTTPProvider(RPC_URL))

# Load ABI from hardhat artifacts if available
ABI_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "blockchain", "artifacts", "contracts", "LandRecordRegistry.sol", "LandRecordRegistry.json"))
abi = None
if os.path.exists(ABI_PATH):
    with open(ABI_PATH) as f:
        abi = json.load(f)["abi"]
else:
    abi = [
        {"inputs":[{"internalType":"string","name":"recordId","type":"string"},{"internalType":"bytes32","name":"hash","type":"bytes32"},{"internalType":"uint256","name":"version","type":"uint256"}],"name":"registerRecord","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"string","name":"recordId","type":"string"},{"internalType":"bytes32","name":"hash","type":"bytes32"},{"internalType":"uint256","name":"version","type":"uint256"}],"name":"updateRecord","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"string","name":"recordId","type":"string"}],"name":"getHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"string","name":"recordId","type":"string"},{"internalType":"bytes32","name":"hash","type":"bytes32"}],"name":"verifyHash","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
    ]

contract = w3.eth.contract(address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=abi)
account = w3.eth.account.from_key(PRIVATE_KEY)


def _send_tx(fn):
    tx = fn.build_transaction({
        "from": account.address,
        "nonce": w3.eth.get_transaction_count(account.address),
        "gas": 300000,
        "gasPrice": w3.eth.gas_price,
    })
    signed = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
    return tx_hash.hex(), receipt.status == 1


def register_hash(record_id: str, hash_hex: str, version: int):
    h = bytes.fromhex(hash_hex)
    txh, ok = _send_tx(contract.functions.registerRecord(record_id, h, version))
    return txh, ok


def update_hash(record_id: str, hash_hex: str, version: int):
    h = bytes.fromhex(hash_hex)
    txh, ok = _send_tx(contract.functions.updateRecord(record_id, h, version))
    return txh, ok


def verify_hash(record_id: str, hash_hex: str):
    on_chain_hash, version, exists = contract.functions.getHash(record_id).call()
    if not exists:
        return {"exists": False, "verified": False}
    return {
        "exists": True,
        "version": version,
        "on_chain_hash": on_chain_hash.hex(),
        "verified": on_chain_hash.hex() == hash_hex,
    }


def is_connected() -> bool:
    return w3.is_connected()
