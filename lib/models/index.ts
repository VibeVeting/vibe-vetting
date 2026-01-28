// Export all models
export { UserModel } from "./user";
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

// Add more model exports here as you create them
// export { PostModel } from "./post";
