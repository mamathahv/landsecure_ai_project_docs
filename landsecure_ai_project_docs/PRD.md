# Product Requirements Document (PRD) — LandSecure AI

## 1. Document purpose
Define the requirements for an educational prototype based on the project review titled **“Intelligent Cyber Threat Prediction Model for Blockchain-Enabled Land Revenue Records.”**

## 2. Problem statement
Centralized digital land-record systems can be exposed to unauthorized access, fraudulent updates, poor traceability, and limited early detection of suspicious activity. The prototype demonstrates a combined approach using access control, ML-based threat prediction, audit logging, and blockchain hash verification.

## 3. Goals
1. Provide a web interface for synthetic land-record management.
2. Restrict operations according to user role.
3. Record security-relevant events.
4. Use Random Forest and KNN techniques to classify or flag suspicious activity.
5. Verify record integrity using on-chain hashes.
6. Provide administrator monitoring and actionable alerts.
7. Provide repeatable tests and a presentation-ready demo.

## 4. Non-goals
- Production government deployment.
- Integration with real land registry systems or Aadhaar.
- Storing complete land records or personal data on a public blockchain.
- Claiming that ML can prove malicious intent.
- Guaranteeing prevention of all attacks.
- Real-time attack monitoring of external systems.

## 5. Users and roles

### Citizen
- Log in.
- View permitted records.
- Search using a record ID or survey number.
- View record verification status.

### Land Officer
- View authorized records.
- Create records and submit permitted updates.
- View record versions and audit history.
- Request integrity verification.

### Administrator
- Manage users and roles.
- View security events and alerts.
- Investigate and resolve alerts.
- View model predictions and dashboard metrics.
- Review blockchain status and audit history.

## 6. Functional requirements

### Authentication and authorization
- FR-01: Register and authenticate users.
- FR-02: Hash passwords securely.
- FR-03: Issue and validate expiring authentication tokens.
- FR-04: Enforce role-based permissions on the backend.
- FR-05: Rate-limit repeated login attempts.

### Land records
- FR-06: Create, read, search, and update records according to permissions.
- FR-07: Validate all input fields.
- FR-08: Preserve record versions and audit entries.
- FR-09: Provide record details and integrity status.
- FR-10: Never expose fields to a role that is not authorized to access them.

### ML threat prediction
- FR-11: Prepare and document a labeled dataset.
- FR-12: Train Random Forest and KNN approaches reproducibly.
- FR-13: Evaluate models on held-out test data.
- FR-14: Expose a prediction API with class, score where supported, severity, and explanation.
- FR-15: Log model version and prediction timestamp.
- FR-16: Treat predictions as risk signals, not definitive findings.

### Blockchain
- FR-17: Register a record identifier and canonical hash.
- FR-18: Record authorized updates with version information.
- FR-19: Restrict smart-contract writes to authorized accounts.
- FR-20: Verify current record hash against the on-chain hash.
- FR-21: Display pending, confirmed, and failed transaction states.
- FR-22: Reconcile failures because database and blockchain transactions are not atomic.

### Monitoring and alerts
- FR-23: Log authentication and record-operation events.
- FR-24: Apply ML inference and configurable security rules.
- FR-25: Create alerts for configured suspicious activity.
- FR-26: Assign LOW, MEDIUM, HIGH, or CRITICAL severity.
- FR-27: Allow administrators to investigate and resolve alerts.
- FR-28: Show charts and recent events from backend data.

### Testing and documentation
- FR-29: Provide a Postman collection and environment template.
- FR-30: Provide automated backend and smart-contract tests.
- FR-31: Provide synthetic seed data and a repeatable demo workflow.
- FR-32: Document setup, configuration, limitations, and troubleshooting.

## 7. Non-functional requirements
- Security: backend authorization, secure password hashing, secrets in environment variables.
- Privacy: synthetic data; no sensitive personal details on-chain.
- Reliability: clear error responses and explicit blockchain transaction states.
- Maintainability: modular code and consistent API schemas.
- Usability: responsive UI, loading/error/empty states, clear alert severity.
- Testability: deterministic seed data and repeatable tests.
- Reproducibility: documented model training and local blockchain setup.
- Performance: reasonable response times on a typical development laptop; measure rather than promise specific production-scale throughput.

## 8. Core data entities
- User: id, email/username, password hash, role, status, created timestamp.
- LandRecord: record id, survey number, location, area, owner reference, status, version, timestamps, current hash.
- RecordVersion: record id, version, changed fields, actor, timestamp, hash.
- ActivityEvent: event type, actor, timestamp, source metadata, feature values, simulated flag.
- ThreatPrediction: event id, model version, predicted class, score, explanation, timestamp.
- Alert: event id, severity, status, created timestamp, investigation notes.
- BlockchainProof: record id, version, hash, transaction hash, status, block reference if available.

## 9. Acceptance criteria
- A user can log in and access only the routes and data permitted by their role.
- An authorized officer can create a synthetic land record.
- A record's canonical hash can be registered on the local blockchain.
- Verification succeeds for an unchanged record.
- A controlled test modification produces an integrity mismatch.
- Training scripts generate saved models and evaluation metrics.
- The prediction endpoint handles valid and invalid inputs.
- A suspicious seeded event can create an alert visible to an administrator.
- Postman collection covers successful and negative API paths.
- Setup instructions work from a clean development environment, subject to documented prerequisites.

## 10. Risks and mitigations
- **Poor dataset quality:** label synthetic examples honestly; report precision/recall and limitations.
- **False positives:** use thresholds, review workflows, and human investigation.
- **Blockchain failure:** implement pending/failed/retry states.
- **Privacy leakage:** keep sensitive data off-chain and use synthetic demo data.
- **Scope overload:** implement a vertical slice first, then expand.
- **Environment incompatibilities:** pin dependencies and document supported versions.

## 11. MVP delivery order
1. Repository setup and configuration.
2. MongoDB connection and health endpoint.
3. Authentication and role checks.
4. Land-record CRUD and audit history.
5. Canonical hashing and local smart contract.
6. ML training, evaluation, and prediction API.
7. Event-to-alert pipeline.
8. React dashboards.
9. Postman and automated tests.
10. Final documentation and demonstration.
