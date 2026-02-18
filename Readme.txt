# Ledger API

A modular Node.js + TypeScript REST API demonstrating:

- User authentication (JWT + bcrypt)
- Relational data modeling (Users → Accounts → Transactions)
- Financial-safe schema design (NUMERIC types)
- Modular architecture (routes/controllers/services)
- Protected routes via JWT middleware

## Setup

1. Clone repo
2. Create Postgres DB named `ledger`
3. Run provided schema
4. Create `.env` file based on `.env.example`
5. npm install
6. npm run dev
