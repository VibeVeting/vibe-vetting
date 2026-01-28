"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { downloadInvoice } from '@/lib/export-utils';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentCard {
  id: string;
  type: 'visa' | 'mastercard' | 'amex' | 'rupay';
  last4: string;
  expiry: string;
  isDefault: boolean;
  holderName: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  priceUSD?: number;
  period: string;
  features: string[];
  popular?: boolean;
  order?: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  planName: string;
  amount: number;
  status: string;
  paymentId: string;
}

// Helper function to parse user agent into friendly device name
function parseUserAgent(userAgent: string): { device: string; browser: string; os: string } {
  if (!userAgent) return { device: 'Unknown Device', browser: '', os: '' };
  
  const ua = userAgent.toLowerCase();
  
  // Detect OS
  let os = '';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac os x') || ua.includes('macintosh')) os = 'macOS';
  else if (ua.includes('iphone')) os = 'iPhone';
  else if (ua.includes('ipad')) os = 'iPad';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('chromeos')) os = 'ChromeOS';
  
  // Detect Browser
  let browser = '';
  if (ua.includes('edg/') || ua.includes('edge')) browser = 'Edge';
  else if (ua.includes('chrome') && !ua.includes('chromium')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('opera') || ua.includes('opr/')) browser = 'Opera';
  else if (ua.includes('brave')) browser = 'Brave';
  
  // Determine device type
  let device = '';
  if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) {
    device = 'Mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    device = 'Tablet';
  } else {
    device = 'Desktop';
  }
  
  return { device, browser, os };
}

