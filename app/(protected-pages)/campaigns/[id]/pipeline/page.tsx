"use client";

import { Sidebar } from "@/components/common/Sidebar";
import { TopBar } from "@/components/common/TopBar";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AutoNegotiationModal } from "@/components/pipeline/AutoNegotiationModal";
import { AutoNegotiationSettings } from "@/components/pipeline/AutoNegotiationSettings";
import { ContractManager } from "@/components/pipeline/ContractManager";
import { exportAsCSV } from "@/lib/export-utils";

// Pipeline stage types
type PipelineStage =
  | "outreach"
  | "awaiting_response"
  | "response_received"
  | "negotiation"
  | "agreement_reached"
  | "contract_sent"
  | "contract_signed"
  | "in_progress"
  | "completed"
  | "declined"
  | "no_response";

interface StageHistoryEntry {
  stage: PipelineStage;
  enteredAt: string;
  exitedAt?: string;
  notes?: string;
  durationMinutes?: number;
}

interface SentimentAnalysis {
  overallSentiment: string;
  confidenceScore: number;
  interestLevel: number;
  priceExpectation: string;
  concerns: string[];
  positiveIndicators: string[];
}

interface NegotiationDetails {
  status: string;
  initialOffer: number;
  creatorAsk?: number;
  finalPrice?: number;
  currency: string;
}

interface CreatorReview {
  rating: number;
  communicationScore: number;
  contentQualityScore: number;
  timelinessScore: number;
  overallExperience: string;
  wouldWorkAgain: boolean;
}

interface PipelineCreator {
  id: string;
  creatorName: string;
  creatorEmail: string;
  creatorHandle: string;
  platform: string;
  followers: string;
  engagementRate: number;
  currentStage: PipelineStage;
  stageHistory: StageHistoryEntry[];
  followUpCount: number;
  lastContactedAt?: string;
  sentimentAnalysis?: SentimentAnalysis;
  negotiation?: NegotiationDetails;
  agreedPrice?: number;
  review?: CreatorReview;
  totalCost?: number;
  totalDays?: number;
}

interface PipelineSummary {
  totalCreators: number;
  byStage: Record<PipelineStage, number>;
  avgResponseTime: number;
  avgNegotiationTime: number;
  totalBudgetSpent: number;
  successRate: number;
  avgSentimentScore: number;
}

// Stage configuration
const STAGE_CONFIG: Record<PipelineStage, { label: string; icon: string; color: string; bgColor: string }> = {
  outreach: { label: "Outreach", icon: "📧", color: "#3b82f6", bgColor: "#dbeafe" },
  awaiting_response: { label: "Awaiting Response", icon: "⏳", color: "#f59e0b", bgColor: "#fef3c7" },
  response_received: { label: "Response Received", icon: "💬", color: "#8b5cf6", bgColor: "#ede9fe" },
  negotiation: { label: "Negotiation", icon: "💰", color: "#ec4899", bgColor: "#fce7f3" },
  agreement_reached: { label: "Agreement Reached", icon: "🤝", color: "#10b981", bgColor: "#d1fae5" },
  contract_sent: { label: "Contract Sent", icon: "📄", color: "#6366f1", bgColor: "#e0e7ff" },
  contract_signed: { label: "Contract Signed", icon: "✍️", color: "#14b8a6", bgColor: "#ccfbf1" },
  in_progress: { label: "In Progress", icon: "🚀", color: "#f97316", bgColor: "#ffedd5" },
  completed: { label: "Completed", icon: "✅", color: "#22c55e", bgColor: "#dcfce7" },
  declined: { label: "Declined", icon: "❌", color: "#ef4444", bgColor: "#fee2e2" },
  no_response: { label: "No Response", icon: "🔇", color: "#6b7280", bgColor: "#f3f4f6" },
};

// Ordered stages for pipeline view
const PIPELINE_STAGES: PipelineStage[] = [
  "outreach",
  "awaiting_response",
  "response_received",
  "negotiation",
  "agreement_reached",
  "contract_sent",
  "contract_signed",
  "in_progress",
  "completed",
];

