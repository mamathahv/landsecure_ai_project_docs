# Master Build Prompt — LandSecure AI

Act as a senior full-stack developer, ML engineer, blockchain developer, cybersecurity engineer, and UI/UX designer.

Build a complete, runnable educational project titled **“Intelligent Cyber Threat Prediction Model for Blockchain-Enabled Land Revenue Records”**, also called LandSecure AI. Do not create only a static frontend. Integrate the frontend, backend, database, ML models, blockchain contract, alerts, and tests.

## Technology
- Frontend: React + Vite, JavaScript, React Router, Axios, Tailwind CSS, Recharts.
- Backend: Python FastAPI, Pydantic, JWT authentication, secure password hashing.
- Database: MongoDB.
- ML: pandas, NumPy, scikit-learn, Random Forest, KNN, joblib.
- Blockchain: Solidity, Hardhat local chain, ethers.js or Web3.py.
- Tests: Postman, pytest, Hardhat tests.
- OS instructions: Windows and VS Code.

## Required roles
- Citizen: view permitted records and verification status.
- Land Officer: create/update authorized records and inspect history.
- Administrator: manage roles, review events and alerts, investigate threats, and inspect blockchain status.

## Required modules
1. Login and registration.
2. Backend-enforced role-based authorization.
3. Land-record CRUD, search, validation, and version history.
4. Activity and audit logging.
5. Dataset preparation and feature engineering.
6. Random Forest and KNN training and evaluation.
7. Prediction API with predicted class, score where supported, severity, and explanation.
8. Smart contract for record hashes, versions, authorized updates, and verification.
9. Alert creation, severity, investigation, and resolution.
10. Dashboard statistics and charts based on backend data.
11. Postman collection and automated tests.
12. Setup documentation and reproducible demo.

## Privacy and integrity rules
Use synthetic land records and clearly labeled simulated events. Keep complete records and personal data off-chain. Store only identifiers, hashes, version information, and minimal audit metadata on-chain. Use deterministic canonical serialization before hashing. Database and blockchain updates are not atomic: show pending, confirmed, and failed states, and implement reconciliation. Never claim a blockchain transaction succeeded before confirmation.

## ML rules
Use documented public data or clearly labeled synthetic data. Split training and test data without leakage. Scale features for KNN where needed. Evaluate with accuracy, precision, recall, F1-score, confusion matrix, and ROC-AUC when appropriate. Never fabricate metrics. Treat predictions as risk signals, not proof of malicious intent.

## UI pages
Login, registration, dashboard, land records, record details, add/edit forms, threat monitoring, alerts, blockchain verification, audit history, user management, settings, and logout. Include loading, empty, success, validation, and error states. Use responsive design.

## API and tests
Create REST endpoints for authentication, current user, land-record CRUD/search, record history, activity events, threat prediction, alerts, blockchain registration/verification, dashboard statistics, and health checks. Validate inputs, return correct HTTP status codes, and document endpoints in Swagger. Test authorization failures, invalid tokens, invalid payloads, prediction inputs, smart-contract access control, successful hash verification, and controlled hash mismatch.

## Required files
Provide complete source code, `.env.example` files, seed scripts, ML training/evaluation scripts, contract deployment scripts, Postman collection/environment, tests, architecture diagram, data-flow diagram, API documentation, setup guide, testing report template, and README.

## Work in phases
1. Verify prerequisites and create folders.
2. Implement backend health check and MongoDB.
3. Add authentication and RBAC.
4. Add land-record CRUD and audit history.
5. Add canonical hashing and smart contract.
6. Build ML data/training/evaluation/prediction pipeline.
7. Add activity monitoring and alerts.
8. Build frontend.
9. Integrate all services.
10. Run tests and finish documentation.

Start by presenting the architecture, folder structure, prerequisites, and plan. Then implement Phase 1 and Phase 2 with complete runnable code. For every phase, provide exact filenames, full code, Windows commands, expected output, and testing steps. Keep ports, imports, API paths, and environment variables consistent. Run tests before claiming success, fix errors before moving on, and do not leave core features as TODOs.
