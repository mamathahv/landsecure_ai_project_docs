# LandSecure AI

**Intelligent Cyber Threat Prediction Model for Blockchain-Enabled Land Revenue Records**

LandSecure AI is an educational prototype combining land-record management, machine-learning-based suspicious activity detection, blockchain-backed integrity verification, and administrator alerts.

## Features planned
- Role-based access for citizens, land officers, and administrators.
- Synthetic land-record CRUD and version history.
- Activity logging and threat alerts.
- Random Forest and KNN ML pipeline.
- Solidity smart contract for record hashes and audit events.
- Integrity verification.
- Admin dashboard with threat/activity charts.
- Postman collection and automated tests.

> This repository is a project specification/documentation starter. The application is not implemented merely by adding these documents. Follow the build phases below and validate each feature before claiming it works.

## Documentation
- `architecture.md` — components, data flows, trust boundaries, repository layout.
- `PRD.md` — requirements, roles, acceptance criteria, risks.
- `tech-stack.md` — selected tools, data placement, environment variables.
- `memory.md` — compact context for continuing work with a coding assistant.
- `build-prompt.pdf` — complete prompt for generating the application incrementally.

## Prerequisites
Install:
- Git
- Node.js and npm
- Python 3.11 or another compatible version selected for the implementation
- MongoDB local server or a MongoDB Atlas database
- VS Code
- Hardhat dependencies through npm

Check installations in PowerShell:
```powershell
node --version
npm --version
python --version
git --version
```

## Suggested repository layout
```text
landsecure-ai/
  frontend/
  backend/
  ml/
  blockchain/
  postman/
  docs/
  README.md
```

## Recommended implementation order
1. Create the folders and environment examples.
2. Implement FastAPI health endpoint and MongoDB connection.
3. Implement authentication and backend role checks.
4. Implement land-record CRUD and versioned audit history.
5. Implement deterministic hashing and local Hardhat smart contract.
6. Build ML dataset preparation, training, evaluation, and inference.
7. Connect activity logging to prediction and alert generation.
8. Build React pages and dashboards.
9. Connect all services and run Postman tests.
10. Complete automated tests and documentation.

## Development services (suggested defaults)
- Frontend: `http://localhost:5173`
- Backend: `http://127.0.0.1:8000`
- API docs: `http://127.0.0.1:8000/docs`
- MongoDB: `mongodb://127.0.0.1:27017`
- Hardhat RPC: `http://127.0.0.1:8545`

Configure service URLs with environment variables; do not hardcode secrets.

## Security and privacy notes
- Use synthetic land records and simulated attack events.
- Do not put full land records, owner details, identity numbers, or documents on-chain.
- Keep credentials and private keys out of Git.
- Enforce authorization in the backend.
- Treat ML predictions as signals for human review.
- Track blockchain submissions as pending/confirmed/failed because database and chain operations are not atomic.

## Testing checklist
- [ ] Authentication works and tokens expire.
- [ ] Backend rejects unauthorized role actions.
- [ ] Land records can be created, searched, viewed, and updated.
- [ ] Record versions and audit events are preserved.
- [ ] Trained ML pipeline can load and predict.
- [ ] Model metrics are generated from held-out test data.
- [ ] Smart contract restricts writes to authorized accounts.
- [ ] Unchanged record hash verifies successfully.
- [ ] Controlled record tampering triggers an integrity mismatch.
- [ ] Suspicious activity produces a stored alert.
- [ ] Postman collection covers success and failure cases.
- [ ] Frontend displays actual backend data and clear error states.

## Demo scenario
1. Log in as a land officer.
2. Create a synthetic land record.
3. Register the record hash on the local blockchain.
4. Verify the record.
5. Trigger a seeded suspicious activity event.
6. Open the administrator alert dashboard.
7. Run a controlled tampering test and show the hash mismatch.
8. Review the audit history.

## Limitations
This is a college demonstration prototype, not a production government system. Real deployment would require security review, legal and privacy review, operational monitoring, threat-modeling, key management, and integration approval.
