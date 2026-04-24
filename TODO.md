# Image Rendering Fix - TODO

## Plan Approved
- [x] Create TODO.md
- [ ] Edit frontend/src/pages/Community.jsx
  - Remove crossOrigin="anonymous"
  - Add imageError state to PostCard
  - Fix fallback UI logic
- [ ] Edit backend/controllers/communityController.js
  - Always set Content-Type with fallback 'image/jpeg'
  - Use Buffer.from(image.data)
- [ ] Validate changes

