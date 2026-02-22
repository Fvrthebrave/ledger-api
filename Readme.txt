# Ledger API

A transactional financial ledger system demonstrating atomic transfers, 
idempotency, and row-level locking in Node.js + PostgreSQL.

📘 **Live Documentation:**  
https://your-vercel-link.vercel.app

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

Transaction Safety & Concurrency Handling

This ledger system enforces financial invariants directly at the database layer to ensure correctness under concurrent access.

Rather than performing a SELECT followed by an UPDATE, overdraft protection is enforced within a single atomic UPDATE statement:

UPDATE accounts
SET balance = balance - $amount
WHERE id = $accountId
  AND user_id = $userId
  AND balance >= $amount
RETURNING balance;


This approach prevents race conditions under PostgreSQL’s default READ COMMITTED isolation level.

If multiple debit requests occur simultaneously:

The first transaction acquires a row-level lock and updates the balance.

Subsequent transactions re-evaluate the WHERE clause against the updated balance.

If insufficient funds remain, the update affects zero rows and the transaction fails safely.

All financial mutations are wrapped in explicit BEGIN / COMMIT / ROLLBACK blocks to guarantee atomicity.

This ensures:

No negative balances

No lost updates

Concurrency-safe account mutations
