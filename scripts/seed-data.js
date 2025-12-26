const { MongoClient } = require('mongodb');

async function seed() {
  const uri = 'mongodb+srv://vinay91098_db_user:JJ3NQLMpe3K2Uvu1@cluster0.hbhhpo6.mongodb.net/?appName=Cluster0';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('vibe-vetting');
    
    // Find vinay user
    const user = await db.collection('users').findOne({ email: 'vinay91098@gmail.com' });
    if (!user) {
      console.log('User vinay91098@gmail.com not found. Checking all users...');
      const allUsers = await db.collection('users').find({}).toArray();
      console.log('All users:', allUsers.map(u => ({ name: u.name, email: u.email })));
      if (allUsers.length > 0) {
        console.log('Using first user for seeding');
        var userId = allUsers[0]._id;
        var userName = allUsers[0].name;
      } else {
        console.log('No users found. Please register first.');
        return;
      }
    } else {
      var userId = user._id;
      var userName = user.name;
    }
    
    console.log('Seeding data for user:', userName, userId.toString());
    
    // Seed stats
    await db.collection('user_stats').deleteMany({ userId });
    await db.collection('user_stats').insertOne({
      userId,
      totalCreatorsVerified: 147,
      perfectMatches: 23,
      activeCampaigns: 8,
      avgAlignmentScore: 87.5,
      creatorsAnalyzed: 312,
      highRiskDetected: 12,
      weeklyCreatorChange: 12,
      weeklyMatchChange: 5,
      updatedAt: new Date(),
    });
    console.log('✓ Stats seeded');
    
    // Seed analyses
    await db.collection('creator_analyses').deleteMany({ userId });
    const analyses = [
      { userId, name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', handle: '@sarahjcreates', platform: 'Instagram', followers: '2.4M', status: 'verified', alignmentScore: 94, riskLevel: 'Low', analyzedAt: new Date(Date.now() - 1*24*60*60*1000) },
      { userId, name: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', handle: '@mikechentech', platform: 'YouTube', followers: '1.8M', status: 'verified', alignmentScore: 91, riskLevel: 'Low', analyzedAt: new Date(Date.now() - 2*24*60*60*1000) },
      { userId, name: 'Emma Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', handle: '@emmawilsonfit', platform: 'TikTok', followers: '3.2M', status: 'pending', alignmentScore: 78, riskLevel: 'Medium', analyzedAt: new Date(Date.now() - 3*24*60*60*1000) },
      { userId, name: 'David Park', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', handle: '@davidparkgaming', platform: 'Twitch', followers: '890K', status: 'risk', alignmentScore: 45, riskLevel: 'High', analyzedAt: new Date(Date.now() - 4*24*60*60*1000) },
      { userId, name: 'Lisa Martinez', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', handle: '@lisamartinezstyle', platform: 'Instagram', followers: '1.5M', status: 'verified', alignmentScore: 89, riskLevel: 'Low', analyzedAt: new Date(Date.now() - 5*24*60*60*1000) },
      { userId, name: 'James Brown', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', handle: '@jamesbfinance', platform: 'YouTube', followers: '650K', status: 'verified', alignmentScore: 92, riskLevel: 'Low', analyzedAt: new Date(Date.now() - 6*24*60*60*1000) },
      { userId, name: 'Anna Lee', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', handle: '@annaleebeauty', platform: 'TikTok', followers: '4.1M', status: 'pending', alignmentScore: 72, riskLevel: 'Medium', analyzedAt: new Date(Date.now() - 7*24*60*60*1000) },
      { userId, name: 'Chris Taylor', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', handle: '@christaylor_fit', platform: 'Instagram', followers: '980K', status: 'verified', alignmentScore: 88, riskLevel: 'Low', analyzedAt: new Date(Date.now() - 8*24*60*60*1000) },
    ];
    await db.collection('creator_analyses').insertMany(analyses);
    console.log('✓ Creator analyses seeded:', analyses.length, 'records');
    
    // Seed campaigns
    await db.collection('campaigns').deleteMany({ userId });
    const campaigns = [
      { userId, name: 'Summer Product Launch', description: 'Launching our new summer collection with top lifestyle creators', status: 'active', budget: 50000, startDate: new Date(Date.now() - 15*24*60*60*1000), endDate: new Date(Date.now() + 45*24*60*60*1000), creatorsCount: 12, matchedCreators: 8, createdAt: new Date(Date.now() - 20*24*60*60*1000), updatedAt: new Date() },
      { userId, name: 'Tech Review Series', description: 'Partner with tech influencers for product reviews', status: 'active', budget: 35000, startDate: new Date(Date.now() - 10*24*60*60*1000), endDate: new Date(Date.now() + 20*24*60*60*1000), creatorsCount: 8, matchedCreators: 6, createdAt: new Date(Date.now() - 15*24*60*60*1000), updatedAt: new Date() },
      { userId, name: 'Fitness Brand Awareness', description: 'Health and wellness campaign with fitness influencers', status: 'active', budget: 25000, startDate: new Date(Date.now() - 5*24*60*60*1000), endDate: new Date(Date.now() + 55*24*60*60*1000), creatorsCount: 15, matchedCreators: 10, createdAt: new Date(Date.now() - 10*24*60*60*1000), updatedAt: new Date() },
      { userId, name: 'Holiday Gift Guide', description: 'Collaborate with creators for holiday shopping content', status: 'completed', budget: 75000, startDate: new Date(Date.now() - 60*24*60*60*1000), endDate: new Date(Date.now() - 30*24*60*60*1000), creatorsCount: 20, matchedCreators: 18, createdAt: new Date(Date.now() - 65*24*60*60*1000), updatedAt: new Date(Date.now() - 30*24*60*60*1000) },
      { userId, name: 'Spring Fashion Collection', description: 'Fashion influencer partnerships for spring line', status: 'draft', budget: 40000, startDate: new Date(Date.now() + 30*24*60*60*1000), creatorsCount: 10, matchedCreators: 0, createdAt: new Date(Date.now() - 2*24*60*60*1000), updatedAt: new Date() },
      { userId, name: 'Gaming Tournament Promo', description: 'Partner with gaming streamers for tournament promotion', status: 'active', budget: 45000, startDate: new Date(Date.now() - 3*24*60*60*1000), endDate: new Date(Date.now() + 14*24*60*60*1000), creatorsCount: 6, matchedCreators: 5, createdAt: new Date(Date.now() - 7*24*60*60*1000), updatedAt: new Date() },
      { userId, name: 'Sustainable Living', description: 'Eco-friendly product promotion with sustainability influencers', status: 'active', budget: 20000, startDate: new Date(Date.now() - 8*24*60*60*1000), endDate: new Date(Date.now() + 22*24*60*60*1000), creatorsCount: 9, matchedCreators: 7, createdAt: new Date(Date.now() - 12*24*60*60*1000), updatedAt: new Date() },
      { userId, name: 'Back to School', description: 'Educational content creators for back to school season', status: 'completed', budget: 30000, startDate: new Date(Date.now() - 120*24*60*60*1000), endDate: new Date(Date.now() - 90*24*60*60*1000), creatorsCount: 14, matchedCreators: 12, createdAt: new Date(Date.now() - 125*24*60*60*1000), updatedAt: new Date(Date.now() - 90*24*60*60*1000) },
    ];
    await db.collection('campaigns').insertMany(campaigns);
    console.log('✓ Campaigns seeded:', campaigns.length, 'records');
    
    console.log('\n🎉 All data seeded successfully for user:', userName);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

seed();
