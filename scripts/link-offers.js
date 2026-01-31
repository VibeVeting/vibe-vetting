const { MongoClient, ObjectId } = require('mongodb');

async function linkOffersToCompany() {
  const uri = 'mongodb+srv://vinay91098_db_user:JJ3NQLMpe3K2Uvu1@cluster0.hbhhpo6.mongodb.net/?appName=Cluster0';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('vibe-vetting');
    
    // Get the company
    const company = await db.collection('barter_companies').findOne({ email: 'vinay91098@gmail.com' });
    
    if (!company) {
      console.log('Company not found!');
      return;
    }
    
    console.log('Company ID:', company._id.toString());
    
    // Update all offers to be from this company
    const result = await db.collection('barter_offers').updateMany(
      {},
      { 
        $set: { 
          brandId: company._id,
          brandEmail: 'vinay91098@gmail.com'
        } 
      }
    );
    
    console.log('Updated', result.modifiedCount, 'offers to this company');
    
    // Show all offers
    const offers = await db.collection('barter_offers').find({}).toArray();
    console.log('\nTotal offers:', offers.length);
    offers.forEach(o => console.log('-', o.brandName, '|', o.productName));
    
  } finally {
    await client.close();
    console.log('\nDone');
  }
}

linkOffersToCompany();
