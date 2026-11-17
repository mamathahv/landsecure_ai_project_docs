# API Documentation

Base URL: http://127.0.0.1:8000

## Auth
- POST /auth/register
- POST /auth/login
- GET /auth/me

## Records
- POST /records
- GET /records?search=&district=&skip=&limit=
- GET /records/{id}
- PUT /records/{id}
- GET /records/{id}/history
- GET /records/{id}/verify

## ML
- GET /ml/status
- POST /ml/predict

## Activity & Alerts
- POST /activity/log
- GET /activity/events
- GET /alerts?status=
- PATCH /alerts/{id}
- GET /dashboard/stats

## Blockchain
- GET /blockchain/status
- POST /blockchain/register
- POST /blockchain/verify

## Users (admin)
- GET /users
- PATCH /users/{id}/role

## Health
- GET /health
