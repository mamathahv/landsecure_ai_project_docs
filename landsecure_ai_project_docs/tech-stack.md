# LandSecure AI — Technology Stack

## Selected stack

| Layer | Technology | Why it is used |
|---|---|---|
| Frontend | React + Vite | Component-based interactive web UI |
| Routing | React Router | Separate pages and role-based navigation |
| HTTP client | Axios | Calls FastAPI endpoints |
| Styling | Tailwind CSS | Responsive dashboard styling |
| Charts | Recharts | Threat and activity visualizations |
| Backend | Python + FastAPI | REST API and service integration |
| Validation | Pydantic | Validates API request and response shapes |
| Database | MongoDB + PyMongo | Users, records, events, alerts, and history |
| ML | pandas, NumPy, scikit-learn | Data preparation, training, evaluation, inference |
| Model persistence | joblib | Save/load trained preprocessing and model pipelines |
| Smart contract | Solidity | On-chain hashes and audit events |
| Local blockchain | Hardhat | Local EVM chain for development and demos |
| Blockchain client | ethers.js or Web3.py | Contract interaction |
| API testing | Postman | Manual API workflows |
| Backend testing | pytest | Automated API and service tests |
| Contract testing | Hardhat test framework | Smart contract tests |
| Version control | Git | Change history and collaboration |

## Data placement
- **MongoDB:** full synthetic land records, user references, record versions, event logs, predictions, alerts, and transaction status.
- **Blockchain:** record identifier, version, cryptographic hash, authorization/audit event metadata, and transaction proof only.
- **ML artifacts:** versioned preprocessing/model files and evaluation reports.
- **Frontend:** no private keys, database credentials, or authorization secrets.

## Suggested local ports
- React/Vite: `http://localhost:5173`
- FastAPI: `http://127.0.0.1:8000`
- FastAPI Swagger: `http://127.0.0.1:8000/docs`
- MongoDB: `mongodb://127.0.0.1:27017`
- Hardhat local RPC: commonly `http://127.0.0.1:8545`

Treat these as development defaults; configure them through environment variables if needed.

## Environment variables

Backend `.env` example (use placeholder values only):
```env
APP_ENV=development
API_HOST=127.0.0.1
API_PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DATABASE=landsecure_ai
JWT_SECRET=replace-with-a-long-random-development-secret
JWT_EXPIRE_MINUTES=30
FRONTEND_ORIGIN=http://localhost:5173
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=
BLOCKCHAIN_PRIVATE_KEY=
```

Frontend `.env` example:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Never commit `.env` files. Commit `.env.example` files without real secrets.

## Versioning guidance
Choose compatible, supported versions during implementation and pin them in `requirements.txt` and package lock files. Do not install unpinned “latest” packages blindly for a project that must be reproducible.
