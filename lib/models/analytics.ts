import { Collection, ObjectId } from "mongodb";
import clientPromise from "../mongodb";

export interface VerificationTrendDocument {
  _id?: ObjectId;
  userId: ObjectId;
  date: Date;
  verified: number;
  matches: number;
}

const DB_NAME = "vibe-vetting";
const COLLECTION_NAME = "verification_trends";

async function getCollection(): Promise<Collection<VerificationTrendDocument>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<VerificationTrendDocument>(COLLECTION_NAME);
}

export const AnalyticsModel = {
  async getVerificationTrends(userId: string, period: string): Promise<{ day: string; verified: number; matches: number }[]> {
    const collection = await getCollection();
    
    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let labels: string[];

    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        // Show every 4 hours for cleaner display
        labels = Array.from({ length: 6 }, (_, i) => {
          const h = (now.getHours() - 20 + i * 4 + 24) % 24;
          const ampm = h >= 12 ? 'PM' : 'AM';
          const hour12 = h % 12 || 12;
          return `${hour12}${ampm}`;
        });
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        // Generate week labels with date ranges
        labels = Array.from({ length: 4 }, (_, i) => {
          const weekStart = new Date(now.getTime() - (28 - i * 7) * 24 * 60 * 60 * 1000);
          const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
          const startDay = weekStart.getDate();
          const endDay = weekEnd.getDate();
          const month = weekStart.toLocaleString('en', { month: 'short' });
          return `${month} ${startDay}-${endDay}`;
        });
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        // Generate month labels with actual month names
        labels = Array.from({ length: 3 }, (_, i) => {
          const monthDate = new Date(now.getTime() - (60 - i * 30) * 24 * 60 * 60 * 1000);
          return monthDate.toLocaleString('en', { month: 'short', year: '2-digit' });
        });
        break;
      case '7d':
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        // Generate labels with actual dates for last 7 days
        labels = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const day = dayNames[date.getDay()];
          const dateNum = date.getDate();
          const month = date.toLocaleString('en', { month: 'short' });
          return `${day} ${dateNum} ${month}`;
        });
        break;
    }

    // Fetch data from database
    const data = await collection
      .find({
        userId: new ObjectId(userId),
        date: { $gte: startDate, $lte: now },
      })
      .sort({ date: 1 })
      .toArray();

    // If no data in DB, return empty chart
    if (data.length === 0) {
      return labels.map((day) => ({
        day,
        verified: 0,
        matches: 0,
      }));
    }

    // Aggregate data based on period
    if (period === '7d') {
      const dayMap: Record<string, { verified: number; matches: number }> = {};
      labels.forEach((d) => (dayMap[d] = { verified: 0, matches: 0 }));
      
      data.forEach((doc) => {
        // Match document date to the corresponding label
        const docDate = new Date(doc.date);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const day = dayNames[docDate.getDay()];
        const dateNum = docDate.getDate();
        const month = docDate.toLocaleString('en', { month: 'short' });
        const label = `${day} ${dateNum} ${month}`;
        
        if (dayMap[label]) {
          dayMap[label].verified += doc.verified;
          dayMap[label].matches += doc.matches;
        }
      });

      return labels.map((day) => ({
        day,
        verified: dayMap[day]?.verified || 0,
        matches: dayMap[day]?.matches || 0,
      }));
    }

    if (period === '24h') {
      // Sum all data for last 24 hours grouped by 4-hour blocks
      const hourMap: Record<string, { verified: number; matches: number }> = {};
      labels.forEach((h) => (hourMap[h] = { verified: 0, matches: 0 }));
      
      data.forEach((doc) => {
        const h = doc.date.getHours();
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        // Round to nearest 4-hour block
        const blockHour = Math.floor(h / 4) * 4;
        const blockAmpm = blockHour >= 12 ? 'PM' : 'AM';
        const blockHour12 = blockHour % 12 || 12;
        const hourLabel = `${blockHour12}${blockAmpm}`;
        
        if (hourMap[hourLabel]) {
          hourMap[hourLabel].verified += doc.verified;
          hourMap[hourLabel].matches += doc.matches;
        }
      });

      return labels.map((hour) => ({
        day: hour,
        verified: hourMap[hour]?.verified || 0,
        matches: hourMap[hour]?.matches || 0,
      }));
    }

    if (period === '30d') {
      // Group into 4 weeks
      const weekData = [
        { verified: 0, matches: 0 },
        { verified: 0, matches: 0 },
        { verified: 0, matches: 0 },
        { verified: 0, matches: 0 },
      ];
      
      data.forEach((doc) => {
        const daysDiff = Math.floor((now.getTime() - doc.date.getTime()) / (24 * 60 * 60 * 1000));
        const weekIdx = Math.min(3, Math.floor((30 - daysDiff) / 7));
        if (weekIdx >= 0 && weekIdx < 4) {
          weekData[weekIdx].verified += doc.verified;
          weekData[weekIdx].matches += doc.matches;
        }
      });

      return labels.map((day, idx) => ({
        day,
        verified: weekData[idx]?.verified || 0,
        matches: weekData[idx]?.matches || 0,
      }));
    }

    if (period === '90d') {
      // Group into 3 months
      const monthData = [
        { verified: 0, matches: 0 },
        { verified: 0, matches: 0 },
        { verified: 0, matches: 0 },
      ];
      
      data.forEach((doc) => {
        const daysDiff = Math.floor((now.getTime() - doc.date.getTime()) / (24 * 60 * 60 * 1000));
        const monthIdx = Math.min(2, Math.floor((90 - daysDiff) / 30));
        if (monthIdx >= 0 && monthIdx < 3) {
          monthData[monthIdx].verified += doc.verified;
          monthData[monthIdx].matches += doc.matches;
        }
      });

      return labels.map((day, idx) => ({
        day,
        verified: monthData[idx]?.verified || 0,
        matches: monthData[idx]?.matches || 0,
      }));
    }

    // Fallback
    return labels.map((day) => ({ day, verified: 0, matches: 0 }));
  },

  async recordVerification(userId: string, verified: number, matches: number): Promise<void> {
    const collection = await getCollection();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await collection.updateOne(
      { userId: new ObjectId(userId), date: today },
      { $inc: { verified, matches } },
      { upsert: true }
    );
  },
};