export default function SettingsPage() {
  const { user, token, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('account');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isTwoFaSaving, setIsTwoFaSaving] = useState(false);
  const [twoFaMessage, setTwoFaMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    company: '',
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        company: user.company || '',
      });
    }
  }, [user]);

  useEffect(() => {
    setTwoFactorEnabled(!!user?.twoFactorEnabled);
  }, [user?.twoFactorEnabled]);

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    weekly: true,
  });
  
  // Plans from database
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  
  // Billing history
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  // Sessions
  const [sessions, setSessions] = useState<Array<{
    id: string;
    userAgent: string;
    ip: string;
    createdAt: string | Date;
    lastActive: string | Date;
    isCurrent: boolean;
  }>>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  
  // Payment states
  const [savedCards, setSavedCards] = useState<PaymentCard[]>([
    { id: '1', type: 'visa', last4: '4242', expiry: '12/26', isDefault: true, holderName: 'John Doe' },
  ]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('starter');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  
  // Load current plan from user context
  useEffect(() => {
    if (user?.currentPlan) {
      setCurrentPlan(user.currentPlan);
    }
  }, [user?.currentPlan]);
  
  // New card form
  const [newCard, setNewCard] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });

  // Fetch plans from database
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/plans');
        const data = await response.json();
        if (data.success && data.plans) {
          // Sort by order field to ensure correct display order
          const sortedPlans = [...data.plans].sort((a: Plan, b: Plan) => (a.order || 0) - (b.order || 0));
          setPlans(sortedPlans);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setPlansLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Fetch billing history
  const fetchInvoices = async () => {
    if (!user?.email) return;
    setInvoicesLoading(true);
    try {
      const response = await fetch('/api/billing', {
        headers: { 'x-user-id': user.email },
      });
      const data = await response.json();
      if (data.success && data.invoices) {
        setInvoices(data.invoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setInvoicesLoading(false);
    }
  };

  // Save profile settings to MongoDB
  const handleSaveProfile = async () => {
    if (!user?.email) return;
    
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.email,
        },
        body: JSON.stringify({
          name: profileForm.name,
          company: profileForm.company,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
        // Refresh user context if available
        if (refreshUser) {
          await refreshUser();
        }
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setIsSaving(false);
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (!user?.email || !token) {
      setPasswordMessage({ type: 'error', text: 'Please log in again to change password.' });
      setTimeout(() => setPasswordMessage(null), 3000);
      return;
    }

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Please fill all password fields.' });
      setTimeout(() => setPasswordMessage(null), 3000);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters.' });
      setTimeout(() => setPasswordMessage(null), 3000);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirm password do not match.' });
      setTimeout(() => setPasswordMessage(null), 3000);
      return;
    }

    setIsPasswordSaving(true);
    setPasswordMessage(null);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordMessage({ type: 'error', text: data.error || 'Failed to update password.' });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordMessage({ type: 'error', text: 'Failed to update password. Please try again.' });
    } finally {
      setIsPasswordSaving(false);
      setTimeout(() => setPasswordMessage(null), 3000);
    }
  };

  useEffect(() => {
    if (activeTab === 'billing' && user?.email) {
      fetchInvoices();
    }
  }, [activeTab, user?.email]);

  // Fetch sessions
  const fetchSessions = async () => {
    if (!token) return;
    setSessionsLoading(true);
    try {
      const res = await fetch('/api/auth/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'security') {
      fetchSessions();
    }
  }, [activeTab, token]);

  const handleRevokeSession = async (sessionId: string) => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.success) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      }
    } catch (error) {
      console.error('Error revoking session:', error);
    }
  };

  const handleRevokeOthers = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ revokeAllOthers: true }),
      });
      const data = await res.json();
      if (data.success) {
        setSessions((prev) => prev.filter((s) => s.isCurrent));
      }
    } catch (error) {
      console.error('Error revoking other sessions:', error);
    }
  };

  const handleToggleTwoFactor = async () => {
    if (!token || !user?.email) {
      setTwoFaMessage({ type: 'error', text: 'Please log in again to update two-factor.' });
      setTimeout(() => setTwoFaMessage(null), 3000);
      return;
    }

    setIsTwoFaSaving(true);
    setTwoFaMessage(null);

    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enable: !twoFactorEnabled }),
      });
      const data = await res.json();

      if (data.success) {
        const enabled = !!data.twoFactorEnabled;
        setTwoFactorEnabled(enabled);
        setTwoFaMessage({
          type: 'success',
          text: enabled
            ? 'Two-factor authentication enabled. We will email verification codes when you sign in.'
            : 'Two-factor authentication disabled.',
        });
        if (refreshUser) {
          await refreshUser();
        }
      } else {
        setTwoFaMessage({ type: 'error', text: data.error || 'Failed to update two-factor settings.' });
      }
    } catch (error) {
      console.error('Error updating two-factor:', error);
      setTwoFaMessage({ type: 'error', text: 'Failed to update two-factor settings. Please try again.' });
    } finally {
      setIsTwoFaSaving(false);
      setTimeout(() => setTwoFaMessage(null), 3000);
    }
  };

  // Read tab from URL params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['account', 'notifications', 'security', 'billing'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Load Razorpay script
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  
  useEffect(() => {
    // Check if already loaded
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      setRazorpayLoaded(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
    };
    
    document.body.appendChild(script);
    
    return () => {
      // Don't remove the script on cleanup as it might be needed
    };
  }, []);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const getCardType = (number: string): 'visa' | 'mastercard' | 'amex' | 'rupay' => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'visa';
    if (cleaned.startsWith('5')) return 'mastercard';
    if (cleaned.startsWith('34') || cleaned.startsWith('37')) return 'amex';
    if (cleaned.startsWith('6')) return 'rupay';
    return 'visa';
  };

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'visa': return 'fa-cc-visa';
      case 'mastercard': return 'fa-cc-mastercard';
      case 'amex': return 'fa-cc-amex';
      default: return 'fa-credit-card';
    }
  };

  const handleAddCard = () => {
    if (!newCard.number || !newCard.expiry || !newCard.cvv || !newCard.name) {
      alert('Please fill in all card details');
      return;
    }

    const cardType = getCardType(newCard.number);
    const last4 = newCard.number.replace(/\s/g, '').slice(-4);
    
    const card: PaymentCard = {
      id: Date.now().toString(),
      type: cardType,
      last4,
      expiry: newCard.expiry,
      isDefault: savedCards.length === 0,
      holderName: newCard.name,
    };

    setSavedCards([...savedCards, card]);
    setNewCard({ number: '', expiry: '', cvv: '', name: '' });
    setShowAddCard(false);
  };

  const handleDeleteCard = (id: string) => {
    setSavedCards(savedCards.filter(c => c.id !== id));
  };

  const handleSetDefaultCard = (id: string) => {
    setSavedCards(savedCards.map(c => ({ ...c, isDefault: c.id === id })));
  };

  const initiateRazorpayPayment = (plan: Plan) => {
    // Check if Razorpay is loaded
    if (typeof window === 'undefined' || !window.Razorpay) {
      alert('Payment system is loading. Please try again in a moment.');
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag', // Razorpay test key
      amount: plan.price * 100, // Amount in paise
      currency: 'INR',
      name: 'VibeVetting',
      description: `${plan.name} Plan Subscription`,
      image: 'https://via.placeholder.com/150x150?text=VV',
      handler: async function (response: any) {
        // Payment successful
        console.log('Payment ID:', response.razorpay_payment_id);
        console.log('Order ID:', response.razorpay_order_id);
        console.log('Signature:', response.razorpay_signature);
        
        // Save invoice to database
        try {
          const invoiceResponse = await fetch('/api/billing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user?.email,
              userEmail: user?.email,
              userName: user?.name,
              planId: plan.id,
              planName: plan.name,
              amount: plan.price,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            }),
          });
          
          const invoiceData = await invoiceResponse.json();
          if (invoiceData.success) {
            console.log('Invoice created:', invoiceData.invoice.invoiceNumber);
            // Refresh invoices list
            if (user?.email) {
              const fetchRes = await fetch('/api/billing', {
                headers: { 'x-user-id': user.email },
              });
              const fetchData = await fetchRes.json();
              if (fetchData.success) {
                setInvoices(fetchData.invoices);
              }
            }
            // Refresh user data to get updated plan
            if (refreshUser) {
              await refreshUser();
            }
          }
        } catch (error) {
          console.error('Error saving invoice:', error);
        }
        
        setCurrentPlan(plan.id);
        setShowPlanModal(false);
        setIsProcessing(false);
        alert(`🎉 Successfully upgraded to ${plan.name} plan!\n\nPayment ID: ${response.razorpay_payment_id}\n\nYour invoice has been generated and is available in Billing History.`);
      },
      prefill: {
        name: user?.name || 'Test User',
        email: user?.email || 'test@example.com',
        contact: '9999999999',
      },
      notes: {
        plan_id: plan.id,
        plan_name: plan.name,
      },
      theme: {
        color: '#667eea',
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
        },
        escape: true,
        animation: true,
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      razorpay.open();
    } catch (error) {
      console.error('Razorpay error:', error);
      alert('Failed to initialize payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleUpgrade = (plan: Plan) => {
    // Enterprise plan - contact sales
    if (plan.period === 'custom') {
      window.open('mailto:sales@vibevetting.com?subject=Enterprise Plan Inquiry', '_blank');
      return;
    }
    setSelectedPlan(plan);
    initiateRazorpayPayment(plan);
  };

  return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="main-content">
          <div className="container" style={{ maxWidth: '1000px' }}>
            <TopBar
              title="Settings"
              subtitle="Manage your account and preferences"
              showSearch={false}
            />

            {/* Settings Layout */}
            <div className="settings-wrapper">
              {/* Navigation */}
              <div className="settings-nav">
                <div className="settings-nav-title">Settings</div>
                <div 
                  className={`settings-nav-item ${activeTab === 'account' ? 'active' : ''}`}
                  onClick={() => setActiveTab('account')}
                >
                  <i className="fa-solid fa-user"></i>
                  Account
                </div>
                <div 
                  className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <i className="fa-solid fa-bell"></i>
                  Notifications
                </div>
                <div 
                  className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  <i className="fa-solid fa-shield"></i>
                  Security
                </div>
                <div 
                  className={`settings-nav-item ${activeTab === 'billing' ? 'active' : ''}`}
                  onClick={() => setActiveTab('billing')}
                >
                  <i className="fa-solid fa-credit-card"></i>
                  Billing
                </div>
              </div>

              {/* Content */}
              <div className="settings-content">
                {activeTab === 'account' && (
                  <>
                    <div className="section-title">
                      <i className="fa-solid fa-user"></i>
                      Profile Information
                    </div>
                    {saveMessage && (
                      <div className={`save-message ${saveMessage.type}`}>
                        <i className={`fa-solid ${saveMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                        {saveMessage.text}
                      </div>
                    )}
                    <div className="setting-item">
                      <div className="setting-label">
                        <div className="setting-title">Full Name</div>
                        <div className="setting-description">Your display name</div>
                      </div>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        style={{ width: '250px' }} 
                      />
                    </div>
                    <div className="setting-item">
                      <div className="setting-label">
                        <div className="setting-title">Email Address</div>
                        <div className="setting-description">Your primary email</div>
                      </div>
                      <input 
                        type="email" 
                        className="form-input" 
                        value={profileForm.email}
                        disabled
                        style={{ width: '250px', opacity: 0.7, cursor: 'not-allowed' }} 
                      />
                    </div>
                    <div className="setting-item">
                      <div className="setting-label">
                        <div className="setting-title">Company</div>
                        <div className="setting-description">Your organization</div>
                      </div>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={profileForm.company}
                        onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                        style={{ width: '250px' }} 
                      />
                    </div>
                    <div className="setting-item" style={{ borderBottom: 'none', paddingTop: '20px' }}>
                      <div className="setting-label"></div>
                      <button 
                        className="btn btn-primary"
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          padding: '12px 24px',
                        }}
                      >
                        {isSaving ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-save"></i>
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}

              {activeTab === 'notifications' && (
                <>
                  <div className="section-title">
                    <i className="fa-solid fa-bell"></i>
                    Notification Preferences
                  </div>
                  <div className="setting-item">
                    <div className="setting-label">
                      <div className="setting-title">Email Notifications</div>
                      <div className="setting-description">Receive updates via email</div>
                    </div>
                    <div 
                      className={`toggle ${notifications.email ? 'active' : ''}`}
                      onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                    ></div>
                  </div>
                  <div className="setting-item">
                    <div className="setting-label">
                      <div className="setting-title">Push Notifications</div>
                      <div className="setting-description">Browser push notifications</div>
                    </div>
                    <div 
                      className={`toggle ${notifications.push ? 'active' : ''}`}
                      onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
                    ></div>
                  </div>
                  <div className="setting-item">
                    <div className="setting-label">
                      <div className="setting-title">SMS Notifications</div>
                      <div className="setting-description">Get text message alerts</div>
                    </div>
                    <div 
                      className={`toggle ${notifications.sms ? 'active' : ''}`}
                      onClick={() => setNotifications({ ...notifications, sms: !notifications.sms })}
                    ></div>
                  </div>
                  <div className="setting-item">
                    <div className="setting-label">
                      <div className="setting-title">Weekly Digest</div>
                      <div className="setting-description">Summary of weekly activity</div>
                    </div>
                    <div 
                      className={`toggle ${notifications.weekly ? 'active' : ''}`}
                      onClick={() => setNotifications({ ...notifications, weekly: !notifications.weekly })}
                    ></div>
                  </div>
                </>
              )}

              {activeTab === 'security' && (
                <>
                  <div className="section-title">
                    <i className="fa-solid fa-shield"></i>
                    Security Settings
                  </div>
                  {passwordMessage && (
                    <div className={`save-message ${passwordMessage.type}`}>
                      <i className={`fa-solid ${passwordMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                      {passwordMessage.text}
                    </div>
                  )}

                  <div className="setting-item password-form">
                    <div className="setting-label">
                      <div className="setting-title">Current Password</div>
                      <div className="setting-description">Enter your existing password</div>
                    </div>
                    <input
                      type="password"
                      className="form-input"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      style={{ width: '260px' }}
                    />
                  </div>

                  <div className="setting-item password-form">
                    <div className="setting-label">
                      <div className="setting-title">New Password</div>
                      <div className="setting-description">Minimum 8 characters</div>
                    </div>
                    <input
                      type="password"
                      className="form-input"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="••••••••"
                      style={{ width: '260px' }}
                    />
                  </div>

                  <div className="setting-item password-form" style={{ borderBottom: 'none' }}>
                    <div className="setting-label">
                      <div className="setting-title">Confirm New Password</div>
                      <div className="setting-description">Re-enter to confirm</div>
                    </div>
                    <input
                      type="password"
                      className="form-input"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      style={{ width: '260px' }}
                    />
                  </div>

                  <div className="setting-item" style={{ borderBottom: 'none', paddingTop: '8px' }}>
                    <div className="setting-label"></div>
                    <button
                      className="btn btn-primary"
                      onClick={handleChangePassword}
                      disabled={isPasswordSaving}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                      }}
                    >
                      {isPasswordSaving ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-lock"></i>
                          Update Password
                        </>
                      )}
                    </button>
                  </div>

                  <div className="section-title" style={{ marginTop: '12px' }}>
                    <i className="fa-solid fa-mobile"></i>
                    Active Sessions
                  </div>

                  <div className="sessions-list">
                    {sessionsLoading ? (
                      <div className="session-card loading">
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        Loading sessions...
                      </div>
                    ) : sessions.length === 0 ? (
                      <div className="session-card empty">
                        <i className="fa-solid fa-laptop"></i>
                        <div>
                          <div className="session-name">No active sessions</div>
                          <div className="session-meta">Sign in from another device to see it here.</div>
                        </div>
                      </div>
                    ) : (
                      sessions.map((session) => {
                        const { device, browser, os } = parseUserAgent(session.userAgent);
                        const deviceName = [browser, 'on', os].filter(Boolean).join(' ') || 'Unknown Device';
                        const isMobile = device === 'Mobile' || device === 'Tablet';
                        
                        return (
                        <div key={session.id} className={`session-card ${session.isCurrent ? 'current' : ''}`}>
                          <div className="session-left">
                            <div className="session-icon">
                              <i className={isMobile ? 'fa-solid fa-mobile-screen' : 'fa-solid fa-laptop'}></i>
                            </div>
                            <div>
                              <div className="session-name">{deviceName}</div>
                              <div className="session-meta">
                                {session.isCurrent ? 'This device' : ''} · Last active {new Date(session.lastActive).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          {!session.isCurrent && (
                            <button className="btn btn-secondary btn-sm" onClick={() => handleRevokeSession(session.id)}>
                              <i className="fa-solid fa-right-from-bracket"></i>
                              Sign out
                            </button>
                          )}
                          {session.isCurrent && (
                            <span className="session-badge">Current</span>
                          )}
                        </div>
                        );
                      })
                    )}
                  </div>

                  <div className="session-actions">
                    <div>
                      <div className="session-name">Sign out of other sessions</div>
                      <div className="session-meta">Keep this device signed in, log out everywhere else.</div>
                    </div>
                    <button className="btn btn-secondary" onClick={handleRevokeOthers} disabled={sessionsLoading || sessions.filter(s => !s.isCurrent).length === 0}>
                      <i className="fa-solid fa-door-open"></i>
                      Sign out others
                    </button>
                  </div>

                  {twoFaMessage && (
                    <div className={`save-message ${twoFaMessage.type}`} style={{ marginTop: '8px' }}>
                      <i className={`fa-solid ${twoFaMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                      {twoFaMessage.text}
                    </div>
                  )}

                  <div className="setting-item" style={{ marginTop: '8px', borderBottom: 'none' }}>
                    <div className="setting-label">
                      <div className="setting-title">Two-Factor Authentication</div>
                      <div className="setting-description">
                        {twoFactorEnabled
                          ? 'Currently enabled. Verification codes will be emailed when you log in.'
                          : 'Add extra security to your account'}
                      </div>
                    </div>
                    <button
                      className={`btn ${twoFactorEnabled ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={handleToggleTwoFactor}
                      disabled={isTwoFaSaving}
                    >
                      {isTwoFaSaving ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className={`fa-solid ${twoFactorEnabled ? 'fa-toggle-off' : 'fa-shield-heart'}`}></i>
                          {twoFactorEnabled ? 'Disable' : 'Enable'}
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

              {activeTab === 'billing' && (
                <>
                  <div className="section-title">
                    <i className="fa-solid fa-credit-card"></i>
                    Billing & Plans
                  </div>
                  
                  {/* Current Plan */}
                  <div className="billing-card current-plan-card">
                    <div className="plan-header">
                      <div className="plan-badge">{plans.find(p => p.id === currentPlan)?.name || 'Pro'}</div>
                      <span className="plan-status active">Active</span>
                    </div>
                    <div className="plan-price">
                      <span className="price-amount">₹{(plans.find(p => p.id === currentPlan)?.price || 4999).toLocaleString()}</span>
                      <span className="price-period">/month</span>
                    </div>
                    <div className="plan-features">
                      {plans.find(p => p.id === currentPlan)?.features.slice(0, 3).map((f, i) => (
                        <div key={i} className="feature-item">
                          <i className="fa-solid fa-check"></i>
                          {f}
                        </div>
                      ))}
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowPlanModal(true)}>
                      <i className="fa-solid fa-arrow-up"></i>
                      Change Plan
                    </button>
                  </div>

                  {/* Payment Methods */}
                  <div className="section-title" style={{ marginTop: '32px' }}>
                    <i className="fa-solid fa-wallet"></i>
                    Payment Methods
                  </div>

                  <div className="cards-list">
                    {savedCards.map((card) => (
                      <div key={card.id} className={`payment-card-item ${card.isDefault ? 'default' : ''}`}>
                        <div className="card-icon">
                          <i className={`fa-brands ${getCardIcon(card.type)}`}></i>
                        </div>
                        <div className="card-details">
                          <div className="card-number">•••• •••• •••• {card.last4}</div>
                          <div className="card-meta">
                            <span>{card.holderName}</span>
                            <span>Expires {card.expiry}</span>
                          </div>
                        </div>
                        {card.isDefault && <span className="default-badge">Default</span>}
                        <div className="card-actions">
                          {!card.isDefault && (
                            <button 
                              className="card-action-btn"
                              onClick={() => handleSetDefaultCard(card.id)}
                              title="Set as default"
                            >
                              <i className="fa-solid fa-star"></i>
                            </button>
                          )}
                          <button 
                            className="card-action-btn delete"
                            onClick={() => handleDeleteCard(card.id)}
                            title="Remove card"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add Card Button */}
                    {!showAddCard ? (
                      <button className="add-card-btn" onClick={() => setShowAddCard(true)}>
                        <i className="fa-solid fa-plus"></i>
                        Add New Card
                      </button>
                    ) : (
                      <div className="add-card-form">
                        <div className="form-header">
                          <h4>Add New Card</h4>
                          <button className="close-btn" onClick={() => setShowAddCard(false)}>
                            <i className="fa-solid fa-times"></i>
                          </button>
                        </div>
                        
                        <div className="card-preview">
                          <div className="card-preview-inner">
                            <div className="card-preview-top">
                              <i className={`fa-brands ${getCardIcon(getCardType(newCard.number))}`}></i>
                              <div className="card-chip"></div>
                            </div>
                            <div className="card-preview-number">
                              {newCard.number || '•••• •••• •••• ••••'}
                            </div>
                            <div className="card-preview-bottom">
                              <div className="card-preview-name">{newCard.name || 'CARD HOLDER'}</div>
                              <div className="card-preview-expiry">{newCard.expiry || 'MM/YY'}</div>
                            </div>
                          </div>
                        </div>

                        <div className="form-grid">
                          <div className="form-group full-width">
                            <label>Card Number</label>
                            <div className="input-with-icon">
                              <i className="fa-solid fa-credit-card"></i>
                              <input
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                value={newCard.number}
                                onChange={(e) => setNewCard({ ...newCard, number: formatCardNumber(e.target.value) })}
                                maxLength={19}
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Expiry Date</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              value={newCard.expiry}
                              onChange={(e) => setNewCard({ ...newCard, expiry: formatExpiry(e.target.value) })}
                              maxLength={5}
                            />
                          </div>
                          <div className="form-group">
                            <label>CVV</label>
                            <input
                              type="password"
                              placeholder="•••"
                              value={newCard.cvv}
                              onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                              maxLength={4}
                            />
                          </div>
                          <div className="form-group full-width">
                            <label>Cardholder Name</label>
                            <input
                              type="text"
                              placeholder="John Doe"
                              value={newCard.name}
                              onChange={(e) => setNewCard({ ...newCard, name: e.target.value.toUpperCase() })}
                            />
                          </div>
                        </div>

                        <div className="form-actions">
                          <button className="btn btn-secondary" onClick={() => setShowAddCard(false)}>Cancel</button>
                          <button className="btn btn-primary" onClick={handleAddCard}>
                            <i className="fa-solid fa-lock"></i>
                            Save Card Securely
                          </button>
                        </div>

                        <div className="security-note">
                          <i className="fa-solid fa-shield-check"></i>
                          Your card details are encrypted and secured with 256-bit SSL
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Billing History */}
                  <div className="section-title" style={{ marginTop: '32px' }}>
                    <i className="fa-solid fa-receipt"></i>
                    Billing History
                  </div>

                  <div className="billing-history">
                    {invoicesLoading ? (
                      <div className="invoices-loading">
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        <span>Loading billing history...</span>
                      </div>
                    ) : invoices.length === 0 ? (
                      <div className="no-invoices">
                        <i className="fa-solid fa-receipt"></i>
                        <p>No payment history yet</p>
                        <span>Your invoices will appear here after your first payment</span>
                      </div>
                    ) : (
                      invoices.map((invoice) => (
                        <div key={invoice.id} className="invoice-item">
                          <div className="invoice-date">
                            <i className="fa-solid fa-file-invoice"></i>
                            <div>
                              <span className="invoice-title">{invoice.planName} Plan - {invoice.invoiceNumber}</span>
                              <span className="invoice-date-text">{new Date(invoice.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                          </div>
                          <div className="invoice-amount">₹{invoice.amount.toLocaleString('en-IN')}</div>
                          <span className={`invoice-status ${invoice.status}`}>{invoice.status === 'paid' ? 'Paid' : invoice.status}</span>
                          <button 
                            className="btn btn-sm"
                            onClick={() => downloadInvoice({
                              invoiceNumber: invoice.invoiceNumber,
                              date: new Date(invoice.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
                              planName: invoice.planName,
                              amount: invoice.amount,
                              paymentId: invoice.paymentId,
                              customerName: user?.name || 'Customer',
                              customerEmail: user?.email || '',
                            })}
                          >
                            <i className="fa-solid fa-download"></i>
                            Download
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Plan Selection Modal */}
          {showPlanModal && (
            <div className="modal-overlay" onClick={() => setShowPlanModal(false)}>
              <div className="plan-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Choose Your Plan</h2>
                  <button className="close-btn" onClick={() => setShowPlanModal(false)}>
                    <i className="fa-solid fa-times"></i>
                  </button>
                </div>

                <div className="plans-grid">
                  {plansLoading ? (
                    <div className="plans-loading">
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span>Loading plans...</span>
                    </div>
                  ) : plans.length === 0 ? (
                    <div className="plans-loading">
                      <span>No plans available</span>
                    </div>
                  ) : plans.map((plan) => (
                    <div 
                      key={plan.id} 
                      className={`plan-card ${plan.popular ? 'popular' : ''} ${currentPlan === plan.id ? 'current' : ''}`}
                    >
                      {plan.popular && <div className="popular-badge">Most Popular</div>}
                      {currentPlan === plan.id && <div className="current-badge">Current Plan</div>}
                      
                      <h3 className="plan-name">{plan.name}</h3>
                      <div className="plan-pricing">
                        {plan.period === 'custom' ? (
                          <span className="plan-price-amount">Custom</span>
                        ) : (
                          <>
                            <span className="plan-price-amount">₹{plan.price.toLocaleString()}</span>
                            <span className="plan-price-period">/mo</span>
                          </>
                        )}
                      </div>
                      
                      <ul className="plan-features-list">
                        {plan.features.map((feature, i) => (
                          <li key={i}>
                            <i className="fa-solid fa-check"></i>
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <button 
                        className={`plan-select-btn ${currentPlan === plan.id ? 'current' : ''}`}
                        onClick={() => handleUpgrade(plan)}
                        disabled={currentPlan === plan.id || isProcessing || (!razorpayLoaded && plan.price > 0 && plan.period !== 'custom')}
                      >
                        {isProcessing && selectedPlan?.id === plan.id ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            Processing...
                          </>
                        ) : !razorpayLoaded && plan.price > 0 && plan.period !== 'custom' ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            Loading...
                          </>
                        ) : currentPlan === plan.id ? (
                          'Current Plan'
                        ) : plan.period === 'custom' ? (
                          <>
                            <i className="fa-solid fa-envelope"></i>
                            Contact Sales
                          </>
                        ) : (() => {
                          // Determine if this is an upgrade or downgrade
                          const currentPlanOrder = plans.find(p => p.id === currentPlan)?.order || 0;
                          const thisPlanOrder = plan.order || 0;
                          const isDowngrade = thisPlanOrder < currentPlanOrder;
                          return (
                            <>
                              <i className={`fa-solid fa-arrow-${isDowngrade ? 'down' : 'right'}`}></i>
                              {isDowngrade ? 'Downgrade' : 'Upgrade Now'}
                            </>
                          );
                        })()}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="payment-methods-info">
                  <span>Secure payments powered by</span>
                  <img src="https://cdn.razorpay.com/logo.svg" alt="Razorpay" height="24" />
                </div>
              </div>
            </div>
          )}

          </div>
        </div>
      </div>
  );
}

function AppearanceTab() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <>
      <div className="section-title">
        <i className="fa-solid fa-palette"></i>
        Appearance
      </div>
      
      <div className="setting-item">
        <div className="setting-label">
          <div className="setting-title">Theme</div>
          <div className="setting-description">Choose between dark and light mode</div>
        </div>
        <div 
          className="theme-toggle"
          onClick={toggleTheme}
        >
          <div className="theme-toggle-track">
            <div className="theme-toggle-thumb">
              <i className={`fa-solid ${theme === 'dark' ? 'fa-moon' : 'fa-sun'}`}></i>
            </div>
          </div>
          <span className="theme-toggle-label">
            {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
        </div>
      </div>
      
      <div className="theme-preview" style={{
        marginTop: '24px',
        padding: '20px',
        borderRadius: '12px',
        background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: theme === 'dark' 
              ? 'linear-gradient(135deg, #22c55e 0%, #00f5ff 100%)' 
              : 'linear-gradient(135deg, #5a67d8 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <i className="fa-solid fa-palette" style={{ color: 'white', fontSize: '20px' }}></i>
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '16px' }}>
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.6 }}>
              {theme === 'dark' 
                ? 'Easy on the eyes, perfect for night work' 
                : 'Clean and bright, great for daytime'}
            </div>
          </div>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '8px',
          marginTop: '16px' 
        }}>
          {['#22c55e', '#00f5ff', '#8b5cf6', '#f59e0b'].map((color, i) => (
            <div key={i} style={{
              height: '32px',
              borderRadius: '8px',
              background: color,
              opacity: theme === 'dark' ? 1 : 0.85,
            }} />
          ))}
        </div>
      </div>
    </>
  );
}
