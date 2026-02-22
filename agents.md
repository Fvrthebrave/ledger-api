# Ledger API Project Rules

## Purpose
A production-grade financial ledger API designed to demonstrate strong backend architecture, financial data integrity, and scalable service design.

## Stack
- Node.js
- TypeScript
- Express
- PostgreSQL
- Jest for testing

## Architecture
- Routes handle HTTP only
- Controllers orchestrate request/response flow
- Services contain all business logic
- Repositories handle database access only
- No business logic in routes or repositories

## Financial Integrity Rules
- Currency must use integer minor units (e.g., cents) or a decimal library
- No floating point math
- All ledger mutations must occur inside database transactions
- Ledger entries are immutable once written
- Account balances must be derived from ledger entries, never manually updated

## Error Handling
- All services must return typed domain errors
- No raw database errors exposed to clients

## Testing Requirements
- All financial logic requires unit tests
- Include edge cases (negative values, insufficient funds, duplicate requests)
- Tests must simulate concurrency scenarios where applicable

## Definition of Done
- `npm run dev` works
- `npm run build` passes
- No TypeScript errors
- Tests pass
- Code is clean and readable
