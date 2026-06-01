"use client";

import { useState, useEffect } from 'react';

interface Creator {
  _id: string;
  name: string;
  platform: string;
  followers: number;
  engagementRate: number;
  profileImage?: string;
  askingPrice?: number;
  currentOffer?: number;
  negotiationRound?: number;
}

interface NegotiationHistory {
  timestamp: Date;
  type: 'offer' | 'counter' | 'accept' | 'decline' | 'message';
  from: 'brand' | 'creator';
  amount?: number;
  message: string;
}

interface AutoNegotiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  creator: Creator;
  onNegotiationComplete?: () => void;
}

export function AutoNegotiationModal({
  isOpen,
  onClose,
  campaignId,
  creator,
  onNegotiationComplete,
}: AutoNegotiationModalProps) {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState<NegotiationHistory[]>([]);
  const [suggestedOffer, setSuggestedOffer] = useState<number | null>(null);
  const [customOffer, setCustomOffer] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [aiReasoning, setAiReasoning] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [status, setStatus] = useState<'negotiating' | 'accepted' | 'declined' | 'pending'>('pending');

  useEffect(() => {
    if (isOpen) {
      fetchNegotiationStatus();
    }
  }, [isOpen, campaignId, creator._id]);

  const fetchNegotiationStatus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/campaigns/pipeline/auto-negotiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'get_status',
          campaignId,
          creatorId: creator._id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
        setStatus(data.status || 'pending');
        if (data.currentOffer) {
          setCustomOffer(data.currentOffer.toString());
        }
      }
    } catch (err) {
      console.error('Error fetching status:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateAIOffer = async () => {
    setGenerating(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/campaigns/pipeline/auto-negotiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'generate_counter',
          campaignId,
          creatorId: creator._id,
          data: {
            creatorAsk: creator.askingPrice || 0,
            currentOffer: parseFloat(customOffer) || creator.currentOffer || 0,
            followerCount: creator.followers,
            engagementRate: creator.engagementRate,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestedOffer(data.suggestedOffer);
        setAiReasoning(data.reasoning || '');
        setMessage(data.emailTemplate || '');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to generate AI offer');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const sendOffer = async (amount: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/campaigns/pipeline/auto-negotiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'process_negotiation',
          campaignId,
          creatorId: creator._id,
          data: {
            amount,
            message,
            type: 'offer',
          },
        }),
      });

      if (response.ok) {
        setSuccess('Offer sent successfully!');
        setHistory([
          ...history,
          {
            timestamp: new Date(),
            type: 'offer',
            from: 'brand',
            amount,
            message,
          },
        ]);
        setCustomOffer(amount.toString());
        setTimeout(() => setSuccess(null), 3000);
        if (onNegotiationComplete) {
          onNegotiationComplete();
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send offer');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const acceptDeal = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/campaigns/pipeline/auto-negotiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'accept_offer',
          campaignId,
          creatorId: creator._id,
          data: {
            finalAmount: creator.askingPrice || parseFloat(customOffer),
          },
        }),
      });

      if (response.ok) {
        setStatus('accepted');
        setSuccess('Deal accepted! Moving creator to contract stage.');
        if (onNegotiationComplete) {
          onNegotiationComplete();
        }
      }
    } catch (err) {
      setError('Failed to accept deal');
    } finally {
      setLoading(false);
    }
  };

  const declineDeal = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/campaigns/pipeline/auto-negotiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'decline_offer',
          campaignId,
          creatorId: creator._id,
          data: {
            reason: 'Budget constraints',
          },
        }),
      });

      if (response.ok) {
        setStatus('declined');
        if (onNegotiationComplete) {
          onNegotiationComplete();
        }
      }
    } catch (err) {
      setError('Failed to decline deal');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon ai-brain-logo">
              <div className="brain-core">
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fff" stopOpacity="1"/>
                      <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0.9"/>
                    </linearGradient>
                  </defs>
                  <path d="M20 4C14.5 4 10 8.5 10 14c0 2.5 1 4.8 2.5 6.5L10 28h8v8h4v-8h8l-2.5-7.5C29 18.8 30 16.5 30 14c0-5.5-4.5-10-10-10z" fill="url(#brainGrad)" className="brain-path"/>
                  <circle cx="15" cy="13" r="2" fill="rgba(102, 126, 234, 0.8)" className="neuron n1"/>
                  <circle cx="25" cy="13" r="2" fill="rgba(168, 85, 247, 0.8)" className="neuron n2"/>
                  <circle cx="20" cy="18" r="2.5" fill="rgba(236, 72, 153, 0.8)" className="neuron n3"/>
                  <line x1="15" y1="13" x2="20" y2="18" stroke="rgba(255,255,255,0.6)" strokeWidth="1" className="synapse"/>
                  <line x1="25" y1="13" x2="20" y2="18" stroke="rgba(255,255,255,0.6)" strokeWidth="1" className="synapse"/>
                </svg>
              </div>
              <div className="pulse-ring"></div>
              <div className="pulse-ring delay"></div>
            </div>
            <div className="header-text">
              <h2>AI Negotiation</h2>
              <p>Smart price negotiation with {creator.name}</p>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Creator Info Card */}
          <div className="creator-card">
            <div className="creator-info">
              <div className="creator-avatar">
                {creator.profileImage ? (
                  <img src={creator.profileImage} alt={creator.name} />
                ) : (
                  <i className="fa-solid fa-user"></i>
                )}
              </div>
              <div className="creator-details">
                <h3>{creator.name}</h3>
                <div className="creator-stats">
                  <span className="stat">
                    <i className="fa-solid fa-users"></i>
                    {formatFollowers(creator.followers)}
                  </span>
                  <span className="stat">
                    <i className="fa-solid fa-chart-line"></i>
                    {(creator.engagementRate * 100).toFixed(1)}%
                  </span>
                  <span className="stat platform">
                    <i className={`fa-brands fa-${creator.platform.toLowerCase()}`}></i>
                    {creator.platform}
                  </span>
                </div>
              </div>
            </div>
            <div className="price-info">
              <div className="price-item">
                <span className="price-label">Creator's Ask</span>
                <span className="price-value asking">{formatCurrency(creator.askingPrice || 0)}</span>
              </div>
              <div className="price-item">
                <span className="price-label">Your Offer</span>
                <span className="price-value offer">{formatCurrency(parseFloat(customOffer) || creator.currentOffer || 0)}</span>
              </div>
              <div className="price-item">
                <span className="price-label">Gap</span>
                <span className="price-value gap">
                  {formatCurrency(Math.abs((creator.askingPrice || 0) - (parseFloat(customOffer) || creator.currentOffer || 0)))}
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          {status !== 'pending' && (
            <div className={`status-badge status-${status}`}>
              <i className={`fa-solid fa-${status === 'accepted' ? 'check-circle' : status === 'declined' ? 'times-circle' : 'hourglass-half'}`}></i>
              {status === 'accepted' && 'Deal Accepted'}
              {status === 'declined' && 'Deal Declined'}
              {status === 'negotiating' && 'Negotiation in Progress'}
            </div>
          )}

          {/* Negotiation History */}
          {history.length > 0 && (
            <div className="history-section">
              <h4><i className="fa-solid fa-history"></i> Negotiation History</h4>
              <div className="history-timeline">
                {history.map((item, index) => (
                  <div key={index} className={`history-item ${item.from}`}>
                    <div className="history-bubble">
                      {item.amount && (
                        <div className="history-amount">{formatCurrency(item.amount)}</div>
                      )}
                      <div className="history-message">{item.message}</div>
                      <div className="history-time">
                        {new Date(item.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Offer Section */}
          {status !== 'accepted' && status !== 'declined' && (
            <div className="offer-section">
              <h4><i className="fa-solid fa-magic"></i> Generate AI Offer</h4>
              
              <div className="offer-input-group">
                <label>Your Offer Amount</label>
                <div className="input-row">
                  <div className="currency-input">
                    <span>$</span>
                    <input
                      type="number"
                      value={customOffer}
                      onChange={(e) => setCustomOffer(e.target.value)}
                      placeholder="Enter amount"
                    />
                  </div>
                  <button
                    className="btn btn-ai"
                    onClick={generateAIOffer}
                    disabled={generating}
                  >
                    {generating ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        Generating...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-wand-magic"></i>
                        AI Suggest
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* AI Suggestion */}
              {suggestedOffer && (
                <div className="ai-suggestion">
                  <div className="suggestion-header">
                    <i className="fa-solid fa-lightbulb"></i>
                    <span>AI Recommendation</span>
                  </div>
                  <div className="suggestion-amount">
                    <span>Suggested Offer:</span>
                    <strong>{formatCurrency(suggestedOffer)}</strong>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => setCustomOffer(suggestedOffer.toString())}
                    >
                      Use This
                    </button>
                  </div>
                  {aiReasoning && (
                    <div className="ai-reasoning">
                      <p>{aiReasoning}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Message Template */}
              <div className="message-section">
                <label>
                  <i className="fa-solid fa-envelope"></i>
                  Negotiation Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your negotiation message or use AI to generate one..."
                  rows={4}
                />
              </div>

              {/* Alerts */}
              {error && (
                <div className="alert alert-error">
                  <i className="fa-solid fa-exclamation-circle"></i>
                  {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success">
                  <i className="fa-solid fa-check-circle"></i>
                  {success}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {status !== 'accepted' && status !== 'declined' && (
          <div className="modal-footer">
            <button className="btn btn-danger" onClick={declineDeal} disabled={loading}>
              <i className="fa-solid fa-times"></i>
              Decline
            </button>
            <div className="footer-right">
              <button
                className="btn btn-success"
                onClick={acceptDeal}
                disabled={loading}
              >
                <i className="fa-solid fa-handshake"></i>
                Accept Current
              </button>
              <button
                className="btn btn-primary"
                onClick={() => sendOffer(parseFloat(customOffer))}
                disabled={loading || !customOffer}
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane"></i>
                    Send Offer
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Completed Footer */}
        {(status === 'accepted' || status === 'declined') && (
          <div className="modal-footer">
            <button className="btn btn-outline" onClick={onClose}>
              <i className="fa-solid fa-check"></i>
              Done
            </button>
          </div>
        )}

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 20px;
          }

          .modal-container {
            background: var(--bg-elevated);
            border-radius: 20px;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            border: 1px solid var(--border-color);
          }

          .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            background: var(--gradient-primary);
            color: white;
            flex-shrink: 0;
          }

          .header-content {
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .header-icon {
            width: 48px;
            height: 48px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
          }

          .header-icon.ai-brain-logo {
            position: relative;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(168, 85, 247, 0.3) 50%, rgba(236, 72, 153, 0.2) 100%);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            overflow: visible;
          }

          .brain-core {
            width: 32px;
            height: 32px;
            position: relative;
            z-index: 2;
          }

          .brain-core svg {
            width: 100%;
            height: 100%;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
          }

          .brain-path {
            animation: brainGlow 2s ease-in-out infinite;
          }

          .neuron {
            animation: neuronPulse 1.5s ease-in-out infinite;
          }

          .neuron.n1 { animation-delay: 0s; }
          .neuron.n2 { animation-delay: 0.5s; }
          .neuron.n3 { animation-delay: 1s; }

          .synapse {
            animation: synapseFlow 2s ease-in-out infinite;
          }

          .pulse-ring {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            height: 100%;
            border-radius: 12px;
            border: 2px solid rgba(255, 255, 255, 0.4);
            animation: pulseExpand 2s ease-out infinite;
          }

          .pulse-ring.delay {
            animation-delay: 1s;
          }

          @keyframes brainGlow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.85; }
          }

          @keyframes neuronPulse {
            0%, 100% { r: 2; opacity: 0.8; }
            50% { r: 2.5; opacity: 1; }
          }

          @keyframes synapseFlow {
            0%, 100% { stroke-opacity: 0.6; }
            50% { stroke-opacity: 1; }
          }

          @keyframes pulseExpand {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
            100% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
          }

          .header-text h2 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
          }

          .header-text p {
            margin: 4px 0 0;
            font-size: 13px;
            opacity: 0.9;
          }

          .close-button {
            width: 36px;
            height: 36px;
            border: none;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border-radius: 10px;
            cursor: pointer;
            font-size: 16px;
            transition: background 0.2s;
          }

          .close-button:hover {
            background: rgba(255, 255, 255, 0.3);
          }

          .modal-content {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
          }

          .creator-card {
            background: var(--bg-hover);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 20px;
          }

          .creator-info {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 16px;
          }

          .creator-avatar {
            width: 56px;
            height: 56px;
            border-radius: 14px;
            overflow: hidden;
            background: var(--primary);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
          }

          .creator-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .creator-details h3 {
            margin: 0 0 8px;
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary);
          }

          .creator-stats {
            display: flex;
            gap: 16px;
          }

          .creator-stats .stat {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: var(--text-secondary);
          }

          .creator-stats .stat i {
            color: var(--primary);
          }

          .creator-stats .platform {
            text-transform: capitalize;
          }

          .price-info {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }

          .price-item {
            background: var(--bg-elevated);
            padding: 12px;
            border-radius: 12px;
            text-align: center;
          }

          .price-label {
            display: block;
            font-size: 11px;
            font-weight: 500;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }

          .price-value {
            display: block;
            font-size: 18px;
            font-weight: 700;
          }

          .price-value.asking {
            color: var(--accent-red, #ef4444);
          }

          .price-value.offer {
            color: var(--accent-green);
          }

          .price-value.gap {
            color: var(--accent-orange);
          }

          .status-badge {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 20px;
          }

          .status-accepted {
            background: rgba(34, 197, 94, 0.15);
            color: var(--accent-green);
          }

          .status-declined {
            background: rgba(239, 68, 68, 0.15);
            color: var(--accent-red, #ef4444);
          }

          .status-negotiating {
            background: rgba(245, 158, 11, 0.15);
            color: var(--accent-orange);
          }

          .history-section {
            margin-bottom: 20px;
          }

          .history-section h4 {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0 0 16px;
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
          }

          .history-section h4 i {
            color: var(--primary);
          }

          .history-timeline {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .history-item {
            display: flex;
          }

          .history-item.brand {
            justify-content: flex-end;
          }

          .history-item.creator {
            justify-content: flex-start;
          }

          .history-bubble {
            max-width: 70%;
            padding: 12px 16px;
            border-radius: 16px;
            font-size: 13px;
          }

          .history-item.brand .history-bubble {
            background: var(--gradient-primary);
            color: white;
            border-bottom-right-radius: 4px;
          }

          .history-item.creator .history-bubble {
            background: var(--bg-hover);
            color: var(--text-primary);
            border-bottom-left-radius: 4px;
          }

          .history-amount {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 4px;
          }

          .history-message {
            opacity: 0.9;
            line-height: 1.4;
          }

          .history-time {
            font-size: 11px;
            opacity: 0.6;
            margin-top: 8px;
          }

          .offer-section {
            background: var(--bg-hover);
            border-radius: 16px;
            padding: 20px;
          }

          .offer-section h4 {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0 0 16px;
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
          }

          .offer-section h4 i {
            color: var(--primary);
          }

          .offer-input-group {
            margin-bottom: 16px;
          }

          .offer-input-group label {
            display: block;
            font-size: 12px;
            font-weight: 500;
            color: var(--text-secondary);
            margin-bottom: 8px;
          }

          .input-row {
            display: flex;
            gap: 12px;
          }

          .currency-input {
            flex: 1;
            display: flex;
            align-items: center;
            background: var(--bg-elevated);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            overflow: hidden;
          }

          .currency-input span {
            padding: 12px;
            background: var(--bg-hover);
            color: var(--text-secondary);
            font-weight: 500;
          }

          .currency-input input {
            flex: 1;
            border: none;
            padding: 12px;
            font-size: 16px;
            outline: none;
            background: transparent;
            color: var(--text-primary);
          }

          .ai-suggestion {
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.3) 100%);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
          }

          .suggestion-header {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            font-weight: 600;
            color: var(--accent-orange);
            margin-bottom: 12px;
          }

          .suggestion-amount {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 14px;
            color: var(--text-primary);
          }

          .suggestion-amount strong {
            font-size: 24px;
            color: var(--accent-orange);
          }

          .ai-reasoning {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid rgba(245, 158, 11, 0.3);
          }

          .ai-reasoning p {
            margin: 0;
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.5;
          }

          .message-section {
            margin-top: 16px;
          }

          .message-section label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            font-weight: 500;
            color: var(--text-secondary);
            margin-bottom: 8px;
          }

          .message-section textarea {
            width: 100%;
            border: 1px solid var(--border-color);
            border-radius: 10px;
            padding: 12px;
            font-size: 14px;
            resize: none;
            outline: none;
            font-family: inherit;
            background: var(--bg-elevated);
            color: var(--text-primary);
          }

          .message-section textarea:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }

          .alert {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 16px;
            border-radius: 10px;
            font-size: 14px;
            margin-top: 16px;
          }

          .alert-error {
            background: rgba(239, 68, 68, 0.15);
            color: #ef4444;
          }

          .alert-success {
            background: rgba(34, 197, 94, 0.15);
            color: #22c55e;
          }

          .modal-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            border-top: 1px solid var(--border-color);
            background: var(--bg-hover);
            flex-shrink: 0;
          }

          .footer-right {
            display: flex;
            gap: 12px;
          }

          .btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 10px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .btn-primary:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }

          .btn-ai {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
          }

          .btn-ai:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
          }

          .btn-success {
            background: #22c55e;
            color: white;
          }

          .btn-success:hover:not(:disabled) {
            background: #16a34a;
          }

          .btn-danger {
            background: #ef4444;
            color: white;
          }

          .btn-danger:hover:not(:disabled) {
            background: #dc2626;
          }

          .btn-outline {
            background: var(--bg-elevated);
            color: #667eea;
            border: 1px solid #667eea;
          }

          .btn-outline:hover {
            background: var(--bg-hover);
          }

          .btn-sm {
            padding: 5px 10px;
            font-size: 11px;
          }
        `}</style>
      </div>
    </div>
  );
}

export default AutoNegotiationModal;
