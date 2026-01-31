const { MongoClient } = require('mongodb');

async function cleanOffers() {
  const uri = 'mongodb+srv://vinay91098_db_user:JJ3NQLMpe3K2Uvu1@cluster0.hbhhpo6.mongodb.net/?appName=Cluster0';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('vibe-vetting');
    const offersCol = db.collection('barter_offers');
    
    // Count current offers
    const count = await offersCol.countDocuments();
    console.log('Current offers:', count);
    
    // Delete all offers except the 5 we created for Vinay Enterprises
    const result = await offersCol.deleteMany({ 
      brandName: { $ne: 'Vinay Enterprises' } 
    });
    console.log('Deleted', result.deletedCount, 'duplicate/broken offers');
    
    // Show remaining offers
    const remaining = await offersCol.find({}).toArray();
    console.log('Remaining offers:', remaining.length);
    remaining.forEach(o => console.log('-', o.productName, '| Category:', o.productCategory));
    
  } finally {
    await client.close();
    console.log('Done');
  }
}

cleanOffers();
