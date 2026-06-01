const { MongoClient, ObjectId } = require('mongodb');

async function seedNotifications() {
  const uri = 'mongodb+srv://vinay91098_db_user:JJ3NQLMpe3K2Uvu1@cluster0.hbhhpo6.mongodb.net/?appName=Cluster0';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('vibe-vetting');
    
    // Find user by email
    const user = await db.collection('users').findOne({ email: 'vinay91098@gmail.com' });
    if (!user) {
      console.log('User vinay91098@gmail.com not found');
      return;
    }
    
    const userId = user._id;
    console.log('Found user:', user.name, userId.toString());
    
    // Clear existing notifications
    await db.collection('notifications').deleteMany({ userId });
    console.log('Cleared existing notifications');
    
    // Create many mock notifications
    const notifications = [
      // Campaign notifications
      { title: '🚀 Campaign Launched', body: 'Your "Summer Fashion Launch" campaign is now live and scanning for creators!', type: 'campaign', read: false },
      { title: '📊 Campaign Update', body: 'Tech Influencers Q1 campaign has matched 15 new creators in the last 24 hours.', type: 'campaign', read: false },
      { title: '✅ Campaign Completed', body: 'Holiday Special Promotion campaign has ended with 89% success rate!', type: 'campaign', read: true },
      { title: '⚠️ Campaign Budget Alert', body: 'Your "Summer Fashion Launch" campaign has used 80% of its budget.', type: 'campaign', read: false },
      { title: '🎯 Campaign Goal Reached', body: 'Fitness Brand Ambassador program reached its target of 50 creator partnerships!', type: 'campaign', read: true },
      
      // Creator notifications
      { title: '⭐ New Perfect Match', body: 'Sarah Johnson (@sarahjcreates) has a 98% alignment score with your brand values!', type: 'creator', read: false },
      { title: '🔥 Trending Creator', body: 'Mike Chen (@mikechentech) is trending with 2.5M+ views this week.', type: 'creator', read: false },
      { title: '⚠️ Risk Alert', body: 'Emily Williams (@emwilliams) has been flagged for controversial content from 2 days ago.', type: 'creator', read: false },
      { title: '✅ Creator Verified', body: 'James Rodriguez (@jamesfit) verification complete - All metrics confirmed.', type: 'creator', read: true },
      { title: '📈 Creator Growth', body: 'Lisa Park (@lisaparkcooks) gained 150K followers this month - consider for upcoming campaigns.', type: 'creator', read: false },
      { title: '🤝 Partnership Request', body: 'David Kim (@davidkimgames) has expressed interest in collaboration.', type: 'creator', read: false },
      { title: '📉 Engagement Drop', body: 'Alex Thompson (@alexthompson) engagement rate dropped 15% - review recommended.', type: 'creator', read: false },
      { title: '🎉 Creator Milestone', body: 'Emma Davis (@emmadavis) just hit 1M followers! Perfect time to reach out.', type: 'creator', read: true },
      
      // Contract notifications
      { title: '📝 Contract Signed', body: 'Sarah Johnson signed the Summer Campaign contract. Ready to proceed!', type: 'contract', read: true },
      { title: '⏰ Contract Expiring', body: 'Contract with Mike Chen expires in 7 days. Consider renewal?', type: 'contract', read: false },
      { title: '💰 Payment Due', body: 'Payment of ₹4,16,500 due for completed deliverables from James Rodriguez.', type: 'contract', read: false },
      { title: '📋 Contract Review', body: 'New contract template "Influencer Ambassador" requires your approval.', type: 'contract', read: false },
      { title: '✍️ Counter-offer Received', body: 'Lisa Park has submitted a counter-offer for the Q2 campaign contract.', type: 'contract', read: false },
      
      // Analytics notifications
      { title: '📊 Weekly Report Ready', body: 'Your weekly performance report is ready. Click to view insights.', type: 'analytics', read: false },
      { title: '📈 ROI Milestone', body: 'Congratulations! Your campaigns have achieved 340% ROI this quarter!', type: 'analytics', read: true },
      { title: '🎯 Audience Insights', body: 'New audience demographic data available for your top 10 campaigns.', type: 'analytics', read: false },
      { title: '📉 Performance Alert', body: 'Beauty Campaign engagement is 20% below target. Review recommended.', type: 'analytics', read: false },
      { title: '💡 Optimization Tip', body: 'AI suggests increasing video content by 30% for better engagement.', type: 'analytics', read: false },
      
      // System notifications
      { title: '🔔 Welcome to VibeVetting!', body: 'Your account is set up and ready. Start by creating your first campaign!', type: 'system', read: true },
      { title: '🔐 Security Alert', body: 'New login detected from San Francisco, CA. Was this you?', type: 'system', read: true },
      { title: '⚙️ Settings Updated', body: 'Your notification preferences have been successfully updated.', type: 'system', read: true },
      { title: '💳 Payment Method', body: 'Your credit card ending in 4242 expires next month. Please update.', type: 'system', read: false },
      { title: '🌟 Feature Update', body: 'New AI-powered creator matching is now available! Try it out.', type: 'system', read: false },
      { title: '📱 Mobile App', body: 'VibeVetting mobile app is now available! Download from App Store.', type: 'system', read: true },
      
      // AI/Matching notifications
      { title: '🤖 AI Match Found', body: 'AI discovered 12 creators perfectly matching your "Eco-Friendly" brand values.', type: 'ai', read: false },
      { title: '🧠 Smart Recommendation', body: 'Based on past success, we recommend partnering with lifestyle creators this quarter.', type: 'ai', read: false },
      { title: '⚡ Instant Match', body: '5 creators from your watchlist are now available for immediate collaboration.', type: 'ai', read: false },
      { title: '🔍 Discovery Alert', body: 'AI found an emerging creator in your niche: @newinfluencer with 50K engaged followers.', type: 'ai', read: false },
      { title: '📊 Prediction Update', body: 'AI predicts 25% higher ROI if you launch the tech campaign in March.', type: 'ai', read: false },
      
      // Barter/Collaboration notifications
      { title: '🔄 Barter Offer', body: 'New product exchange offer received from Nike for 3 creator partnerships.', type: 'barter', read: false },
      { title: '✅ Barter Accepted', body: 'Adidas accepted your barter proposal for the fitness campaign.', type: 'barter', read: true },
      { title: '📦 Product Shipped', body: 'Sample products shipped to 5 creators for the summer review campaign.', type: 'barter', read: true },
      { title: '💼 Brand Partnership', body: 'Potential co-marketing opportunity with Spotify. Review the proposal.', type: 'barter', read: false },
      
      // More campaign updates
      { title: '🎬 Content Submitted', body: '3 creators submitted content for review on "Spring Collection" campaign.', type: 'campaign', read: false },
      { title: '✨ High Performance', body: '"Winter Wellness" campaign is outperforming by 45%! Great creator selection.', type: 'campaign', read: false },
      { title: '🎯 New Creator Added', body: 'Maria Santos was added to your "Latin Market Expansion" campaign.', type: 'campaign', read: false },
      { title: '📅 Campaign Reminder', body: '"Back to School" campaign launches in 3 days. All creators confirmed.', type: 'campaign', read: false },
      { title: '💡 Campaign Insight', body: 'Top performing content type: Reels. Consider adjusting content strategy.', type: 'campaign', read: false },
      
      // More creator updates
      { title: '🏆 Top Performer', body: 'Chris Taylor generated ₹37.5L in tracked sales last month!', type: 'creator', read: false },
      { title: '📸 Content Preview', body: 'Preview available: Jessica Lee submitted 5 photos for approval.', type: 'creator', read: false },
      { title: '🔄 Status Change', body: 'Ryan Park moved from "In Negotiation" to "Contracted" status.', type: 'creator', read: true },
      { title: '⚠️ Compliance Issue', body: 'Anna White missing FTC disclosure on recent sponsored post.', type: 'creator', read: false },
      { title: '🎂 Creator Anniversary', body: "It's been 1 year since you started working with Marcus Johnson!", type: 'creator', read: false },
      
      // Additional notifications
      { title: '💬 New Message', body: 'You have 5 unread messages from creators awaiting response.', type: 'message', read: false },
      { title: '📞 Call Scheduled', body: 'Video call with Sarah Johnson confirmed for tomorrow at 2 PM EST.', type: 'calendar', read: false },
      { title: '🏅 Achievement Unlocked', body: 'You verified 100 creators! Earning the "Talent Scout" badge.', type: 'achievement', read: true },
      { title: '📝 Survey Request', body: 'Help us improve! Complete our 2-minute feedback survey.', type: 'system', read: false },
      { title: '🚀 Beta Feature', body: 'You have early access to our new "Creator Comparison" tool!', type: 'system', read: false },
      { title: '💰 Invoice Ready', body: 'January 2026 invoice for ₹10,43,750 is ready for download.', type: 'billing', read: false },
      { title: '🎁 Referral Bonus', body: 'Your referral to Acme Corp was successful! ₹41,750 credit added.', type: 'billing', read: true },
      { title: '📋 Compliance Update', body: 'New FTC guidelines for influencer marketing. Review required.', type: 'compliance', read: false },
      { title: '🌐 Platform Update', body: 'Instagram API integration enhanced for better analytics.', type: 'system', read: true },
      { title: '🔔 Reminder', body: 'Don\'t forget to review pending creator applications (12 waiting).', type: 'reminder', read: false },
    ];
    
    // Add timestamps with varying dates (last 30 days)
    const now = Date.now();
    const notificationsWithDates = notifications.map((n, index) => ({
      ...n,
      userId,
      createdAt: new Date(now - (index * 4 * 60 * 60 * 1000)), // Every 4 hours going back
      ...(n.read ? { readAt: new Date(now - (index * 4 * 60 * 60 * 1000) + 30 * 60 * 1000) } : {}),
    }));
    
    // Insert all notifications
    const result = await db.collection('notifications').insertMany(notificationsWithDates);
    console.log(`✓ Inserted ${result.insertedCount} notifications for vinay91098@gmail.com`);
    
    // Show summary
    const unreadCount = notifications.filter(n => !n.read).length;
    const readCount = notifications.filter(n => n.read).length;
    console.log(`   - Unread: ${unreadCount}`);
    console.log(`   - Read: ${readCount}`);
    console.log(`   - Types: campaign, creator, contract, analytics, system, ai, barter, message, calendar, achievement, billing, compliance, reminder`);
    
  } catch (error) {
    console.error('Error seeding notifications:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

seedNotifications();
