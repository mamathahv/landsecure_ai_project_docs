# LandSecure AI — Project Memory

This file is the compact project context to provide to a coding assistant at the beginning of a new session. Update it when a major design decision changes.

## Project identity
- Name: LandSecure AI
- Academic title: Intelligent Cyber Threat Prediction Model for Blockchain-Enabled Land Revenue Records
- Type: educational full-stack project / prototype
- Main purpose: demonstrate land-record management, ML-based suspicious-activity detection, blockchain hash verification, monitoring, and alerts.
- Data policy: synthetic land records and simulated cyber events only.

## Agreed stack
- Frontend: React + Vite, JavaScript, React Router, Axios, Tailwind CSS, Recharts.
- Backend: Python FastAPI, Pydantic, JWT authentication, secure password hashing.
- Database: MongoDB.
- ML: scikit-learn, Random Forest, KNN, pandas, NumPy, joblib.
- Blockchain: Solidity contract, Hardhat local chain, ethers.js or Web3.py.
- Testing: Postman, pytest, Hardhat tests.

## Required roles
- Citizen: view permitted records and verify integrity.
- Land Officer: create and update authorized records; inspect history.
- Administrator: manage roles, monitor events, investigate alerts, review audit history and blockchain status.

## Core workflows
1. Login → backend validates token and role.
2. Land record create/update → validation and permission check → version/audit record → canonical hash → blockchain transaction → pending/confirmed/failed state.
3. Security event → log event → preprocess features → ML inference + rules → save prediction → create alert when configured.
4. Integrity check → recompute record hash → compare to on-chain hash → return verified or mismatch.
5. Admin reviews and resolves alerts.

## Key design decisions
- Keep full record contents and sensitive data off-chain.
- Put only record identifiers, hashes, versions, and minimal audit metadata on-chain.
- Use deterministic canonicalization before hashing.
- Database and blockchain writes are not atomic: never claim blockchain success until confirmed; track pending/failed states and reconcile.
- ML output is a risk signal, not proof of malicious intent.
- Use clearly labeled synthetic data unless a real public dataset is deliberately selected and documented.
- Report measured evaluation metrics; never fabricate accuracy.
- Do not integrate with real government systems or Aadhaar for the prototype.

## Repository layout
- `frontend/`: React UI.
- `backend/app/`: FastAPI routers, schemas, services, database, ML, blockchain.
- `ml/`: dataset preparation, training, model artifacts, reports.
- `blockchain/`: contracts, deploy scripts, tests.
- `postman/`: collection and environment.
- `docs/`: architecture, PRD, testing and API docs.
- Root `README.md`.

## Build sequence
1. Check prerequisites and create repository.
2. Backend health check and MongoDB.
3. Authentication and RBAC.
4. Land-record CRUD and audit trail.
5. Canonical hash and smart contract.
6. ML dataset, training, evaluation, prediction API.
7. Activity pipeline and alerts.
8. React frontend.
9. End-to-end integration and Postman tests.
10. Documentation and demo.

## Demo acceptance path
- Log in as a land officer.
- Create a synthetic record.
- Register its hash on the local chain.
- Verify unchanged record successfully.
- Update record through the authorized workflow.
- Trigger suspicious activity using seeded test events.
- See an alert in the admin dashboard.
- Modify a record in a controlled test and detect hash mismatch.
- Review audit and alert history.

## Assistant instructions
- Work in small, runnable phases.
- Give exact filenames, complete code, and Windows commands.
- Explain which terminal runs each service.
- Keep ports and environment variable names consistent.
- Run tests before claiming success.
- Fix errors before continuing.
- Do not leave core functionality as TODOs or placeholders.
