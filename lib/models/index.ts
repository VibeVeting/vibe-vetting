// Export all models
export { UserModel } from "./user";
export { BarterUserModel } from "./barter-user";
export type { BarterUser, CreatorProfile, CreateBarterUserInput, UpdateBarterUserInput } from "./barter-user";
export { BarterCompanyModel } from "./barter-company";
export type { BarterCompany, CompanyProfile, CreateBarterCompanyInput, UpdateBarterCompanyInput } from "./barter-company";
export { NotificationModel } from "./notification";
export { AnalyticsModel } from "./analytics";
export { CampaignPipelineModel } from "./campaign-pipeline";
export { CompanyModel } from "./company";
export { ContractTemplateModel } from "./contract-template";
export type { Company } from "./company";
export type { ContractTemplate, GeneratedContract, TemplateVariable } from "./contract-template";

// Export campaign pipeline types
export type {
  PipelineStage,
  SentimentType,
  NegotiationStatus,
  DocumentType,
  DocumentStatus,
  CampaignCreator,
  StageHistoryEntry,
  OutreachEmail,
  SentimentAnalysis,
  NegotiationDetails,
  CounterOffer,
  DeliverableItem,
  CampaignDocument,
  CreatorReview,
  CampaignPipelineSummary,
} from "./campaign-pipeline";

// Barter notification preferences
export { BarterNotificationPreferencesModel, defaultPreferences } from "./barter-notification-preferences";
export type { 
  NotificationPreferences, 
  SecurityLog, 
  BarterNotificationPreferencesDocument 
} from "./barter-notification-preferences";

// Add more model exports here as you create them
// export { PostModel } from "./post";
