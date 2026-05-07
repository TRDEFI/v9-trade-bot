# Security Spec

## 1. Data Invariants
- A bot status cannot be changed by someone who is not the owner.
- A user cannot change their own role.

## 2. The "Dirty Dozen" Payloads
1. Create system doc with wrong ownerId.
2. Update system doc with additional fields.
3. Update system doc changing ownerId.
4. Read system doc without auth.
5. Create user with role='admin'.
6. Update user changing role.
7. Inject 1MB string into ownerId.
8. Delete system doc without auth.
9. List users without auth.
10. Update system doc without required fields.
11. Update user without required fields.
12. Create system doc with invalid ID.

## 3. The Test Runner
(To be implemented in firestore.rules.test.ts)