export default function CampaignPipelinePage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [creators, setCreators] = useState<PipelineCreator[]>([]);
  const [summary, setSummary] = useState<PipelineSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCreator, setSelectedCreator] = useState<PipelineCreator | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAutoNegotiateModal, setShowAutoNegotiateModal] = useState(false);
  const [showAutoNegotiateSettings, setShowAutoNegotiateSettings] = useState(false);
  const [showContractManager, setShowContractManager] = useState(false);
  const [activeTab, setActiveTab] = useState<"pipeline" | "list" | "analytics" | "settings">("pipeline");
  const [actionLoading, setActionLoading] = useState(false);

  // Campaign details from database
  const [campaign, setCampaign] = useState({
    name: "Loading...",
    brandName: "",
    budget: 0,
    creatorsCount: 0,
    matchedCreators: 0,
  });

  useEffect(() => {
    fetchCampaignDetails();
    fetchPipelineData();
  }, [campaignId]);

  const fetchCampaignDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/user/campaigns?id=${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.campaign) {
          setCampaign({
            name: data.campaign.name || "Untitled Campaign",
            brandName: data.campaign.brandName || "",
            budget: data.campaign.budget || 0,
            creatorsCount: data.campaign.creatorsCount || 0,
            matchedCreators: data.campaign.matchedCreators || 0,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching campaign details:", error);
    }
  };

  const fetchPipelineData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/campaigns/pipeline?campaignId=${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCreators(data.creators || []);
        setSummary(data.summary || null);
      }
    } catch (error) {
      console.error("Error fetching pipeline data:", error);
    } finally {
      setLoading(false);
    }
  };

  const performAction = async (action: string, data: any = {}) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/campaigns/pipeline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          campaignId,
          ...data,
        }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchPipelineData();
        return result;
      } else {
        alert(result.error || "Action failed");
        return null;
      }
    } catch (error) {
      console.error("Action error:", error);
      alert("Failed to perform action");
      return null;
    } finally {
      setActionLoading(false);
    }
  };

  const sendOutreachEmails = async () => {
    const outreachCreators = creators.filter((c) => c.currentStage === "outreach");
    if (outreachCreators.length === 0) {
      alert("No creators in outreach stage");
      return;
    }

    const result = await performAction("send_outreach", {
      data: {
        brandName: campaign.brandName,
        campaignName: campaign.name,
        deliverables: "• 1 Instagram Post\n• 2 Stories\n• 1 Reel",
        budgetRange: "$500 - $2,000",
        senderName: "Marketing Team",
      },
    });

    if (result) {
      alert(`Sent ${result.results?.successCount || 0} outreach emails!`);
    }
  };

  const sendFollowUps = async () => {
    const result = await performAction("send_follow_up", {
      data: {
        brandName: campaign.brandName,
        campaignName: campaign.name,
        senderName: "Marketing Team",
      },
    });

    if (result) {
      alert(`Sent ${result.results?.successCount || 0} follow-up emails!`);
    }
  };

  const analyzeSentiment = async (creatorId: string, response: string) => {
    try {
      const token = localStorage.getItem("token");
      const result = await fetch("/api/campaigns/pipeline/sentiment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "analyze_response",
          creatorId,
          response,
        }),
      });

      const data = await result.json();
      if (data.success) {
        await fetchPipelineData();
        return data.analysis;
      }
    } catch (error) {
      console.error("Sentiment analysis error:", error);
    }
    return null;
  };

  const getCreatorsByStage = (stage: PipelineStage) => {
    return creators.filter((c) => c.currentStage === stage);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
    return `${Math.round(minutes / 1440)}d`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <TopBar title="Loading Pipeline..." />
          <div className="page-content">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading pipeline data...</p>
            </div>
          </div>
        </main>
        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <TopBar title={`Pipeline: ${campaign.name}`} />
        <div className="page-content">
          {/* Header */}
          <div className="pipeline-header">
            <div className="header-left">
              <button className="back-btn" onClick={() => router.push('/campaigns')}>
                <i className="fa-solid fa-arrow-left"></i> Back to Campaigns
              </button>
            </div>
            <div className="header-actions">
              <button
                className="action-btn secondary"
                onClick={() => {
                  if (!creators || creators.length === 0) {
                    alert('No creators to export');
                    return;
                  }
                  const exportData = creators.map(c => ({
                    'Creator Name': c.creatorName,
                    'Handle': c.creatorHandle,
                    'Email': c.creatorEmail,
                    'Platform': c.platform,
                    'Followers': c.followers,
                    'Engagement Rate': `${c.engagementRate}%`,
                    'Stage': c.currentStage,
                    'Sentiment': c.sentimentAnalysis?.overallSentiment || 'N/A',
                    'Agreed Price': c.agreedPrice || c.negotiation?.finalPrice || c.negotiation?.initialOffer || 'N/A'
                  }));
                  exportAsCSV(exportData, `pipeline-${campaign.name}-${new Date().toISOString().split('T')[0]}`);
                }}
              >
                📊 Export CSV
              </button>
              <button
                className="action-btn primary"
                onClick={sendOutreachEmails}
                disabled={actionLoading}
              >
                📧 Send Outreach Emails
              </button>
              <button
                className="action-btn secondary"
                onClick={sendFollowUps}
                disabled={actionLoading}
              >
                🔄 Send Follow-ups
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          {summary && (
            <div className="summary-stats">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <span className="stat-value">{summary.totalCreators}</span>
                  <span className="stat-label">Total Creators</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <span className="stat-value">{summary.successRate.toFixed(1)}%</span>
                  <span className="stat-label">Success Rate</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <span className="stat-value">{formatCurrency(summary.totalBudgetSpent)}</span>
                  <span className="stat-label">Budget Spent</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">😊</div>
                <div className="stat-content">
                  <span className="stat-value">{summary.avgSentimentScore.toFixed(1)}/10</span>
                  <span className="stat-label">Avg Sentiment</span>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === "pipeline" ? "active" : ""}`}
              onClick={() => setActiveTab("pipeline")}
            >
              🎯 Pipeline View
            </button>
            <button
              className={`tab ${activeTab === "list" ? "active" : ""}`}
              onClick={() => setActiveTab("list")}
            >
              📋 List View
            </button>
            <button
              className={`tab ${activeTab === "analytics" ? "active" : ""}`}
              onClick={() => setActiveTab("analytics")}
            >
              📊 Analytics
            </button>
            <button
              className={`tab ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              🤖 Auto-Negotiate
            </button>
          </div>

          {/* Pipeline View */}
          {activeTab === "pipeline" && (
            <div className="pipeline-board">
              {PIPELINE_STAGES.map((stage) => {
                const stageCreators = getCreatorsByStage(stage);
                const config = STAGE_CONFIG[stage];

                return (
                  <div key={stage} className="pipeline-column">
                    <div
                      className="column-header"
                      style={{ borderColor: config.color }}
                    >
                      <span className="stage-icon">{config.icon}</span>
                      <span className="stage-label">{config.label}</span>
                      <span
                        className="stage-count"
                        style={{ background: config.color }}
                      >
                        {stageCreators.length}
                      </span>
                    </div>
                    <div className="column-content">
                      {stageCreators.map((creator) => (
                        <div
                          key={creator.id}
                          className="creator-card"
                          onClick={() => setSelectedCreator(creator)}
                        >
                          <div className="creator-avatar">
                            {creator.creatorName.charAt(0)}
                          </div>
                          <div className="creator-info">
                            <span className="creator-name">
                              {creator.creatorName}
                            </span>
                            <span className="creator-handle">
                              {creator.creatorHandle}
                            </span>
                          </div>
                          <div className="creator-meta">
                            <span className="platform-badge">
                              {creator.platform}
                            </span>
                            {creator.sentimentAnalysis && (
                              <span
                                className="sentiment-badge"
                                style={{
                                  background:
                                    creator.sentimentAnalysis.overallSentiment ===
                                    "positive"
                                      ? "#dcfce7"
                                      : creator.sentimentAnalysis
                                          .overallSentiment === "negative"
                                      ? "#fee2e2"
                                      : "#fef3c7",
                                  color:
                                    creator.sentimentAnalysis.overallSentiment ===
                                    "positive"
                                      ? "#16a34a"
                                      : creator.sentimentAnalysis
                                          .overallSentiment === "negative"
                                      ? "#dc2626"
                                      : "#d97706",
                                }}
                              >
                                {creator.sentimentAnalysis.interestLevel}/10
                              </span>
                            )}
                          </div>
                          {/* Pricing & Contract Section */}
                          {(creator.agreedPrice || creator.negotiation) && (
                            <div className="creator-pricing">
                              {creator.agreedPrice ? (
                                <div className="agreed-price">
                                  <i className="fa-solid fa-check-circle"></i>
                                  {formatCurrency(creator.agreedPrice)}
                                </div>
                              ) : creator.negotiation?.initialOffer ? (
                                <div className="offer-price">
                                  <span className="price-label">Offer:</span>
                                  {formatCurrency(creator.negotiation.initialOffer)}
                                  {creator.negotiation.creatorAsk && (
                                    <span className="ask-price">
                                      Ask: {formatCurrency(creator.negotiation.creatorAsk)}
                                    </span>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          )}
                          {/* Contract Quick Action */}
                          {(stage === 'agreement_reached' || stage === 'contract_sent' || stage === 'contract_signed') && (
                            <button 
                              className="contract-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCreator(creator);
                                setShowContractManager(true);
                              }}
                            >
                              <i className="fa-solid fa-file-contract"></i>
                              {stage === 'agreement_reached' ? 'Create Contract' : 
                               stage === 'contract_sent' ? 'View Contract' : 'Signed ✓'}
                            </button>
                          )}
                        </div>
                      ))}
                      {stageCreators.length === 0 && (
                        <div className="empty-column">No creators</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List View */}
          {activeTab === "list" && (
            <div className="list-view">
              <table className="creators-table">
                <thead>
                  <tr>
                    <th>Creator</th>
                    <th>Platform</th>
                    <th>Followers</th>
                    <th>Stage</th>
                    <th>Sentiment</th>
                    <th>Price</th>
                    <th>Days</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {creators.map((creator) => {
                    const config = STAGE_CONFIG[creator.currentStage];
                    return (
                      <tr key={creator.id}>
                        <td>
                          <div className="creator-cell">
                            <div className="creator-avatar small">
                              {creator.creatorName.charAt(0)}
                            </div>
                            <div>
                              <div className="creator-name">
                                {creator.creatorName}
                              </div>
                              <div className="creator-handle">
                                {creator.creatorHandle}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{creator.platform}</td>
                        <td>{creator.followers}</td>
                        <td>
                          <span
                            className="stage-pill"
                            style={{
                              background: config.bgColor,
                              color: config.color,
                            }}
                          >
                            {config.icon} {config.label}
                          </span>
                        </td>
                        <td>
                          {creator.sentimentAnalysis ? (
                            <span className="sentiment-score">
                              {creator.sentimentAnalysis.interestLevel}/10
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          {creator.agreedPrice
                            ? formatCurrency(creator.agreedPrice)
                            : "-"}
                        </td>
                        <td>{creator.totalDays || "-"}</td>
                        <td>
                          <button
                            className="view-btn"
                            onClick={() => setSelectedCreator(creator)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Analytics View */}
          {activeTab === "analytics" && summary && (
            <div className="analytics-view">
              <div className="analytics-grid">
                {/* Stage Distribution */}
                <div className="analytics-card">
                  <h3>Stage Distribution</h3>
                  <div className="stage-bars">
                    {PIPELINE_STAGES.map((stage) => {
                      const count = summary.byStage[stage] || 0;
                      const percentage =
                        summary.totalCreators > 0
                          ? (count / summary.totalCreators) * 100
                          : 0;
                      const config = STAGE_CONFIG[stage];

                      return (
                        <div key={stage} className="stage-bar-row">
                          <span className="bar-label">
                            {config.icon} {config.label}
                          </span>
                          <div className="bar-container">
                            <div
                              className="bar-fill"
                              style={{
                                width: `${percentage}%`,
                                background: config.color,
                              }}
                            />
                          </div>
                          <span className="bar-value">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Funnel */}
                <div className="analytics-card">
                  <h3>Conversion Funnel</h3>
                  <div className="funnel">
                    {[
                      { stage: "outreach", label: "Outreach Sent" },
                      { stage: "response_received", label: "Responded" },
                      { stage: "negotiation", label: "Negotiating" },
                      { stage: "agreement_reached", label: "Agreed" },
                      { stage: "completed", label: "Completed" },
                    ].map((item, index) => {
                      const count =
                        summary.byStage[item.stage as PipelineStage] || 0;
                      const totalSent =
                        summary.totalCreators -
                        (summary.byStage["outreach"] || 0);
                      const percentage =
                        totalSent > 0 ? (count / totalSent) * 100 : 0;

                      return (
                        <div key={item.stage} className="funnel-step">
                          <div
                            className="funnel-bar"
                            style={{
                              width: `${Math.max(20, 100 - index * 15)}%`,
                            }}
                          >
                            <span className="funnel-label">{item.label}</span>
                            <span className="funnel-value">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Timing Stats */}
                <div className="analytics-card">
                  <h3>Performance Metrics</h3>
                  <div className="metrics-list">
                    <div className="metric-row">
                      <span className="metric-label">Avg Response Time</span>
                      <span className="metric-value">
                        {formatDuration(summary.avgResponseTime / 60000)}
                      </span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">
                        Avg Negotiation Time
                      </span>
                      <span className="metric-value">
                        {formatDuration(summary.avgNegotiationTime / 60000)}
                      </span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">Response Rate</span>
                      <span className="metric-value">
                        {(
                          ((summary.byStage["response_received"] || 0) /
                            Math.max(
                              1,
                              summary.totalCreators -
                                (summary.byStage["outreach"] || 0)
                            )) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">Budget Utilization</span>
                      <span className="metric-value">
                        {((summary.totalBudgetSpent / campaign.budget) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Failed/Declined */}
                <div className="analytics-card warning">
                  <h3>Attention Needed</h3>
                  <div className="attention-stats">
                    <div className="attention-item">
                      <span className="attention-icon">🔇</span>
                      <span className="attention-value">
                        {summary.byStage["no_response"] || 0}
                      </span>
                      <span className="attention-label">No Response</span>
                    </div>
                    <div className="attention-item">
                      <span className="attention-icon">❌</span>
                      <span className="attention-value">
                        {summary.byStage["declined"] || 0}
                      </span>
                      <span className="attention-label">Declined</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Auto-Negotiate Settings Tab */}
          {activeTab === "settings" && (
            <div className="settings-view">
              <AutoNegotiationSettings 
                campaignId={campaignId} 
                onSettingsChange={() => fetchPipelineData()}
              />
            </div>
          )}

          {/* Creator Detail Modal */}
          {selectedCreator && (
            <div className="modal-overlay" onClick={() => setSelectedCreator(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button
                  className="modal-close"
                  onClick={() => setSelectedCreator(null)}
                >
                  ×
                </button>

                <div className="creator-detail-header">
                  <div className="creator-avatar large">
                    {selectedCreator.creatorName.charAt(0)}
                  </div>
                  <div className="creator-detail-info">
                    <h2>{selectedCreator.creatorName}</h2>
                    <p>{selectedCreator.creatorHandle}</p>
                    <div className="creator-tags">
                      <span className="tag">{selectedCreator.platform}</span>
                      <span className="tag">{selectedCreator.followers} followers</span>
                      <span className="tag">{selectedCreator.engagementRate}% engagement</span>
                    </div>
                  </div>
                  <div
                    className="stage-badge"
                    style={{
                      background: STAGE_CONFIG[selectedCreator.currentStage].bgColor,
                      color: STAGE_CONFIG[selectedCreator.currentStage].color,
                    }}
                  >
                    {STAGE_CONFIG[selectedCreator.currentStage].icon}{" "}
                    {STAGE_CONFIG[selectedCreator.currentStage].label}
                  </div>
                </div>

                {/* Stage History */}
                <div className="detail-section">
                  <h3>📍 Journey Timeline</h3>
                  <div className="timeline">
                    {selectedCreator.stageHistory.map((entry, index) => {
                      const config = STAGE_CONFIG[entry.stage];
                      return (
                        <div key={index} className="timeline-item">
                          <div
                            className="timeline-dot"
                            style={{ background: config.color }}
                          />
                          <div className="timeline-content">
                            <span className="timeline-stage">
                              {config.icon} {config.label}
                            </span>
                            <span className="timeline-date">
                              {new Date(entry.enteredAt).toLocaleDateString()}
                            </span>
                            {entry.durationMinutes && (
                              <span className="timeline-duration">
                                ({formatDuration(entry.durationMinutes)})
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sentiment Analysis */}
                {selectedCreator.sentimentAnalysis && (
                  <div className="detail-section">
                    <h3>🎭 Sentiment Analysis</h3>
                    <div className="sentiment-details">
                      <div className="sentiment-score-large">
                        <span className="score">
                          {selectedCreator.sentimentAnalysis.interestLevel}
                        </span>
                        <span className="score-label">/10 Interest</span>
                      </div>
                      <div className="sentiment-meta">
                        <div className="sentiment-row">
                          <span>Overall:</span>
                          <span className="sentiment-value">
                            {selectedCreator.sentimentAnalysis.overallSentiment}
                          </span>
                        </div>
                        <div className="sentiment-row">
                          <span>Confidence:</span>
                          <span>
                            {(
                              selectedCreator.sentimentAnalysis.confidenceScore * 100
                            ).toFixed(0)}
                            %
                          </span>
                        </div>
                        <div className="sentiment-row">
                          <span>Price Expectation:</span>
                          <span>
                            {selectedCreator.sentimentAnalysis.priceExpectation}
                          </span>
                        </div>
                      </div>
                    </div>
                    {selectedCreator.sentimentAnalysis.concerns.length > 0 && (
                      <div className="concerns-list">
                        <strong>Concerns:</strong>
                        <ul>
                          {selectedCreator.sentimentAnalysis.concerns.map(
                            (c, i) => (
                              <li key={i}>{c}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Negotiation Details */}
                {selectedCreator.negotiation && (
                  <div className="detail-section">
                    <h3>💰 Negotiation</h3>
                    <div className="negotiation-details">
                      <div className="price-row">
                        <span>Initial Offer:</span>
                        <span>
                          {formatCurrency(selectedCreator.negotiation.initialOffer)}
                        </span>
                      </div>
                      {selectedCreator.negotiation.creatorAsk && (
                        <div className="price-row">
                          <span>Creator Ask:</span>
                          <span>
                            {formatCurrency(selectedCreator.negotiation.creatorAsk)}
                          </span>
                        </div>
                      )}
                      {selectedCreator.negotiation.finalPrice && (
                        <div className="price-row final">
                          <span>Final Price:</span>
                          <span>
                            {formatCurrency(selectedCreator.negotiation.finalPrice)}
                          </span>
                        </div>
                      )}
                      <div className="negotiation-status">
                        Status:{" "}
                        <span className={`status-${selectedCreator.negotiation.status}`}>
                          {selectedCreator.negotiation.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Review */}
                {selectedCreator.review && (
                  <div className="detail-section">
                    <h3>⭐ Review</h3>
                    <div className="review-details">
                      <div className="review-score">
                        <span className="stars">
                          {"★".repeat(selectedCreator.review.rating)}
                          {"☆".repeat(5 - selectedCreator.review.rating)}
                        </span>
                        <span className="rating">
                          {selectedCreator.review.rating}/5
                        </span>
                      </div>
                      <div className="review-breakdown">
                        <div className="review-item">
                          <span>Communication</span>
                          <span>{selectedCreator.review.communicationScore}/5</span>
                        </div>
                        <div className="review-item">
                          <span>Content Quality</span>
                          <span>{selectedCreator.review.contentQualityScore}/5</span>
                        </div>
                        <div className="review-item">
                          <span>Timeliness</span>
                          <span>{selectedCreator.review.timelinessScore}/5</span>
                        </div>
                      </div>
                      <p className="review-text">
                        {selectedCreator.review.overallExperience}
                      </p>
                      <div className="would-work-again">
                        {selectedCreator.review.wouldWorkAgain
                          ? "✅ Would work again"
                          : "❌ Would not work again"}
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary Stats */}
                {(selectedCreator.totalCost || selectedCreator.totalDays) && (
                  <div className="detail-section summary">
                    <h3>📊 Summary</h3>
                    <div className="summary-grid">
                      <div className="summary-item">
                        <span className="summary-value">
                          {formatCurrency(selectedCreator.totalCost || 0)}
                        </span>
                        <span className="summary-label">Total Cost</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-value">
                          {selectedCreator.totalDays || 0}
                        </span>
                        <span className="summary-label">Days</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="modal-actions">
                  {selectedCreator.currentStage === "response_received" && (
                    <button
                      className="action-btn primary"
                      onClick={() => {
                        setShowNegotiationModal(true);
                      }}
                    >
                      💰 Start Negotiation
                    </button>
                  )}
                  {selectedCreator.currentStage === "negotiation" && (
                    <button
                      className="action-btn ai-gradient"
                      onClick={() => {
                        setShowAutoNegotiateModal(true);
                      }}
                    >
                      🤖 AI Auto-Negotiate
                    </button>
                  )}
                  {(selectedCreator.currentStage === "agreement_reached" || 
                    selectedCreator.currentStage === "contract_sent" ||
                    selectedCreator.currentStage === "contract_signed") && (
                    <button
                      className="action-btn contract"
                      onClick={() => setShowContractManager(true)}
                    >
                      📄 Manage Contract & Pricing
                    </button>
                  )}
                  {selectedCreator.currentStage === "contract_signed" && (
                    <button
                      className="action-btn primary"
                      onClick={() =>
                        performAction("start_campaign", {
                          creatorId: selectedCreator.id,
                          data: { campaignName: campaign.name },
                        })
                      }
                    >
                      🚀 Start Campaign
                    </button>
                  )}
                  {selectedCreator.currentStage === "in_progress" && (
                    <button
                      className="action-btn success"
                      onClick={() =>
                        performAction("complete_campaign", {
                          creatorId: selectedCreator.id,
                          data: { campaignName: campaign.name },
                        })
                      }
                    >
                      ✅ Complete Campaign
                    </button>
                  )}
                  {selectedCreator.currentStage === "completed" &&
                    !selectedCreator.review && (
                      <button
                        className="action-btn primary"
                        onClick={() => setShowReviewModal(true)}
                      >
                        ⭐ Add Review
                      </button>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Auto-Negotiation Modal */}
          {showAutoNegotiateModal && selectedCreator && (
            <AutoNegotiationModal
              isOpen={showAutoNegotiateModal}
              onClose={() => setShowAutoNegotiateModal(false)}
              campaignId={campaignId}
              creator={{
                _id: selectedCreator.id,
                name: selectedCreator.creatorName,
                platform: selectedCreator.platform,
                followers: parseInt(selectedCreator.followers?.replace(/[^\d]/g, '') || '0'),
                engagementRate: selectedCreator.engagementRate / 100,
                askingPrice: selectedCreator.negotiation?.creatorAsk,
                currentOffer: selectedCreator.negotiation?.initialOffer,
              }}
              onNegotiationComplete={() => {
                fetchPipelineData();
                setShowAutoNegotiateModal(false);
              }}
            />
          )}

          {/* Contract Manager Modal */}
          {showContractManager && selectedCreator && (
            <ContractManager
              creator={{
                id: selectedCreator.id,
                creatorName: selectedCreator.creatorName,
                creatorEmail: selectedCreator.creatorEmail,
                creatorHandle: selectedCreator.creatorHandle,
                platform: selectedCreator.platform,
                agreedPrice: selectedCreator.agreedPrice,
                negotiation: selectedCreator.negotiation,
              }}
              campaignName={campaign.name}
              brandName={campaign.brandName}
              onClose={() => setShowContractManager(false)}
              onUpdate={() => {
                fetchPipelineData();
              }}
            />
          )}
        </div>
      </main>
      <style jsx>{styles}</style>
    </div>
  );
}

const styles = `
  .app-container {
    display: flex;
    min-height: 100vh;
    background: #f8fafc;
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .page-content {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    gap: 16px;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e2e8f0;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Header */
  .pipeline-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
  }

  .header-left h1 {
    margin: 8px 0 4px;
    font-size: 28px;
    font-weight: 700;
    color: #1a202c;
  }

  .back-btn {
    background: none;
    border: none;
    color: #667eea;
    cursor: pointer;
    font-size: 14px;
    padding: 0;
  }

  .campaign-name {
    color: #718096;
    font-size: 14px;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }

  .action-btn {
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }

  .action-btn.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .action-btn.secondary {
    background: white;
    color: #667eea;
    border: 2px solid #667eea;
  }

  .action-btn.success {
    background: #10b981;
    color: white;
  }

  .action-btn.ai-gradient {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
  }

  .action-btn.ai-gradient:hover {
    background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
  }

  .action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .action-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Summary Stats */
  .summary-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .stat-icon {
    font-size: 32px;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #1a202c;
  }

  .stat-label {
    font-size: 13px;
    color: #718096;
  }

  /* Tabs */
  .tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    background: white;
    padding: 8px;
    border-radius: 12px;
    width: fit-content;
  }

  .tab {
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-weight: 500;
    color: #718096;
    transition: all 0.2s;
  }

  .tab.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .tab:hover:not(.active) {
    background: #f7fafc;
  }

  /* Pipeline Board */
  .pipeline-board {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    padding-bottom: 16px;
  }

  .pipeline-column {
    min-width: 280px;
    background: #f7fafc;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
  }

  .column-header {
    padding: 16px;
    border-bottom: 3px solid;
    display: flex;
    align-items: center;
    gap: 8px;
    background: white;
    border-radius: 12px 12px 0 0;
  }

  .stage-icon {
    font-size: 18px;
  }

  .stage-label {
    font-weight: 600;
    color: #1a202c;
    flex: 1;
  }

  .stage-count {
    padding: 2px 8px;
    border-radius: 12px;
    color: white;
    font-size: 12px;
    font-weight: 600;
  }

  .column-content {
    padding: 12px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 600px;
    overflow-y: auto;
  }

  .creator-card {
    background: white;
    border-radius: 10px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .creator-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .creator-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    float: left;
    margin-right: 10px;
  }

  .creator-avatar.small {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .creator-avatar.large {
    width: 64px;
    height: 64px;
    font-size: 24px;
  }

  .creator-info {
    overflow: hidden;
  }

  .creator-name {
    display: block;
    font-weight: 600;
    color: #1a202c;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .creator-handle {
    display: block;
    color: #718096;
    font-size: 12px;
  }

  .creator-meta {
    display: flex;
    gap: 6px;
    margin-top: 8px;
    clear: both;
  }

  .platform-badge {
    font-size: 11px;
    padding: 2px 6px;
    background: #e2e8f0;
    border-radius: 4px;
    color: #4a5568;
  }

  .sentiment-badge {
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
  }

  .agreed-price {
    margin-top: 8px;
    font-weight: 700;
    color: #10b981;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .agreed-price i {
    font-size: 12px;
  }

  .creator-pricing {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #f1f5f9;
  }

  .offer-price {
    font-size: 12px;
    color: #64748b;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
  }

  .offer-price .price-label {
    color: #94a3b8;
  }

  .offer-price .ask-price {
    font-size: 11px;
    color: #f59e0b;
    background: #fef3c7;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .contract-btn {
    width: 100%;
    margin-top: 8px;
    padding: 8px 12px;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s;
  }

  .contract-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }

  .action-btn.contract {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    color: white;
  }

  .action-btn.contract:hover {
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }

  .empty-column {
    text-align: center;
    color: #a0aec0;
    padding: 24px;
    font-size: 13px;
  }

  /* List View */
  .list-view {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .creators-table {
    width: 100%;
    border-collapse: collapse;
  }

  .creators-table th,
  .creators-table td {
    padding: 14px 16px;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }

  .creators-table th {
    background: #f7fafc;
    font-weight: 600;
    color: #4a5568;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .creator-cell {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .stage-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 500;
  }

  .sentiment-score {
    font-weight: 600;
    color: #667eea;
  }

  .view-btn {
    padding: 6px 12px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
  }

  /* Analytics View */
  .analytics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .analytics-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .analytics-card h3 {
    margin: 0 0 20px;
    font-size: 16px;
    color: #1a202c;
  }

  .analytics-card.warning {
    border: 2px solid #fbd38d;
  }

  .stage-bars {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .stage-bar-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .bar-label {
    width: 160px;
    font-size: 13px;
    color: #4a5568;
  }

  .bar-container {
    flex: 1;
    height: 20px;
    background: #e2e8f0;
    border-radius: 10px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: 10px;
    transition: width 0.3s;
  }

  .bar-value {
    width: 30px;
    text-align: right;
    font-weight: 600;
    color: #1a202c;
  }

  .funnel {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }

  .funnel-step {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .funnel-bar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 12px 20px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    color: white;
  }

  .funnel-label {
    font-weight: 500;
  }

  .funnel-value {
    font-weight: 700;
  }

  .metrics-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .metric-row {
    display: flex;
    justify-content: space-between;
    padding-bottom: 12px;
    border-bottom: 1px solid #e2e8f0;
  }

  .metric-label {
    color: #718096;
  }

  .metric-value {
    font-weight: 700;
    color: #1a202c;
  }

  .attention-stats {
    display: flex;
    gap: 24px;
    justify-content: center;
  }

  .attention-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .attention-icon {
    font-size: 32px;
  }

  .attention-value {
    font-size: 28px;
    font-weight: 700;
    color: #1a202c;
  }

  .attention-label {
    font-size: 13px;
    color: #718096;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 24px;
  }

  .modal-content {
    background: white;
    border-radius: 16px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    padding: 24px;
    position: relative;
  }

  .modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    border: none;
    background: #f7fafc;
    border-radius: 50%;
    cursor: pointer;
    font-size: 20px;
    color: #718096;
  }

  .creator-detail-header {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid #e2e8f0;
  }

  .creator-detail-info h2 {
    margin: 0 0 4px;
    font-size: 24px;
  }

  .creator-detail-info p {
    margin: 0 0 8px;
    color: #718096;
  }

  .creator-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .tag {
    padding: 4px 10px;
    background: #e2e8f0;
    border-radius: 16px;
    font-size: 12px;
    color: #4a5568;
  }

  .stage-badge {
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 13px;
    white-space: nowrap;
  }

  .detail-section {
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid #e2e8f0;
  }

  .detail-section h3 {
    margin: 0 0 16px;
    font-size: 16px;
    color: #1a202c;
  }

  .timeline {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-left: 20px;
    border-left: 2px solid #e2e8f0;
  }

  .timeline-item {
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
  }

  .timeline-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    position: absolute;
    left: -27px;
  }

  .timeline-content {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .timeline-stage {
    font-weight: 500;
  }

  .timeline-date {
    color: #718096;
    font-size: 13px;
  }

  .timeline-duration {
    color: #a0aec0;
    font-size: 12px;
  }

  .sentiment-details {
    display: flex;
    gap: 24px;
    align-items: center;
  }

  .sentiment-score-large {
    text-align: center;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    color: white;
  }

  .sentiment-score-large .score {
    font-size: 48px;
    font-weight: 700;
  }

  .sentiment-score-large .score-label {
    display: block;
    font-size: 14px;
    opacity: 0.9;
  }

  .sentiment-meta {
    flex: 1;
  }

  .sentiment-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #e2e8f0;
  }

  .sentiment-value {
    font-weight: 600;
    text-transform: capitalize;
  }

  .concerns-list {
    margin-top: 16px;
    padding: 12px;
    background: #fff5f5;
    border-radius: 8px;
  }

  .concerns-list ul {
    margin: 8px 0 0;
    padding-left: 20px;
  }

  .negotiation-details {
    background: #f7fafc;
    border-radius: 12px;
    padding: 16px;
  }

  .price-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #e2e8f0;
  }

  .price-row.final {
    background: #f0fff4;
    margin: 8px -16px -16px;
    padding: 16px;
    border-radius: 0 0 12px 12px;
    border: none;
  }

  .price-row.final span:last-child {
    font-size: 20px;
    font-weight: 700;
    color: #10b981;
  }

  .negotiation-status {
    margin-top: 12px;
    font-size: 13px;
    color: #718096;
  }

  .status-pending { color: #f59e0b; }
  .status-counter_offered { color: #8b5cf6; }
  .status-accepted { color: #10b981; }
  .status-rejected { color: #ef4444; }

  .review-details {
    text-align: center;
  }

  .review-score {
    margin-bottom: 16px;
  }

  .stars {
    font-size: 32px;
    color: #f59e0b;
    letter-spacing: 4px;
  }

  .rating {
    display: block;
    font-size: 14px;
    color: #718096;
    margin-top: 4px;
  }

  .review-breakdown {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-bottom: 16px;
  }

  .review-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
  }

  .review-item span:first-child {
    color: #718096;
  }

  .review-item span:last-child {
    font-weight: 600;
    color: #1a202c;
  }

  .review-text {
    padding: 16px;
    background: #f7fafc;
    border-radius: 8px;
    font-style: italic;
    color: #4a5568;
    margin-bottom: 12px;
  }

  .would-work-again {
    font-weight: 600;
  }

  .detail-section.summary {
    border: none;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 20px;
    color: white;
  }

  .detail-section.summary h3 {
    color: white;
    margin-bottom: 16px;
  }

  .summary-grid {
    display: flex;
    justify-content: center;
    gap: 48px;
  }

  .summary-item {
    text-align: center;
  }

  .summary-value {
    display: block;
    font-size: 32px;
    font-weight: 700;
  }

  .summary-label {
    display: block;
    font-size: 14px;
    opacity: 0.9;
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #e2e8f0;
  }

  /* Settings View */
  .settings-view {
    max-width: 800px;
  }

  @media (max-width: 1200px) {
    .summary-stats {
      grid-template-columns: repeat(2, 1fr);
    }

    .analytics-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .pipeline-header {
      flex-direction: column;
      gap: 16px;
    }

    .header-actions {
      width: 100%;
    }

    .action-btn {
      flex: 1;
    }

    .summary-stats {
      grid-template-columns: 1fr;
    }
  }
`;
