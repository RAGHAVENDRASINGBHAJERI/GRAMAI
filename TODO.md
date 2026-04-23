# Fix Auth 401 Issues
- [x] Step 1: Verify MongoDB users exist (attempted mongo/mongosh query; `mongo` command not recognized either - likely MongoDB not in PATH or legacy mongo shell. Use Compass/GUI or register user via UI instead)
- [ ] Step 2: Create test user if empty (use register in UI or Mongo insert with hashed pass)
- [ ] Step 3: Test login: curl or UI with test@example.com / Test1234! (meets password reqs)
- [ ] Step 4: Verify refresh after login (check cookies, api interceptor)
- [ ] Step 5: Confirm logout → expected 401 refresh
- [ ] Step 6: Add phone option to Login.jsx (optional enhancement)
- [ ] Step 7: Add debug logging to authController.js (optional)
- [ ] Step 8: Test full flow in browser (login → chat → logout)
- [x] Create this TODO.md

Current status: Backend auth correct, likely no test data in DB. Follow steps sequentially.
