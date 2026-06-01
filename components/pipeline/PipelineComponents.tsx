"use client";

import { useState } from "react";

interface DeliverableItem {
  type: string;
  quantity: number;
  description: string;
}

interface NegotiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorName: string;
  creatorId: string;
  onStartNegotiation: (data: {
    creatorId: string;
    initialOffer: number;
    deliverables: DeliverableItem[];
    paymentTerms: string;
    currency: string;
  }) => void;
}

const DELIVERABLE_TYPES = [
  { value: "instagram_post", label: "Instagram Post" },
  { value: "instagram_story", label: "Instagram Story" },
  { value: "instagram_reel", label: "Instagram Reel" },
  { value: "youtube_video", label: "YouTube Video" },
  { value: "youtube_short", label: "YouTube Short" },
  { value: "twitter_post", label: "Twitter/X Post" },
  { value: "linkedin_post", label: "LinkedIn Post" },
  { value: "twitch_stream", label: "Twitch Stream" },
  { value: "blog_post", label: "Blog Post" },
  { value: "podcast_mention", label: "Podcast Mention" },
  { value: "live_stream", label: "Live Stream" },
  { value: "ugc_content", label: "UGC Content" },
];

const PAYMENT_TERMS = [
  "50% upfront, 50% on completion",
  "100% upfront",
  "100% on completion",
  "30% upfront, 70% on completion",
  "Net 30 after delivery",
  "Net 15 after delivery",
];

