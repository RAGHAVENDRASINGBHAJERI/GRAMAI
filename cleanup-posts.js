const mongoose = require('mongoose');
require('dotenv').config();

async function cleanup() {
  await mongoose.connect('mongodb+srv://Raghavendrasing:Sksv123@cluster0.dxmpr5a.mongodb.net/gramaai?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
  
  const Post = require('./backend/models/Post');
  
  // Find all posts
  const posts = await Post.find({});
  let deleted = 0;
  
  for (const post of posts) {
    if (post.imageId) {
      const CommunityImage = require('./backend/models/CommunityImage');
      const img = await CommunityImage.findById(post.imageId);
      if (!img) {
        // Old GridFS image! Let's just delete the post to clean up the dev environment
        await Post.findByIdAndDelete(post._id);
        deleted++;
      }
    }
  }
  
  console.log(`Cleaned up ${deleted} old posts with missing CommunityImage data.`);
  process.exit(0);
}

cleanup().catch(console.error);
