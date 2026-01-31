const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function checkAndUpdateUser() {
  const uri = 'mongodb+srv://vinay91098_db_user:JJ3NQLMpe3K2Uvu1@cluster0.hbhhpo6.mongodb.net/?appName=Cluster0';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('vibe-vetting');
    
    // Find user
    const user = await db.collection('users').findOne({ email: 'vinay91098@gmail.com' });
    
    if (user) {
      console.log('User found:', { name: user.name, email: user.email });
      // Update password to vinay91098@gmail.com
      const hashedPassword = await bcrypt.hash('vinay91098@gmail.com', 10);
      await db.collection('users').updateOne(
        { email: 'vinay91098@gmail.com' },
        { $set: { password: hashedPassword, updatedAt: new Date() } }
      );
      console.log('Password updated to: vinay91098@gmail.com');
    } else {
      console.log('User not found, creating new user...');
      const hashedPassword = await bcrypt.hash('vinay91098@gmail.com', 10);
      const result = await db.collection('users').insertOne({
        name: 'Vinay Prajapati',
        email: 'vinay91098@gmail.com',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('User created with ID:', result.insertedId);
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

checkAndUpdateUser();