export function NegotiationModal({
  isOpen,
  onClose,
  creatorName,
  creatorId,
  onStartNegotiation,
}: NegotiationModalProps) {
  const [initialOffer, setInitialOffer] = useState(1000);
  const [currency, setCurrency] = useState("INR");
  const [paymentTerms, setPaymentTerms] = useState(PAYMENT_TERMS[0]);
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>([
    { type: "instagram_post", quantity: 1, description: "Feed post with product showcase" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addDeliverable = () => {
    setDeliverables([
      ...deliverables,
      { type: "instagram_story", quantity: 1, description: "" },
    ]);
  };

  const removeDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const updateDeliverable = (
    index: number,
    field: keyof DeliverableItem,
    value: string | number
  ) => {
    const updated = [...deliverables];
    updated[index] = { ...updated[index], [field]: value };
    setDeliverables(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onStartNegotiation({
        creatorId,
        initialOffer,
        deliverables,
        paymentTerms,
        currency,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <h2><i className="fa-solid fa-handshake" style={{ marginRight: '12px', color: 'var(--accent-green)' }}></i>Start Negotiation with {creatorName}</h2>
        <p className="modal-subtitle">
          Set your initial offer and deliverables for this collaboration.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Offer Amount */}
          <div className="form-section">
            <h3>Compensation</h3>
            <div className="offer-row">
              <div className="form-group">
                <label>Initial Offer</label>
                <div className="currency-input">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="currency-select"
                  >
                    <option value="INR">₹ INR</option>
                  </select>
                  <input
                    type="number"
                    value={initialOffer}
                    onChange={(e) => setInitialOffer(parseInt(e.target.value) || 0)}
                    min={0}
                    step={100}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Payment Terms</label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                >
                  {PAYMENT_TERMS.map((term) => (
                    <option key={term} value={term}>
                      {term}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Deliverables */}
          <div className="form-section">
            <div className="section-header">
              <h3>Deliverables</h3>
              <button type="button" className="add-btn" onClick={addDeliverable}>
                + Add Deliverable
              </button>
            </div>
            <div className="deliverables-list">
              {deliverables.map((deliverable, index) => (
                <div key={index} className="deliverable-item">
                  <select
                    value={deliverable.type}
                    onChange={(e) => updateDeliverable(index, "type", e.target.value)}
                  >
                    {DELIVERABLE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={deliverable.quantity}
                    onChange={(e) =>
                      updateDeliverable(index, "quantity", parseInt(e.target.value) || 1)
                    }
                    min={1}
                    max={100}
                    className="quantity-input"
                  />
                  <input
                    type="text"
                    value={deliverable.description}
                    onChange={(e) =>
                      updateDeliverable(index, "description", e.target.value)
                    }
                    placeholder="Description (optional)"
                    className="description-input"
                  />
                  {deliverables.length > 1 && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeDeliverable(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="offer-summary">
            <h4>Offer Summary</h4>
            <div className="summary-content">
              <div className="summary-row">
                <span>Total Compensation:</span>
                <span className="summary-value">
                  ₹{initialOffer.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="summary-row">
                <span>Deliverables:</span>
                <span>
                  {deliverables.reduce((sum, d) => sum + d.quantity, 0)} items
                </span>
              </div>
              <div className="summary-row">
                <span>Payment:</span>
                <span>{paymentTerms}</span>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Offer 📧"}
            </button>
          </div>
        </form>

        <style jsx>{`
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
            background: var(--bg-elevated);
            border-radius: 16px;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            padding: 32px;
            position: relative;
            border: 1px solid var(--border-color);
          }

          .modal-content.large {
            max-width: 700px;
          }

          .modal-close {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 32px;
            height: 32px;
            border: none;
            background: var(--bg-hover);
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            color: var(--text-muted);
          }

          h2 {
            margin: 0 0 8px;
            font-size: 24px;
            color: var(--text-primary);
          }

          .modal-subtitle {
            color: var(--text-muted);
            margin: 0 0 24px;
          }

          .form-section {
            margin-bottom: 24px;
            padding-bottom: 24px;
            border-bottom: 1px solid var(--border-color);
          }

          .form-section h3 {
            margin: 0 0 16px;
            font-size: 16px;
            color: var(--text-primary);
          }

          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }

          .section-header h3 {
            margin: 0;
          }

          .offer-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .form-group label {
            font-size: 14px;
            font-weight: 500;
            color: var(--text-secondary);
          }

          .currency-input {
            display: flex;
            border: 2px solid var(--border-color);
            border-radius: 8px;
            overflow: hidden;
          }

          .currency-select {
            width: 60px;
            border: none;
            background: var(--bg-hover);
            padding: 12px;
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
          }

          .currency-input input {
            flex: 1;
            border: none;
            padding: 12px;
            font-size: 18px;
            font-weight: 600;
            background: var(--bg-elevated);
            color: var(--text-primary);
          }

          select {
            padding: 12px;
            border: 2px solid var(--border-color);
            border-radius: 8px;
            font-size: 14px;
            background: var(--bg-elevated);
            color: var(--text-primary);
          }

          .add-btn {
            padding: 8px 16px;
            background: var(--gradient-primary);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          }

          .deliverables-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .deliverable-item {
            display: flex;
            gap: 12px;
            align-items: center;
          }

          .deliverable-item select {
            width: 180px;
          }

          .quantity-input {
            width: 70px;
            padding: 12px;
            border: 2px solid var(--border-color);
            border-radius: 8px;
            font-size: 14px;
            text-align: center;
            background: var(--bg-input);
            color: var(--text-primary);
          }

          .description-input {
            flex: 1;
            padding: 12px;
            border: 2px solid var(--border-color);
            border-radius: 8px;
            font-size: 14px;
            background: var(--bg-input);
            color: var(--text-primary);
          }

          .remove-btn {
            width: 32px;
            height: 32px;
            border: none;
            background: rgba(239, 68, 68, 0.15);
            color: var(--accent-red, #ef4444);
            border-radius: 8px;
            cursor: pointer;
            font-size: 18px;
          }

          .offer-summary {
            background: var(--gradient-primary);
            border-radius: 12px;
            padding: 20px;
            color: white;
            margin-bottom: 24px;
          }

          .offer-summary h4 {
            margin: 0 0 16px;
            font-size: 14px;
            opacity: 0.9;
          }

          .summary-content {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
          }

          .summary-value {
            font-size: 24px;
            font-weight: 700;
          }

          .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
          }

          .btn {
            padding: 10px 18px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            font-size: 13px;
          }

          .btn.primary {
            background: var(--gradient-primary);
            color: white;
          }

          .btn.secondary {
            background: var(--bg-hover);
            color: var(--text-secondary);
          }

          .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    </div>
  );
}

// Review Modal Component
interface CreatorReview {
  rating: number;
  communicationScore: number;
  contentQualityScore: number;
  timelinessScore: number;
  professionalismScore: number;
  overallExperience: string;
  wouldWorkAgain: boolean;
  highlights: string[];
  concerns: string[];
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorName: string;
  creatorId: string;
  onSubmitReview: (creatorId: string, review: CreatorReview) => void;
}

export function ReviewModal({
  isOpen,
  onClose,
  creatorName,
  creatorId,
  onSubmitReview,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [communicationScore, setCommunicationScore] = useState(5);
  const [contentQualityScore, setContentQualityScore] = useState(5);
  const [timelinessScore, setTimelinessScore] = useState(5);
  const [professionalismScore, setProfessionalismScore] = useState(5);
  const [overallExperience, setOverallExperience] = useState("");
  const [wouldWorkAgain, setWouldWorkAgain] = useState(true);
  const [highlights, setHighlights] = useState("");
  const [concerns, setConcerns] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmitReview(creatorId, {
        rating,
        communicationScore,
        contentQualityScore,
        timelinessScore,
        professionalismScore,
        overallExperience,
        wouldWorkAgain,
        highlights: highlights.split("\n").filter((h) => h.trim()),
        concerns: concerns.split("\n").filter((c) => c.trim()),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (v: number) => void;
    label: string;
  }) => (
    <div className="star-rating">
      <span className="rating-label">{label}</span>
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star ${star <= value ? "active" : ""}`}
            onClick={() => onChange(star)}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <h2>⭐ Review {creatorName}</h2>
        <p className="modal-subtitle">
          Share your experience working with this creator.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Overall Rating */}
          <div className="form-section">
            <h3>Overall Rating</h3>
            <div className="overall-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star large ${star <= rating ? "active" : ""}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
              <span className="rating-text">{rating}/5</span>
            </div>
          </div>

          {/* Detailed Scores */}
          <div className="form-section">
            <h3>Detailed Scores</h3>
            <div className="ratings-grid">
              <StarRating
                label="Communication"
                value={communicationScore}
                onChange={setCommunicationScore}
              />
              <StarRating
                label="Content Quality"
                value={contentQualityScore}
                onChange={setContentQualityScore}
              />
              <StarRating
                label="Timeliness"
                value={timelinessScore}
                onChange={setTimelinessScore}
              />
              <StarRating
                label="Professionalism"
                value={professionalismScore}
                onChange={setProfessionalismScore}
              />
            </div>
          </div>

          {/* Written Review */}
          <div className="form-section">
            <h3>Written Review</h3>
            <div className="form-group">
              <label>Overall Experience</label>
              <textarea
                value={overallExperience}
                onChange={(e) => setOverallExperience(e.target.value)}
                placeholder="Describe your experience working with this creator..."
                rows={4}
                required
              />
            </div>
            <div className="two-columns">
              <div className="form-group">
                <label>Highlights (one per line)</label>
                <textarea
                  value={highlights}
                  onChange={(e) => setHighlights(e.target.value)}
                  placeholder="What went well?&#10;Great communication&#10;Delivered early"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Areas for Improvement (one per line)</label>
                <textarea
                  value={concerns}
                  onChange={(e) => setConcerns(e.target.value)}
                  placeholder="What could be better?&#10;Minor delays&#10;Revisions needed"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Would Work Again */}
          <div className="form-section">
            <h3>Would you work with this creator again?</h3>
            <div className="work-again-options">
              <button
                type="button"
                className={`option-btn ${wouldWorkAgain ? "active yes" : ""}`}
                onClick={() => setWouldWorkAgain(true)}
              >
                ✅ Yes, definitely!
              </button>
              <button
                type="button"
                className={`option-btn ${!wouldWorkAgain ? "active no" : ""}`}
                onClick={() => setWouldWorkAgain(false)}
              >
                ❌ Probably not
              </button>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 24px;
          }

          .modal-content {
            background: var(--bg-elevated);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            padding: 32px;
            position: relative;
            box-shadow: var(--shadow-lg);
          }

          .modal-content.large {
            max-width: 700px;
          }

          .modal-close {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 32px;
            height: 32px;
            border: none;
            background: var(--bg-hover);
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            color: var(--text-secondary);
            transition: all 0.2s;
          }

          .modal-close:hover {
            background: var(--bg-active);
            color: var(--text-primary);
          }

          h2 {
            margin: 0 0 8px;
            font-size: 24px;
            color: var(--text-primary);
          }

          .modal-subtitle {
            color: var(--text-secondary);
            margin: 0 0 24px;
          }

          .form-section {
            margin-bottom: 24px;
            padding-bottom: 24px;
            border-bottom: 1px solid var(--border-color);
          }

          .form-section h3 {
            margin: 0 0 16px;
            font-size: 16px;
            color: var(--text-primary);
          }

          .overall-rating {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .star {
            background: none;
            border: none;
            font-size: 24px;
            color: var(--border-color);
            cursor: pointer;
            transition: color 0.2s;
          }

          .star.active {
            color: var(--accent-orange);
          }

          .star.large {
            font-size: 40px;
          }

          .star:hover {
            color: var(--accent-orange);
          }

          .rating-text {
            margin-left: 16px;
            font-size: 24px;
            font-weight: 700;
            color: var(--text-primary);
          }

          .ratings-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          .star-rating {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
          }

          .rating-label {
            font-weight: 500;
            color: var(--text-secondary);
          }

          .stars {
            display: flex;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .form-group label {
            font-size: 14px;
            font-weight: 500;
            color: var(--text-secondary);
          }

          textarea {
            padding: 12px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-size: 14px;
            resize: vertical;
            font-family: inherit;
            background: var(--bg-input);
            color: var(--text-primary);
          }

          textarea:focus {
            outline: none;
            border-color: var(--primary);
          }

          .two-columns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-top: 16px;
          }

          .work-again-options {
            display: flex;
            gap: 16px;
          }

          .option-btn {
            flex: 1;
            padding: 16px;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            background: var(--bg-elevated);
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.2s;
            color: var(--text-primary);
          }

          .option-btn.active.yes {
            border-color: var(--accent-green);
            background: rgba(34, 197, 94, 0.1);
            color: var(--accent-green);
          }

          .option-btn.active.no {
            border-color: var(--accent-red, #ef4444);
            background: rgba(239, 68, 68, 0.1);
            color: var(--accent-red, #ef4444);
          }

          .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
          }

          .btn {
            padding: 10px 18px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            font-size: 13px;
            transition: all 0.2s;
          }

          .btn.primary {
            background: var(--gradient-primary);
            color: white;
          }

          .btn.primary:hover {
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }

          .btn.secondary {
            background: var(--bg-hover);
            color: var(--text-secondary);
            border: 1px solid var(--border-color);
          }

          .btn.secondary:hover {
            background: var(--bg-active);
            color: var(--text-primary);
          }

          .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          @media (max-width: 600px) {
            .ratings-grid,
            .two-columns {
              grid-template-columns: 1fr;
            }

            .work-again-options {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

// Email Preview Component
interface EmailPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  body: string;
  html?: string;
  onSend?: () => void;
}

export function EmailPreview({
  isOpen,
  onClose,
  subject,
  body,
  html,
  onSend,
}: EmailPreviewProps) {
  const [viewMode, setViewMode] = useState<"preview" | "html">("preview");

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content email" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <h2>📧 Email Preview</h2>

        <div className="email-header">
          <div className="email-field">
            <span className="field-label">Subject:</span>
            <span className="field-value">{subject}</span>
          </div>
        </div>

        <div className="view-toggle">
          <button
            className={viewMode === "preview" ? "active" : ""}
            onClick={() => setViewMode("preview")}
          >
            Preview
          </button>
          <button
            className={viewMode === "html" ? "active" : ""}
            onClick={() => setViewMode("html")}
          >
            Plain Text
          </button>
        </div>

        <div className="email-body">
          {viewMode === "preview" && html ? (
            <div
              className="html-preview"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <pre className="text-preview">{body}</pre>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>
            Close
          </button>
          {onSend && (
            <button className="btn primary" onClick={onSend}>
              Send Email 📤
            </button>
          )}
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 24px;
          }

          .modal-content.email {
            background: var(--bg-elevated);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            padding: 32px;
            position: relative;
            box-shadow: var(--shadow-lg);
          }

          .modal-close {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 32px;
            height: 32px;
            border: none;
            background: var(--bg-hover);
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            color: var(--text-secondary);
            transition: all 0.2s;
          }

          .modal-close:hover {
            background: var(--bg-active);
            color: var(--text-primary);
          }

          h2 {
            margin: 0 0 24px;
            font-size: 24px;
            color: var(--text-primary);
          }

          .email-header {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 16px;
          }

          .email-field {
            display: flex;
            gap: 8px;
          }

          .field-label {
            font-weight: 600;
            color: var(--text-secondary);
          }

          .field-value {
            color: var(--text-primary);
          }

          .view-toggle {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
          }

          .view-toggle button {
            padding: 8px 16px;
            border: 1px solid var(--border-color);
            background: var(--bg-elevated);
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            color: var(--text-secondary);
            transition: all 0.2s;
          }

          .view-toggle button.active {
            border-color: var(--primary);
            background: var(--primary);
            color: white;
          }

          .email-body {
            border: 1px solid var(--border-color);
            border-radius: 8px;
            min-height: 400px;
            max-height: 500px;
            overflow-y: auto;
            background: var(--bg-card);
          }

          .html-preview {
            padding: 0;
          }

          .text-preview {
            padding: 20px;
            margin: 0;
            white-space: pre-wrap;
            font-family: inherit;
            font-size: 14px;
            line-height: 1.6;
            color: var(--text-primary);
          }

          .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 24px;
          }

          .btn {
            padding: 10px 18px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            font-size: 13px;
            transition: all 0.2s;
          }

          .btn.primary {
            background: var(--gradient-primary);
            color: white;
          }

          .btn.primary:hover {
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }

          .btn.secondary {
            background: var(--bg-hover);
            color: var(--text-secondary);
            border: 1px solid var(--border-color);
          }

          .btn.secondary:hover {
            background: var(--bg-active);
            color: var(--text-primary);
          }
        `}</style>
      </div>
    </div>
  );
}

// Sentiment Badge Component
interface SentimentBadgeProps {
  sentiment: string;
  interestLevel: number;
  size?: "small" | "medium" | "large";
}

export function SentimentBadge({
  sentiment,
  interestLevel,
  size = "medium",
}: SentimentBadgeProps) {
  const getColor = () => {
    switch (sentiment) {
      case "positive":
      case "interested":
        return { bg: "rgba(34, 197, 94, 0.15)", color: "var(--accent-green)" };
      case "negative":
        return { bg: "rgba(239, 68, 68, 0.15)", color: "var(--accent-red, #ef4444)" };
      case "hesitant":
        return { bg: "rgba(245, 158, 11, 0.15)", color: "var(--accent-orange)" };
      default:
        return { bg: "var(--bg-hover)", color: "var(--text-muted)" };
    }
  };

  const colors = getColor();
  const sizeStyles = {
    small: { padding: "2px 6px", fontSize: "11px" },
    medium: { padding: "4px 10px", fontSize: "12px" },
    large: { padding: "6px 14px", fontSize: "14px" },
  };

  return (
    <span
      className="sentiment-badge"
      style={{
        background: colors.bg,
        color: colors.color,
        ...sizeStyles[size],
        borderRadius: "16px",
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {sentiment === "positive" || sentiment === "interested" ? "😊" : 
       sentiment === "negative" ? "😞" : 
       sentiment === "hesitant" ? "🤔" : "😐"}
      {interestLevel}/10
    </span>
  );
}

// Stage Progress Component
interface StageProgressProps {
  currentStage: string;
  stages: string[];
}

export function StageProgress({ currentStage, stages }: StageProgressProps) {
  const currentIndex = stages.indexOf(currentStage);

  return (
    <div className="stage-progress">
      {stages.map((stage, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div
            key={stage}
            className={`stage-step ${isCompleted ? "completed" : ""} ${
              isCurrent ? "current" : ""
            }`}
          >
            <div className="step-dot">
              {isCompleted ? "✓" : index + 1}
            </div>
            {index < stages.length - 1 && <div className="step-line" />}
          </div>
        );
      })}

      <style jsx>{`
        .stage-progress {
          display: flex;
          align-items: center;
        }

        .stage-step {
          display: flex;
          align-items: center;
        }

        .step-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--bg-hover);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }

        .stage-step.completed .step-dot {
          background: var(--accent-green);
          border-color: var(--accent-green);
          color: white;
        }

        .stage-step.current .step-dot {
          background: var(--gradient-primary);
          border-color: var(--primary);
          color: white;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
        }

        .step-line {
          width: 40px;
          height: 2px;
          background: var(--border-color);
          margin: 0 4px;
        }

        .stage-step.completed .step-line {
          background: var(--accent-green);
        }
      `}</style>
    </div>
  );
}
