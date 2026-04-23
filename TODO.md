# Remove Groq AI Button from AI Chat Assistant - Task Progress

## Steps:
- [x] 1. Edit frontend/src/pages/Chat.jsx: Remove toggle button JSX, destructuring useGroq/toggleGroq, set useGroq: false in API call, simplify metadata display.
- [x] 2. Edit frontend/src/store/chatStore.js: Set default useGroq: false, remove toggleGroq/setUseGroq, remove from persist.
- [ ] 3. Test chat functionality (force TF-IDF, no button, responses show ai-engine source).
- [ ] 4. Clear localStorage gramaai-chat if needed.
- [ ] 5. Mark complete.

Current: Steps 1-2 complete. Ready for testing.

