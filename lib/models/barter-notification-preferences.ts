import { Collection, ObjectId } from "mongodb";
import clientPromise from "../mongodb";

const DB_NAME = "vibe-vetting";
const COLLECTION_NAME = "barter_notification_preferences";

export interface NotificationPreferences {
  // Email Notifications
  emailApplicationReceived: boolean;
  emailApplicationApproved: boolean;
  emailContentSubmitted: boolean;
  emailContentApproved: boolean;
  emailOfferExpiring: boolean;
  emailWeeklyDigest: boolean;
  emailMarketingUpdates: boolean;

  // Push Notifications
  pushApplicationReceived: boolean;
  pushApplicationApproved: boolean;
  pushContentSubmitted: boolean;
  pushContentApproved: boolean;
  pushOfferExpiring: boolean;

  // Security Notifications
  securityLoginAlert: boolean;
  securityPasswordChange: boolean;
  securityTwoFactorChange: boolean;
  securityNewDevice: boolean;
  securityUnusualActivity: boolean;
}

export interface SecurityLog {
  action: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  success: boolean;
  details?: string;
}

export interface BarterNotificationPreferencesDocument {
  _id?: ObjectId;
  companyId: ObjectId;
  preferences: NotificationPreferences;
  securityLogs: SecurityLog[];
  createdAt: Date;
  updatedAt: Date;
}

const defaultPreferences: NotificationPreferences = {
  // Email Notifications - mostly on by default
  emailApplicationReceived: true,
  emailApplicationApproved: true,
  emailContentSubmitted: true,
  emailContentApproved: true,
  emailOfferExpiring: true,
  emailWeeklyDigest: true,
  emailMarketingUpdates: false,

  // Push Notifications
  pushApplicationReceived: true,
  pushApplicationApproved: true,
  pushContentSubmitted: true,
  pushContentApproved: true,
  pushOfferExpiring: true,

  // Security Notifications - all on by default
  securityLoginAlert: true,
  securityPasswordChange: true,
  securityTwoFactorChange: true,
  securityNewDevice: true,
  securityUnusualActivity: true,
};

async function getCollection(): Promise<Collection<BarterNotificationPreferencesDocument>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<BarterNotificationPreferencesDocument>(COLLECTION_NAME);
}

export const BarterNotificationPreferencesModel = {
  // Get preferences for a company
  async findByCompanyId(companyId: string): Promise<BarterNotificationPreferencesDocument | null> {
    const collection = await getCollection();
    return collection.findOne({ companyId: new ObjectId(companyId) });
  },

  // Get or create preferences with defaults
  async getOrCreate(companyId: string): Promise<BarterNotificationPreferencesDocument> {
    const collection = await getCollection();
    let doc = await collection.findOne({ companyId: new ObjectId(companyId) });
    
    if (!doc) {
      const now = new Date();
      const newDoc: BarterNotificationPreferencesDocument = {
        companyId: new ObjectId(companyId),
        preferences: { ...defaultPreferences },
        securityLogs: [],
        createdAt: now,
        updatedAt: now,
      };
      const result = await collection.insertOne(newDoc);
      doc = { ...newDoc, _id: result.insertedId };
    }
    
    return doc;
  },

  // Update preferences
  async updatePreferences(
    companyId: string, 
    preferences: Partial<NotificationPreferences>
  ): Promise<BarterNotificationPreferencesDocument | null> {
    const collection = await getCollection();
    
    // Ensure document exists
    await this.getOrCreate(companyId);
    
    const updateFields: Record<string, boolean | Date> = { updatedAt: new Date() };
    for (const [key, value] of Object.entries(preferences)) {
      if (typeof value === 'boolean') {
        updateFields[`preferences.${key}`] = value;
      }
    }
    
    const result = await collection.findOneAndUpdate(
      { companyId: new ObjectId(companyId) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );
    
    return result;
  },

  // Add security log
  async addSecurityLog(companyId: string, log: Omit<SecurityLog, 'timestamp'>): Promise<boolean> {
    const collection = await getCollection();
    
    // Ensure document exists
    await this.getOrCreate(companyId);
    
    const securityLog: SecurityLog = {
      ...log,
      timestamp: new Date(),
    };
    
    const result = await collection.updateOne(
      { companyId: new ObjectId(companyId) },
      { 
        $push: { 
          securityLogs: { 
            $each: [securityLog], 
            $position: 0,
            $slice: 50 // Keep only last 50 logs
          } 
        },
        $set: { updatedAt: new Date() }
      }
    );
    
    return result.modifiedCount === 1;
  },

  // Get security logs
  async getSecurityLogs(companyId: string, limit: number = 20): Promise<SecurityLog[]> {
    const doc = await this.getOrCreate(companyId);
    return doc.securityLogs.slice(0, limit);
  },

  // Clear old security logs
  async clearSecurityLogs(companyId: string): Promise<boolean> {
    const collection = await getCollection();
    const result = await collection.updateOne(
      { companyId: new ObjectId(companyId) },
      { $set: { securityLogs: [], updatedAt: new Date() } }
    );
    return result.modifiedCount === 1;
  },
};

export { defaultPreferences };
