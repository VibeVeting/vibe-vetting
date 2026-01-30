"use client";

import { useState, useEffect } from 'react';

interface Deliverable {
  type: string;
  quantity: number;
  price: number;
  description?: string;
}

interface Document {
  id: string;
  type: 'contract' | 'invoice' | 'nda' | 'brief' | 'other';
  name: string;
  fileUrl?: string;
  status: 'pending' | 'sent' | 'viewed' | 'signed' | 'rejected' | 'expired';
  sentAt?: string;
  viewedAt?: string;
  signedAt?: string;
  signedFileUrl?: string;
  expiresAt?: string;
  notes?: string;
}

interface CreatorData {
  id: string;
  creatorName: string;
  creatorEmail: string;
  creatorHandle: string;
  platform: string;
  agreedPrice?: number;
  negotiation?: {
    status: string;
    initialOffer: number;
    creatorAsk?: number;
    finalPrice?: number;
    currency: string;
    paymentTerms?: string;
    deliverables?: Deliverable[];
  };
  documents?: Document[];
}

interface ContractManagerProps {
  creator: CreatorData;
  campaignName: string;
  brandName: string;
  onClose: () => void;
  onUpdate: () => void;
}

export function ContractManager({ creator, campaignName, brandName, onClose, onUpdate }: ContractManagerProps) {
  const [activeTab, setActiveTab] = useState<'pricing' | 'contract' | 'documents'>('pricing');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>(creator.documents || []);
  
  // Pricing state
  const [deliverables, setDeliverables] = useState<Deliverable[]>(
    creator.negotiation?.deliverables || [
      { type: 'Instagram Post', quantity: 1, price: 500 },
      { type: 'Instagram Story', quantity: 2, price: 150 },
      { type: 'Instagram Reel', quantity: 1, price: 800 },
    ]
  );
  const [paymentTerms, setPaymentTerms] = useState(creator.negotiation?.paymentTerms || '50% upfront, 50% on completion');
  const [currency, setCurrency] = useState(creator.negotiation?.currency || 'INR');
  
  // Contract state
  const [contractTerms, setContractTerms] = useState({
    exclusivity: false,
    exclusivityDays: 30,
    usageRights: 'perpetual',
    revisions: 2,
    cancellationNotice: 7,
    contentApproval: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const totalPrice = deliverables.reduce((sum, d) => sum + (d.quantity * d.price), 0);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/campaigns/pipeline/documents?creatorId=${creator.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [creator.id]);

  const performAction = async (action: string, data: any = {}) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/campaigns/pipeline/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          creatorId: creator.id,
          ...data,
        }),
      });
      const result = await response.json();
      if (result.success) {
        await fetchDocuments();
        onUpdate();
        return result;
      } else {
        alert(result.error || 'Action failed');
      }
    } catch (error) {
      console.error('Action error:', error);
      alert('Failed to perform action');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContract = async () => {
    await performAction('generate_contract', {
      data: {
        campaignName,
        brandName,
        deliverables,
        paymentTerms,
        totalPrice,
        currency,
        ...contractTerms,
      }
    });
  };

  const handleSendContract = async (documentId: string) => {
    await performAction('send_document', {
      documentId,
      data: {
        campaignName,
        brandName,
        senderName: 'Marketing Team',
      }
    });
  };

  const handleGenerateInvoice = async () => {
    await performAction('generate_invoice', {
      data: {
        campaignName,
        brandName,
        amount: totalPrice,
        currency,
        deliverables,
      }
    });
  };

  const addDeliverable = () => {
    setDeliverables([...deliverables, { type: '', quantity: 1, price: 0 }]);
  };

  const updateDeliverable = (index: number, field: keyof Deliverable, value: string | number) => {
    const updated = [...deliverables];
    updated[index] = { ...updated[index], [field]: value };
    setDeliverables(updated);
  };

  const removeDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; color: string }> = {
      pending: { bg: '#fef3c7', color: '#b45309' },
      sent: { bg: '#dbeafe', color: '#1d4ed8' },
      viewed: { bg: '#e0e7ff', color: '#4338ca' },
      signed: { bg: '#dcfce7', color: '#15803d' },
      rejected: { bg: '#fee2e2', color: '#b91c1c' },
      expired: { bg: '#f3f4f6', color: '#6b7280' },
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="contract-manager-modal" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <div className="creator-info">
            <div className="creator-avatar">{creator.creatorName.charAt(0)}</div>
            <div>
              <h2>{creator.creatorName}</h2>
              <p>{creator.creatorHandle} • {creator.platform}</p>
            </div>
          </div>
          <div className="total-value">
            <span className="label">Total Deal Value</span>
            <span className="value">{formatCurrency(totalPrice)}</span>
          </div>
        </div>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => setActiveTab('pricing')}
          >
            <i className="fa-solid fa-calculator"></i> Pricing
          </button>
          <button 
            className={`tab ${activeTab === 'contract' ? 'active' : ''}`}
            onClick={() => setActiveTab('contract')}
          >
            <i className="fa-solid fa-file-contract"></i> Contract
          </button>
          <button 
            className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <i className="fa-solid fa-folder-open"></i> Documents
            {documents.length > 0 && <span className="badge">{documents.length}</span>}
          </button>
        </div>

        <div className="tab-content">
          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="pricing-tab">
              <div className="section">
                <div className="section-header">
                  <h3><i className="fa-solid fa-list-check"></i> Deliverables</h3>
                  <button className="add-btn" onClick={addDeliverable}>
                    <i className="fa-solid fa-plus"></i> Add Item
                  </button>
                </div>
                
                <div className="deliverables-list">
                  {deliverables.map((item, index) => (
                    <div key={index} className="deliverable-row">
                      <input
                        type="text"
                        value={item.type}
                        onChange={e => updateDeliverable(index, 'type', e.target.value)}
                        placeholder="Content type (e.g., Instagram Post)"
                        className="type-input"
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={e => updateDeliverable(index, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                        className="qty-input"
                      />
                      <div className="price-input-wrapper">
                        <span className="currency-symbol">₹</span>
                        <input
                          type="number"
                          value={item.price}
                          onChange={e => updateDeliverable(index, 'price', parseInt(e.target.value) || 0)}
                          min="0"
                          className="price-input"
                        />
                      </div>
                      <span className="line-total">{formatCurrency(item.quantity * item.price)}</span>
                      <button className="remove-btn" onClick={() => removeDeliverable(index)}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="total-row">
                  <span>Total</span>
                  <span className="total-amount">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              <div className="section">
                <h3><i className="fa-solid fa-credit-card"></i> Payment Terms</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Currency</label>
                    <select value={currency} onChange={e => setCurrency(e.target.value)}>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                  <div className="form-group flex-2">
                    <label>Payment Schedule</label>
                    <select value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)}>
                      <option value="100% upfront">100% Upfront</option>
                      <option value="50% upfront, 50% on completion">50% Upfront, 50% on Completion</option>
                      <option value="30% upfront, 70% on completion">30% Upfront, 70% on Completion</option>
                      <option value="100% on completion">100% on Completion</option>
                      <option value="Milestone based">Milestone Based</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contract Tab */}
          {activeTab === 'contract' && (
            <div className="contract-tab">
              <div className="section">
                <h3><i className="fa-solid fa-calendar"></i> Campaign Timeline</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input 
                      type="date" 
                      value={contractTerms.startDate}
                      onChange={e => setContractTerms({...contractTerms, startDate: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input 
                      type="date" 
                      value={contractTerms.endDate}
                      onChange={e => setContractTerms({...contractTerms, endDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="section">
                <h3><i className="fa-solid fa-shield-halved"></i> Legal Terms</h3>
                
                <div className="toggle-row">
                  <div className="toggle-info">
                    <span className="toggle-label">Exclusivity Clause</span>
                    <span className="toggle-description">Creator cannot work with competitors</span>
                  </div>
                  <label className="toggle">
                    <input 
                      type="checkbox"
                      checked={contractTerms.exclusivity}
                      onChange={e => setContractTerms({...contractTerms, exclusivity: e.target.checked})}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                {contractTerms.exclusivity && (
                  <div className="sub-option">
                    <label>Exclusivity Period (days)</label>
                    <input 
                      type="number"
                      value={contractTerms.exclusivityDays}
                      onChange={e => setContractTerms({...contractTerms, exclusivityDays: parseInt(e.target.value) || 30})}
                      min="7"
                    />
                  </div>
                )}

                <div className="toggle-row">
                  <div className="toggle-info">
                    <span className="toggle-label">Content Approval Required</span>
                    <span className="toggle-description">Brand must approve content before posting</span>
                  </div>
                  <label className="toggle">
                    <input 
                      type="checkbox"
                      checked={contractTerms.contentApproval}
                      onChange={e => setContractTerms({...contractTerms, contentApproval: e.target.checked})}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Usage Rights</label>
                    <select 
                      value={contractTerms.usageRights}
                      onChange={e => setContractTerms({...contractTerms, usageRights: e.target.value})}
                    >
                      <option value="perpetual">Perpetual (Forever)</option>
                      <option value="1 year">1 Year</option>
                      <option value="6 months">6 Months</option>
                      <option value="3 months">3 Months</option>
                      <option value="campaign only">Campaign Duration Only</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Revisions Included</label>
                    <input 
                      type="number"
                      value={contractTerms.revisions}
                      onChange={e => setContractTerms({...contractTerms, revisions: parseInt(e.target.value) || 0})}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Cancellation Notice (days)</label>
                    <input 
                      type="number"
                      value={contractTerms.cancellationNotice}
                      onChange={e => setContractTerms({...contractTerms, cancellationNotice: parseInt(e.target.value) || 7})}
                      min="1"
                    />
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                <button 
                  className="btn btn-primary"
                  onClick={handleGenerateContract}
                  disabled={loading}
                >
                  <i className="fa-solid fa-file-signature"></i>
                  {loading ? 'Generating...' : 'Generate Contract'}
                </button>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="documents-tab">
              <div className="documents-actions">
                <button className="btn btn-secondary" onClick={handleGenerateContract} disabled={loading}>
                  <i className="fa-solid fa-file-contract"></i> Generate Contract
                </button>
                <button className="btn btn-secondary" onClick={handleGenerateInvoice} disabled={loading}>
                  <i className="fa-solid fa-file-invoice-dollar"></i> Generate Invoice
                </button>
              </div>

              {documents.length === 0 ? (
                <div className="empty-state">
                  <i className="fa-solid fa-folder-open"></i>
                  <h4>No Documents Yet</h4>
                  <p>Generate a contract or invoice to get started</p>
                </div>
              ) : (
                <div className="documents-list">
                  {documents.map(doc => (
                    <div key={doc.id} className="document-card">
                      <div className="doc-icon">
                        <i className={`fa-solid ${
                          doc.type === 'contract' ? 'fa-file-contract' :
                          doc.type === 'invoice' ? 'fa-file-invoice-dollar' :
                          doc.type === 'nda' ? 'fa-file-shield' :
                          'fa-file'
                        }`}></i>
                      </div>
                      <div className="doc-info">
                        <span className="doc-name">{doc.name}</span>
                        <span className="doc-meta">
                          {doc.type.toUpperCase()} • 
                          {doc.sentAt ? ` Sent ${new Date(doc.sentAt).toLocaleDateString()}` : ' Not sent'}
                        </span>
                      </div>
                      <span 
                        className="doc-status"
                        style={{
                          background: getStatusColor(doc.status).bg,
                          color: getStatusColor(doc.status).color,
                        }}
                      >
                        {doc.status}
                      </span>
                      <div className="doc-actions">
                        {doc.status === 'pending' && (
                          <button 
                            className="action-btn send"
                            onClick={() => handleSendContract(doc.id)}
                            disabled={loading}
                            title="Send to Creator"
                          >
                            <i className="fa-solid fa-paper-plane"></i>
                          </button>
                        )}
                        {doc.status === 'sent' && (
                          <button 
                            className="action-btn remind"
                            onClick={() => performAction('send_reminder', { documentId: doc.id })}
                            disabled={loading}
                            title="Send Reminder"
                          >
                            <i className="fa-solid fa-bell"></i>
                          </button>
                        )}
                        <a 
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="action-btn view"
                          title="View Document"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
          }

          .contract-manager-modal {
            background: var(--bg-elevated);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            width: 100%;
            max-width: 800px;
            max-height: 90vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: var(--shadow-lg);
          }

          .close-button {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 32px;
            height: 32px;
            border: none;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            z-index: 10;
            transition: all 0.2s;
          }

          .close-button:hover {
            background: rgba(255, 255, 255, 0.3);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .creator-info {
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .creator-avatar {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: 700;
          }

          .creator-info h2 {
            font-size: 18px;
            font-weight: 700;
            margin: 0 0 4px 0;
          }

          .creator-info p {
            font-size: 13px;
            opacity: 0.9;
            margin: 0;
          }

          .total-value {
            text-align: right;
          }

          .total-value .label {
            display: block;
            font-size: 11px;
            opacity: 0.8;
            margin-bottom: 4px;
          }

          .total-value .value {
            font-size: 24px;
            font-weight: 700;
          }

          .tabs {
            display: flex;
            gap: 0;
            border-bottom: 1px solid var(--border-color);
            background: var(--bg-card);
          }

          .tab {
            flex: 1;
            padding: 14px;
            border: none;
            background: transparent;
            font-size: 13px;
            font-weight: 600;
            color: var(--text-secondary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.2s;
            border-bottom: 2px solid transparent;
          }

          .tab:hover {
            color: var(--primary);
            background: var(--bg-hover);
          }

          .tab.active {
            color: var(--primary);
            border-bottom-color: var(--primary);
          }

          .tab .badge {
            background: var(--primary);
            color: white;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 10px;
          }

          .tab-content {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
          }

          .section {
            margin-bottom: 24px;
          }

          .section h3 {
            font-size: 14px;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .section h3 i {
            color: var(--primary);
          }

          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }

          .section-header h3 {
            margin-bottom: 0;
          }

          .add-btn {
            padding: 6px 12px;
            border: 1px dashed var(--border-color);
            background: transparent;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            color: var(--text-secondary);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
          }

          .add-btn:hover {
            border-color: var(--primary);
            color: var(--primary);
          }

          .deliverables-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .deliverable-row {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            background: var(--bg-hover);
            border-radius: 10px;
          }

          .type-input {
            flex: 2;
            padding: 8px 12px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            font-size: 13px;
            background: var(--bg-elevated);
            color: var(--text-primary);
          }

          .qty-input {
            width: 60px;
            padding: 8px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            font-size: 13px;
            text-align: center;
            background: var(--bg-elevated);
            color: var(--text-primary);
          }

          .price-input-wrapper {
            display: flex;
            align-items: center;
            background: var(--bg-elevated);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            overflow: hidden;
          }

          .currency-symbol {
            padding: 8px;
            background: var(--bg-hover);
            color: var(--text-secondary);
            font-size: 13px;
          }

          .price-input {
            width: 80px;
            padding: 8px;
            border: none;
            font-size: 13px;
            background: transparent;
            color: var(--text-primary);
          }

          .line-total {
            min-width: 80px;
            text-align: right;
            font-weight: 600;
            color: var(--text-primary);
            font-size: 13px;
          }

          .remove-btn {
            width: 32px;
            height: 32px;
            border: none;
            background: transparent;
            color: var(--text-muted);
            cursor: pointer;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .remove-btn:hover {
            background: #fee2e2;
            color: #dc2626;
          }

          .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            color: white;
            font-weight: 600;
            margin-top: 16px;
          }

          .total-amount {
            font-size: 20px;
          }

          .form-row {
            display: flex;
            gap: 16px;
          }

          .form-group {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .form-group.flex-2 {
            flex: 2;
          }

          .form-group label {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-secondary);
          }

          .form-group input,
          .form-group select {
            padding: 10px 12px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-size: 13px;
            color: var(--text-primary);
            background: var(--bg-elevated);
          }

          .toggle-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px;
            background: var(--bg-hover);
            border-radius: 10px;
            margin-bottom: 12px;
          }

          .toggle-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .toggle-label {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-primary);
          }

          .toggle-description {
            font-size: 11px;
            color: var(--text-secondary);
          }

          .toggle {
            position: relative;
            width: 44px;
            height: 24px;
          }

          .toggle input {
            opacity: 0;
            width: 0;
            height: 0;
          }

          .slider {
            position: absolute;
            cursor: pointer;
            inset: 0;
            background: var(--border-color);
            border-radius: 24px;
            transition: 0.3s;
          }

          .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background: white;
            border-radius: 50%;
            transition: 0.3s;
          }

          input:checked + .slider {
            background: var(--primary);
          }

          input:checked + .slider:before {
            transform: translateX(20px);
          }

          .sub-option {
            margin: -4px 0 12px 0;
            padding: 12px;
            background: var(--bg-hover);
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .sub-option label {
            font-size: 12px;
            color: var(--text-secondary);
          }

          .sub-option input {
            width: 80px;
            padding: 6px 10px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            font-size: 13px;
            background: var(--bg-elevated);
            color: var(--text-primary);
          }

          .action-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid var(--border-color);
          }

          .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
          }

          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .btn-primary:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
          }

          .btn-secondary {
            background: var(--bg-hover);
            color: var(--text-secondary);
            border: 1px solid var(--border-color);
          }

          .btn-secondary:hover:not(:disabled) {
            background: var(--bg-active);
          }

          .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .documents-actions {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
          }

          .empty-state {
            text-align: center;
            padding: 48px 24px;
            color: var(--text-secondary);
          }

          .empty-state i {
            font-size: 48px;
            opacity: 0.3;
            margin-bottom: 16px;
          }

          .empty-state h4 {
            font-size: 16px;
            color: var(--text-primary);
            margin-bottom: 8px;
          }

          .empty-state p {
            font-size: 13px;
          }

          .documents-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .document-card {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 14px;
            background: var(--bg-hover);
            border-radius: 12px;
            transition: all 0.2s;
          }

          .document-card:hover {
            background: var(--bg-active);
          }

          .doc-icon {
            width: 42px;
            height: 42px;
            background: var(--bg-elevated);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary);
            font-size: 18px;
            box-shadow: var(--shadow-sm);
          }

          .doc-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .doc-name {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-primary);
          }

          .doc-meta {
            font-size: 11px;
            color: var(--text-secondary);
          }

          .doc-status {
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            text-transform: capitalize;
          }

          .doc-actions {
            display: flex;
            gap: 6px;
          }

          .action-btn {
            width: 32px;
            height: 32px;
            border: none;
            background: var(--bg-elevated);
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary);
            font-size: 13px;
            text-decoration: none;
            transition: all 0.2s;
          }

          .action-btn:hover {
            background: var(--primary);
            color: white;
          }

          .action-btn.send:hover {
            background: var(--accent-green);
          }

          .action-btn.remind:hover {
            background: var(--accent-orange);
          }
        `}</style>
      </div>
    </div>
  );
}

export default ContractManager;
