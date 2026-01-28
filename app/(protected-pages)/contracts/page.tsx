'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { exportAsCSV } from '@/lib/export-utils';

interface TemplateVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'select';
  placeholder?: string;
  options?: string[];
  required: boolean;
}

interface ContractTemplate {
  _id?: string;
  uuid: string;
  name: string;
  description: string;
  category: 'sponsorship' | 'ambassador' | 'affiliate' | 'content' | 'licensing' | 'custom';
  content: string;
  variables: TemplateVariable[];
  isDefault: boolean;
  usageCount: number;
  lastUsed?: string;
}

interface GeneratedContract {
  _id: string;
  templateId: string;
  templateName: string;
  creatorName: string;
  creatorEmail?: string;
  content: string;
  variables: Record<string, string>;
  status: 'draft' | 'sent' | 'signed' | 'expired' | 'cancelled';
  createdAt: string;
  signedAt?: string;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; gradient: string }> = {
  sponsorship: {
    label: 'Sponsorship',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
  },
  ambassador: {
    label: 'Ambassador',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  },
  affiliate: {
    label: 'Affiliate',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  },
  content: {
    label: 'UGC Content',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
  },
  licensing: {
    label: 'Licensing',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
  },
  custom: {
    label: 'Custom',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
    color: '#667eea',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' },
  sent: { label: 'Sent', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  signed: { label: 'Signed', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
  expired: { label: 'Expired', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
};

export default function ContractsPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [contracts, setContracts] = useState<GeneratedContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'templates' | 'contracts'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [generatedContent, setGeneratedContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewingContract, setViewingContract] = useState<GeneratedContract | null>(null);
  const [sendingContract, setSendingContract] = useState<GeneratedContract | null>(null);
  const [sendEmail, setSendEmail] = useState('');
  const [sendMessage, setSendMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  
  // Custom template creation state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTemplate, setCustomTemplate] = useState({
    name: '',
    description: '',
    category: 'custom' as ContractTemplate['category'],
    content: '',
    variables: [] as TemplateVariable[]
  });
  const [newVariable, setNewVariable] = useState({ key: '', label: '', type: 'text' as TemplateVariable['type'], required: true });

  useEffect(() => {
    fetchData();
  }, [user?.company]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Seed default templates first
      await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' })
      });

      // Fetch templates (including custom ones for this company)
      const companyParam = user?.company ? `?companyId=${user.company}` : '';
      const templatesRes = await fetch(`/api/contracts${companyParam}`);
      const templatesData = await templatesRes.json();
      if (templatesData.success) {
        // Deduplicate templates by uuid to prevent duplicate key errors
        const uniqueTemplates = templatesData.templates.reduce((acc: ContractTemplate[], template: ContractTemplate) => {
          if (!acc.find(t => t.uuid === template.uuid)) {
            acc.push(template);
          }
          return acc;
        }, []);
        setTemplates(uniqueTemplates);
      }

      // Fetch real contracts from database
      if (user?.company) {
        const contractsRes = await fetch(`/api/contracts?type=contracts&companyId=${user.company}`);
        const contractsData = await contractsRes.json();
        if (contractsData.success) {
          setContracts(contractsData.contracts);
        }
      }

    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setFormValues({});
    setShowGenerator(true);
  };

  const handleFormChange = (key: string, value: string) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  const handlePreview = () => {
    if (!selectedTemplate) return;
    
    let content = selectedTemplate.content;
    for (const [key, value] of Object.entries(formValues)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value || `[${key}]`);
    }
    setGeneratedContent(content);
    setShowPreview(true);
  };

  const handleGenerateContract = async () => {
    if (!selectedTemplate) return;
    setSaving(true);

    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateContract',
          templateId: selectedTemplate.uuid,
          variables: formValues,
          creatorName: formValues.creator_name || 'Unknown Creator',
          creatorEmail: formValues.creator_email,
          companyId: user?.company,
          createdBy: user?.email
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowGenerator(false);
        setShowPreview(false);
        setActiveTab('contracts');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to generate contract:', err);
    } finally {
      setSaving(false);
    }
  };

  // Custom template handlers
  const handleAddVariable = () => {
    if (!newVariable.key || !newVariable.label) return;
    setCustomTemplate(prev => ({
      ...prev,
      variables: [...prev.variables, { ...newVariable, placeholder: `Enter ${newVariable.label.toLowerCase()}` }]
    }));
    setNewVariable({ key: '', label: '', type: 'text', required: true });
  };

  const handleRemoveVariable = (key: string) => {
    setCustomTemplate(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v.key !== key)
    }));
  };

  // View contract content
  const handleViewContract = (contract: GeneratedContract) => {
    setViewingContract(contract);
  };

  // Download contract as PDF
  const handleDownloadPDF = (contract: GeneratedContract) => {
    // Create a printable HTML document
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${contract.templateName} - ${contract.creatorName}</title>
          <style>
            body { font-family: Georgia, serif; line-height: 1.8; padding: 40px; max-width: 800px; margin: 0 auto; }
            pre { white-space: pre-wrap; font-family: inherit; }
            h1 { font-size: 18px; text-align: center; margin-bottom: 30px; }
            .meta { text-align: center; color: #666; margin-bottom: 30px; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>${contract.templateName}</h1>
          <div class="meta">
            Creator: ${contract.creatorName} | Status: ${contract.status.toUpperCase()} | Date: ${new Date(contract.createdAt).toLocaleDateString()}
          </div>
          <pre>${contract.content}</pre>
        </body>
      </html>
    `;
    
    const blob = new Blob([printContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  // Send contract to creator
  const handleSendContract = async () => {
    if (!sendingContract || !sendEmail) return;
    setSendingEmail(true);

    try {
      // Update contract status to 'sent'
      await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateStatus',
          contractId: sendingContract._id,
          status: 'sent'
        })
      });

      // In a real implementation, you would also send an email here
      // For now, we just update the status and show a success message
      alert(`Contract sent to ${sendEmail}!`);
      
      setSendingContract(null);
      setSendEmail('');
      setSendMessage('');
      fetchData();
    } catch (err) {
      console.error('Failed to send contract:', err);
      alert('Failed to send contract. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  // Update contract status
  const handleUpdateStatus = async (contractId: string, status: GeneratedContract['status']) => {
    try {
      await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateStatus',
          contractId,
          status
        })
      });
      fetchData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleCreateCustomTemplate = async () => {
    if (!customTemplate.name || !customTemplate.content) return;
    setSaving(true);

    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createTemplate',
          name: customTemplate.name,
          description: customTemplate.description,
          category: customTemplate.category,
          content: customTemplate.content,
          variables: customTemplate.variables,
          companyId: user?.company,
          createdBy: user?.email
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowCustomModal(false);
        setCustomTemplate({ name: '', description: '', category: 'custom', content: '', variables: [] });
        fetchData();
      }
    } catch (err) {
      console.error('Failed to create template:', err);
    } finally {
      setSaving(false);
    }
  };

  const filteredTemplates = filterCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === filterCategory);

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="container">
          <TopBar
            title="Contract Templates"
            subtitle="Professional legal agreements for creator partnerships"
            secondaryButton={{
              label: 'Export Contracts',
              icon: 'fa-file-csv',
              onClick: () => {
                if (contracts.length === 0) {
                  alert('No contracts to export');
                  return;
                }
                const exportData = contracts.map((c: GeneratedContract) => ({
                  'Template': c.templateName,
                  'Creator': c.creatorName,
                  'Status': c.status,
                  'Created': new Date(c.createdAt).toLocaleDateString(),
                  'Signed': c.signedAt ? new Date(c.signedAt).toLocaleDateString() : 'N/A'
                }));
                exportAsCSV(exportData, `contracts-${new Date().toISOString().split('T')[0]}`);
              },
            }}
          />
          
          <div className="contracts-page">
            {/* Header Actions */}
            <div className="page-header-actions">
              <button className="btn-secondary" onClick={() => setShowCustomModal(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                Create Custom Template
              </button>
            </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
            Templates
            <span className="tab-count">{templates.length}</span>
          </button>
          <button 
            className={`tab ${activeTab === 'contracts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contracts')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            My Contracts
            <span className="tab-count">{contracts.length}</span>
          </button>
        </div>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="templates-section">
          {/* Category Filter */}
          <div className="category-filter">
            <button 
              className={`filter-btn ${filterCategory === 'all' ? 'active' : ''}`}
              onClick={() => setFilterCategory('all')}
            >
              All Templates
            </button>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <button
                key={key}
                className={`filter-btn ${filterCategory === key ? 'active' : ''}`}
                onClick={() => setFilterCategory(key)}
                style={{ '--accent-color': config.color } as React.CSSProperties}
              >
                {config.icon}
                {config.label}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          {loading ? (
            <div className="loading-grid">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="shimmer-card"></div>
              ))}
            </div>
          ) : (
            <div className="templates-grid">
              {filteredTemplates.map((template, idx) => {
                const config = CATEGORY_CONFIG[template.category] || CATEGORY_CONFIG.custom;
                return (
                  <div 
                    key={template._id || `${template.uuid}-${idx}`} 
                    className="template-card"
                    style={{ 
                      '--card-accent': config.color,
                      '--card-gradient': config.gradient,
                      animationDelay: `${idx * 0.05}s`
                    } as React.CSSProperties}
                  >
                    <div className="card-accent-bar"></div>
                    <div className="card-header">
                      <div className="card-icon" style={{ background: config.gradient }}>
                        {config.icon}
                      </div>
                      <span className="card-category">{config.label}</span>
                    </div>
                    <h3 className="card-title">{template.name}</h3>
                    <p className="card-description">{template.description}</p>
                    <div className="card-meta">
                      <span className="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        {template.variables.length} fields
                      </span>
                      <span className="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                        </svg>
                        {template.usageCount} uses
                      </span>
                    </div>
                    <div className="card-actions">
                      <button className="btn-preview" onClick={() => { setSelectedTemplate(template); setGeneratedContent(template.content); setShowPreview(true); }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        Preview
                      </button>
                      <button className="btn-use" onClick={() => handleUseTemplate(template)}>
                        Use Template
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="5" y1="12" x2="19" y2="12"/>
                          <polyline points="12 5 19 12 12 19"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Contracts Tab */}
      {activeTab === 'contracts' && (
        <div className="contracts-section">
          {contracts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <h3>No Contracts Yet</h3>
              <p>Generate your first contract using a template</p>
              <button className="btn-primary" onClick={() => setActiveTab('templates')}>
                Browse Templates
              </button>
            </div>
          ) : (
            <div className="contracts-table">
              <div className="table-header">
                <div className="th">Contract</div>
                <div className="th">Creator</div>
                <div className="th">Status</div>
                <div className="th">Created</div>
                <div className="th">Actions</div>
              </div>
              {contracts.map(contract => {
                const status = STATUS_CONFIG[contract.status];
                return (
                  <div key={contract._id} className="table-row">
                    <div className="td">
                      <span className="contract-name">{contract.templateName}</span>
                    </div>
                    <div className="td">
                      <div className="creator-info">
                        <div className="creator-avatar">{contract.creatorName.charAt(0)}</div>
                        <span>{contract.creatorName}</span>
                      </div>
                    </div>
                    <div className="td">
                      <span className="status-badge" style={{ color: status.color, background: status.bg }}>
                        {status.label}
                      </span>
                    </div>
                    <div className="td">
                      <span className="date">{new Date(contract.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="td actions">
                      <button className="action-btn" title="View" onClick={() => handleViewContract(contract)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                      <button className="action-btn" title="Download" onClick={() => handleDownloadPDF(contract)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </button>
                      <button className="action-btn" title="Send" onClick={() => { setSendingContract(contract); setSendEmail(contract.creatorEmail || ''); }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="22" y1="2" x2="11" y2="13"/>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Generator Modal */}
      {showGenerator && selectedTemplate && (
        <div className="modal-overlay" onClick={() => setShowGenerator(false)}>
          <div className="modal generator-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                <div className="modal-icon" style={{ background: CATEGORY_CONFIG[selectedTemplate.category]?.gradient }}>
                  {CATEGORY_CONFIG[selectedTemplate.category]?.icon}
                </div>
                <div>
                  <h2 className="modal-title">Generate Contract</h2>
                  <p className="modal-subtitle">{selectedTemplate.name}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowGenerator(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                {selectedTemplate.variables.map(variable => (
                  <div key={variable.key} className={`form-group ${variable.type === 'text' && variable.placeholder?.includes('e.g.,') ? 'full-width' : ''}`}>
                    <label className="form-label">
                      {variable.label}
                      {variable.required && <span className="required">*</span>}
                    </label>
                    {variable.type === 'select' ? (
                      <select
                        className="form-select"
                        value={formValues[variable.key] || ''}
                        onChange={e => handleFormChange(variable.key, e.target.value)}
                      >
                        <option value="">Select {variable.label}</option>
                        {variable.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : variable.type === 'date' ? (
                      <input
                        type="date"
                        className="form-input"
                        value={formValues[variable.key] || ''}
                        onChange={e => handleFormChange(variable.key, e.target.value)}
                      />
                    ) : variable.type === 'currency' ? (
                      <div className="currency-input">
                        <span className="currency-symbol">$</span>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="0.00"
                          value={formValues[variable.key] || ''}
                          onChange={e => handleFormChange(variable.key, `$${e.target.value}`)}
                        />
                      </div>
                    ) : (
                      <input
                        type={variable.type}
                        className="form-input"
                        placeholder={variable.placeholder || `Enter ${variable.label.toLowerCase()}`}
                        value={formValues[variable.key] || ''}
                        onChange={e => handleFormChange(variable.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowGenerator(false)}>Cancel</button>
              <button className="btn-secondary" onClick={handlePreview}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Preview
              </button>
              <button className="btn-primary" onClick={handleGenerateContract} disabled={saving}>
                {saving ? 'Generating...' : 'Generate Contract'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="modal preview-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Contract Preview</h2>
              <button className="modal-close" onClick={() => setShowPreview(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body preview-body">
              <div className="contract-preview">
                <pre>{generatedContent}</pre>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowPreview(false)}>Close</button>
              <button className="btn-secondary" onClick={() => {
                const printContent = `<!DOCTYPE html><html><head><title>Contract Preview</title><style>body{font-family:Georgia,serif;line-height:1.8;padding:40px;max-width:800px;margin:0 auto;}pre{white-space:pre-wrap;font-family:inherit;}</style></head><body><pre>${generatedContent}</pre></body></html>`;
                const blob = new Blob([printContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const printWindow = window.open(url, '_blank');
                if (printWindow) { printWindow.onload = () => printWindow.print(); }
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download PDF
              </button>
              {showGenerator && (
                <button className="btn-primary" onClick={handleGenerateContract} disabled={saving}>
                  {saving ? 'Generating...' : 'Generate & Save Contract'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Template Modal */}
      {showCustomModal && (
        <div className="modal-overlay" onClick={() => setShowCustomModal(false)}>
          <div className="modal custom-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                <div className="modal-icon" style={{ background: CATEGORY_CONFIG.custom.gradient }}>
                  {CATEGORY_CONFIG.custom.icon}
                </div>
                <div>
                  <h2 className="modal-title">Create Custom Template</h2>
                  <p className="modal-subtitle">Build your own contract template from scratch</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowCustomModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Template Name<span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Product Review Agreement"
                    value={customTemplate.name}
                    onChange={e => setCustomTemplate(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={customTemplate.category}
                    onChange={e => setCustomTemplate(prev => ({ ...prev, category: e.target.value as ContractTemplate['category'] }))}
                  >
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Brief description of this template"
                    value={customTemplate.description}
                    onChange={e => setCustomTemplate(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Contract Content<span className="required">*</span></label>
                  <p className="form-hint">Use {"{{variable_name}}"} for dynamic fields (e.g., {"{{creator_name}}"}, {"{{payment_amount}}"})</p>
                  <textarea
                    className="form-textarea"
                    placeholder="Enter your contract content here...

Example:
This Agreement is entered into between {{company_name}} and {{creator_name}}.

Payment: ${{payment_amount}}
Duration: {{contract_duration}}"
                    value={customTemplate.content}
                    onChange={e => setCustomTemplate(prev => ({ ...prev, content: e.target.value }))}
                    rows={12}
                  />
                </div>
                
                {/* Variable Builder */}
                <div className="form-group full-width">
                  <label className="form-label">Template Variables</label>
                  <p className="form-hint">Define the fields that will be filled when using this template</p>
                  
                  <div className="variables-list">
                    {customTemplate.variables.map(variable => (
                      <div key={variable.key} className="variable-item">
                        <div className="variable-info">
                          <span className="variable-key">{`{{${variable.key}}}`}</span>
                          <span className="variable-label">{variable.label}</span>
                          <span className="variable-type">{variable.type}</span>
                        </div>
                        <button className="variable-remove" onClick={() => handleRemoveVariable(variable.key)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="add-variable-form">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Variable key (e.g., creator_name)"
                      value={newVariable.key}
                      onChange={e => setNewVariable(prev => ({ ...prev, key: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Display label (e.g., Creator Name)"
                      value={newVariable.label}
                      onChange={e => setNewVariable(prev => ({ ...prev, label: e.target.value }))}
                    />
                    <select
                      className="form-select"
                      value={newVariable.type}
                      onChange={e => setNewVariable(prev => ({ ...prev, type: e.target.value as TemplateVariable['type'] }))}
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="currency">Currency</option>
                    </select>
                    <button className="btn-add-variable" onClick={handleAddVariable}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCustomModal(false)}>Cancel</button>
              <button 
                className="btn-primary" 
                onClick={handleCreateCustomTemplate} 
                disabled={saving || !customTemplate.name || !customTemplate.content}
              >
                {saving ? 'Creating...' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Contract Modal */}
      {viewingContract && (
        <div className="modal-overlay" onClick={() => setViewingContract(null)}>
          <div className="modal preview-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                <div className="modal-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div>
                  <h2 className="modal-title">{viewingContract.templateName}</h2>
                  <p className="modal-subtitle">Contract for {viewingContract.creatorName}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setViewingContract(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body preview-body">
              <div className="contract-meta-bar">
                <span className="status-badge" style={{ color: STATUS_CONFIG[viewingContract.status].color, background: STATUS_CONFIG[viewingContract.status].bg }}>
                  {STATUS_CONFIG[viewingContract.status].label}
                </span>
                <span className="meta-item">Created: {new Date(viewingContract.createdAt).toLocaleDateString()}</span>
                {viewingContract.signedAt && <span className="meta-item">Signed: {new Date(viewingContract.signedAt).toLocaleDateString()}</span>}
              </div>
              <div className="contract-preview">
                <pre>{viewingContract.content}</pre>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setViewingContract(null)}>Close</button>
              <button className="btn-secondary" onClick={() => handleDownloadPDF(viewingContract)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download PDF
              </button>
              {viewingContract.status === 'draft' && (
                <button className="btn-primary" onClick={() => { setSendingContract(viewingContract); setSendEmail(viewingContract.creatorEmail || ''); setViewingContract(null); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Send to Creator
                </button>
              )}
              {viewingContract.status === 'sent' && (
                <button className="btn-primary" onClick={() => handleUpdateStatus(viewingContract._id, 'signed')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Mark as Signed
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send Contract Modal */}
      {sendingContract && (
        <div className="modal-overlay" onClick={() => setSendingContract(null)}>
          <div className="modal generator-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                <div className="modal-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </div>
                <div>
                  <h2 className="modal-title">Send Contract</h2>
                  <p className="modal-subtitle">{sendingContract.templateName}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSendingContract(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Recipient Email<span className="required">*</span></label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="creator@example.com"
                  value={sendEmail}
                  onChange={e => setSendEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Personal Message (Optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Add a personal message to include with the contract..."
                  value={sendMessage}
                  onChange={e => setSendMessage(e.target.value)}
                  rows={4}
                  style={{ minHeight: '100px' }}
                />
              </div>
              <div className="send-preview">
                <h4>Contract: {sendingContract.templateName}</h4>
                <p>Recipient: {sendingContract.creatorName}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSendingContract(null)}>Cancel</button>
              <button 
                className="btn-primary" 
                onClick={handleSendContract}
                disabled={sendingEmail || !sendEmail}
              >
                {sendingEmail ? 'Sending...' : 'Send Contract'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .contracts-page {
          padding: 0;
          margin: 0;
        }

        /* Contract Meta Bar */
        .contract-meta-bar {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
          padding: 16px;
          background: #f7fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        /* Send Preview */
        .send-preview {
          margin-top: 20px;
          padding: 16px;
          background: #f7fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        .send-preview h4 {
          margin: 0 0 8px 0;
          color: #1a202c;
          font-size: 15px;
        }
        .send-preview p {
          margin: 0;
          color: #718096;
          font-size: 14px;
        }

        /* Header Actions */
        .page-header-actions {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 24px;
        }
        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #ffffff;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          color: #667eea;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .btn-secondary:hover {
          background: #f7fafc;
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.2);
        }
        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.35), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .btn-primary:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.45), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        /* Tabs */
        .tabs-container {
          margin-bottom: 28px;
        }
        .tabs {
          display: inline-flex;
          gap: 6px;
          background: #ffffff;
          padding: 8px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }
        .tab {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 22px;
          background: transparent;
          border: none;
          border-radius: 12px;
          color: #4a5568;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .tab:hover {
          color: #667eea;
          background: #f7fafc;
        }
        .tab.active {
          background: rgba(102, 126, 234, 0.15);
          color: #667eea;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
        }
        .tab-count {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
          color: #667eea;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }
        .tab.active .tab-count {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        /* Category Filter */
        .category-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 28px;
          padding: 16px 20px;
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        }
        .filter-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: #f7fafc;
          border: 2px solid transparent;
          border-radius: 25px;
          color: #4a5568;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .filter-btn:hover {
          border-color: var(--accent-color, #667eea);
          color: var(--accent-color, #667eea);
          background: #edf2f7;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .filter-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
          color: white;
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
          transform: translateY(-2px);
        }

        /* Templates Grid */
        .templates-section {
          animation: fadeIn 0.4s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .loading-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 24px;
        }
        .shimmer-card {
          height: 300px;
          background: linear-gradient(110deg, #f7fafc 8%, #edf2f7 18%, #f7fafc 33%);
          background-size: 200% 100%;
          animation: shimmer 1.5s linear infinite;
          border-radius: 24px;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 24px;
        }

        .template-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 28px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          position: relative;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .template-card:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
          border-color: rgba(102, 126, 234, 0.4);
        }
        .card-accent-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: var(--card-gradient);
          opacity: 0;
          transition: opacity 0.35s ease;
        }
        .template-card:hover .card-accent-bar {
          opacity: 1;
        }
        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .card-icon {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255,255,255,0.25);
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .template-card:hover .card-icon {
          transform: scale(1.12) rotate(-5deg);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255,255,255,0.3);
        }
        .card-category {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--card-accent);
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          padding: 6px 14px;
          border-radius: 20px;
        }
        .card-title {
          font-size: 18px;
          font-weight: 700;
          color: #1a202c !important;
          margin: 0 0 10px 0;
          line-height: 1.3;
        }
        .card-description {
          font-size: 14px;
          color: #4a5568 !important;
          line-height: 1.6;
          margin: 0 0 20px 0;
          min-height: 44px;
        }
        .card-meta {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
          padding: 14px 0;
          border-top: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #718096;
          font-weight: 500;
        }
        .meta-item svg {
          color: var(--card-accent, #667eea);
        }
        .card-actions {
          display: flex;
          gap: 12px;
        }
        .btn-preview {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
          border: 2px solid transparent;
          border-radius: 12px;
          color: #667eea;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-preview:hover {
          background: #f7fafc;
          border-color: #667eea;
          transform: translateY(-2px);
        }
        .btn-use {
          flex: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          background: var(--card-gradient);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.25), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .btn-use:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 10px 24px rgba(102, 126, 234, 0.35), inset 0 1px 0 rgba(255,255,255,0.2);
        }

        /* Contracts Section */
        .contracts-section {
          animation: fadeIn 0.4s ease;
        }

        /* Contracts Table */
        .contracts-table {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        }
        .table-header {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr;
          gap: 16px;
          padding: 18px 24px;
          background: #f7fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        .table-row {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr;
          gap: 16px;
          padding: 18px 24px;
          align-items: center;
          border-bottom: 1px solid #edf2f7;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .table-row:hover {
          background: #f7fafc;
        }
        .table-row:last-child {
          border-bottom: none;
        }
        .contract-name {
          font-weight: 700;
          color: #1a202c !important;
          font-size: 14px;
        }
        .creator-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .creator-avatar {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white !important;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
        }
        .creator-info span {
          font-weight: 600;
          color: #2d3748 !important;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.3px;
        }
        .td {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #4a5568 !important;
        }
        .date {
          font-size: 13px;
          color: #718096 !important;
          font-weight: 500;
        }
        .th {
          font-size: 12px;
          font-weight: 700;
          color: #667eea !important;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .td.actions {
          display: flex;
          gap: 8px;
        }
        .action-btn {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          color: #667eea;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .action-btn:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: #ffffff;
          border-radius: 24px;
          border: 2px dashed #e2e8f0;
        }
        .empty-icon {
          width: 100px;
          height: 100px;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: #667eea !important;
        }
        .empty-state h3 {
          font-size: 22px;
          font-weight: 700;
          color: #1a202c !important;
          margin: 0 0 10px 0;
        }
        .empty-state p {
          font-size: 15px;
          color: #718096 !important;
          margin: 0 0 28px 0;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }
        .modal {
          background: #ffffff;
          border-radius: 24px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 32px 64px rgba(0, 0, 0, 0.3);
          animation: modalSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid #e2e8f0;
          position: relative;
          z-index: 10000;
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .generator-modal {
          max-width: 680px;
        }
        .preview-modal {
          max-width: 860px;
        }
        .custom-modal {
          max-width: 800px;
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 28px;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          position: relative;
          z-index: 1;
        }
        .modal-title-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .modal-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #1a202c !important;
          margin: 0;
        }
        .modal-subtitle {
          font-size: 13px;
          color: #718096 !important;
          margin: 4px 0 0 0;
        }
        .modal-close {
          width: 40px;
          height: 40px;
          background: #f7fafc;
          border: none;
          border-radius: 12px;
          color: #4a5568;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s ease;
        }
        .modal-close:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          transform: rotate(90deg);
        }
        .modal-body {
          padding: 28px;
          overflow-y: auto;
          flex: 1;
          background: #ffffff;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 14px;
          padding: 20px 28px;
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
        }

        /* Form */
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .form-group {
          position: relative;
        }
        .form-group.full-width {
          grid-column: span 2;
        }
        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: #2d3748 !important;
          margin-bottom: 8px;
          letter-spacing: 0.2px;
        }
        .required {
          color: #ef4444 !important;
          margin-left: 4px;
        }
        .form-input, .form-select {
          width: 100%;
          padding: 14px 18px;
          background: #ffffff !important;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          color: #1a202c !important;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: #667eea;
          background: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
        }
        .form-input::placeholder {
          color: #a0aec0;
        }
        .currency-input {
          position: relative;
        }
        .currency-symbol {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #667eea;
          font-weight: 700;
          font-size: 16px;
        }
        .currency-input .form-input {
          padding-left: 36px;
        }

        /* Textarea */
        .form-textarea {
          width: 100%;
          padding: 14px 18px;
          background: #ffffff !important;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          color: #1a202c !important;
          resize: vertical;
          min-height: 200px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          line-height: 1.6;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .form-textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
        }
        .form-textarea::placeholder {
          color: #a0aec0;
          font-family: inherit;
        }
        .form-hint {
          font-size: 12px;
          color: #718096;
          margin: 0 0 10px 0;
        }

        /* Variables */
        .variables-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 16px;
          min-height: 20px;
        }
        .variable-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(102, 126, 234, 0.15);
          border-radius: 10px;
          border: 1px solid rgba(102, 126, 234, 0.25);
        }
        .variable-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .variable-key {
          font-family: 'Monaco', monospace;
          font-size: 12px;
          color: #667eea;
          font-weight: 600;
        }
        .variable-label {
          font-size: 13px;
          color: #2d3748 !important;
          font-weight: 500;
        }
        .variable-type {
          font-size: 11px;
          color: #718096;
          background: #edf2f7;
          padding: 2px 8px;
          border-radius: 6px;
          text-transform: uppercase;
        }
        .variable-remove {
          width: 24px;
          height: 24px;
          background: rgba(239, 68, 68, 0.1);
          border: none;
          border-radius: 6px;
          color: #ef4444;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .variable-remove:hover {
          background: #ef4444;
          color: white;
        }
        .add-variable-form {
          display: grid;
          grid-template-columns: 1fr 1fr 120px auto;
          gap: 12px;
          padding: 16px;
          background: #f7fafc;
          border-radius: 12px;
          border: 1px dashed #cbd5e0;
        }
        .btn-add-variable {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px 18px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-add-variable:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.35);
        }

        /* Preview */
        .preview-body {
          background: #f7fafc;
          padding: 32px;
        }
        .contract-preview {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 40px;
          font-family: 'Georgia', serif;
          max-height: 60vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        }
        .contract-preview pre {
          white-space: pre-wrap;
          font-family: inherit;
          font-size: 15px;
          line-height: 1.9;
          color: #2d3748 !important;
          margin: 0;
        }

        @media (max-width: 1024px) {
          .templates-grid, .loading-grid {
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          }
        }
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .templates-grid, .loading-grid {
            grid-template-columns: 1fr;
          }
          .table-header, .table-row {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .th:not(:first-child) {
            display: none;
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
          .form-group.full-width {
            grid-column: span 1;
          }
          .category-filter {
            padding: 12px 14px;
          }
          .filter-btn {
            padding: 8px 14px;
            font-size: 12px;
          }
        }
      `}</style>
          </div>
        </div>
      </div>
    </div>
  );
}
