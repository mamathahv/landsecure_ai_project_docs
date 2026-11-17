# Setup Guide (Windows)

## Prerequisites
- Node.js 18+ and npm
- Python 3.11/3.12
- MongoDB running (service or mongod)
- VS Code

## 1. Backend
```
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
pip install pandas
copy .env.example .env
```
Edit .env if needed. Start MongoDB service. Run:
```
.\venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload
```

## 2. Seed data
```
cd backend
.\venv\Scripts\python.exe scripts\seed.py
```

## 3. ML (optional retrain)
```
cd ml
..\backend\venv\Scripts\python.exe scripts\generate_dataset.py
..\backend\venv\Scripts\python.exe scripts\train_models.py
```

## 4. Blockchain
```
cd blockchain
npm install
npm run node
# in another terminal
npm run deploy
```
Copy deployed address to backend/.env CONTRACT_ADDRESS if changed. Default matches Hardhat first deploy.

## 5. Frontend
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

## Reset demo
- Stop services. Drop MongoDB database `landsecure` (or run seed.py which clears collections). Restart Hardhat node (resets chain) and redeploy contract, update CONTRACT_ADDRESS.
