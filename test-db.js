const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb+srv://gramaailite:gramaaidb123@cluster0.1n83s.mongodb.net/gramaai?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
  
  const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'postImages'
  });
  
  const files = await gfs.find().toArray();
  console.log('--- FILES IN GRIDFS ---');
  console.log(files);

  const posts = await mongoose.connection.db.collection('posts').find().toArray();
  console.log('\n--- POSTS IN DB ---');
  console.log(posts);
  
  process.exit(0);
}

test().catch(console.error);
