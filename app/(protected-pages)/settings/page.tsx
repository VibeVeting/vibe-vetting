"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { useState, useEffect, useRef } from 'react';
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
  const [isVisible, setIsVisible] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    company: '',
  });

  // Company/Brand form state
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    industry: '',
    industryType: '',
    description: '',
    website: '',
    linkedin_url: '',
    twitter_url: '',
    location: '',
    employee_range: '',
    revenue_range: '',
    founded_year: '',
  });
  const [isCompanyLoading, setIsCompanyLoading] = useState(false);
  const [isCompanySaving, setIsCompanySaving] = useState(false);
  const [companyMessage, setCompanyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [companyExists, setCompanyExists] = useState(false);

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

  // Fetch company data when user's company name is available
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!user?.company) {
        setCompanyForm(prev => ({ ...prev, companyName: '' }));
        setCompanyExists(false);
        return;
      }
      
      setIsCompanyLoading(true);
      try {
        const response = await fetch(`/api/company?name=${encodeURIComponent(user.company)}`);
        const data = await response.json();
        
        if (data.success && data.company) {
          const company = data.company;
          setCompanyForm({
            companyName: company.companyName || user.company || '',
            industry: company.industry || '',
            industryType: company.industryType || '',
            description: company.description || '',
            website: company.website || '',
            linkedin_url: company.linkedin_url || '',
            twitter_url: company.twitter_url || '',
            location: company.location || '',
            employee_range: company.employee_range || '',
            revenue_range: company.revenue_range || '',
            founded_year: company.founded_year?.toString() || '',
          });
          setCompanyExists(true);
        } else {
          // Company doesn't exist yet, initialize with user's company name
          setCompanyForm(prev => ({ ...prev, companyName: user.company || '' }));
          setCompanyExists(false);
        }
      } catch (error) {
        console.error('Error fetching company data:', error);
        setCompanyForm(prev => ({ ...prev, companyName: user?.company || '' }));
        setCompanyExists(false);
      } finally {
        setIsCompanyLoading(false);
      }
    };

    if (activeTab === 'company') {
      fetchCompanyData();
    }
  }, [user?.company, activeTab]);

  useEffect(() => {
    setTwoFactorEnabled(!!user?.twoFactorEnabled);
  }, [user?.twoFactorEnabled]);

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    weekly: true,
  });
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsSaving, setNotificationsSaving] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch notification preferences from database
  useEffect(() => {
    const fetchNotificationPreferences = async () => {
      if (!user?.email) return;
      
      try {
        const response = await fetch('/api/user/settings', {
          headers: { 'x-user-id': user.email },
        });
        const data = await response.json();
        
        if (data.success && data.user?.notificationPreferences) {
          setNotifications(data.user.notificationPreferences);
        }
      } catch (error) {
        console.error('Error fetching notification preferences:', error);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotificationPreferences();
  }, [user?.email]);

  // Save notification preferences to database
  const handleNotificationToggle = async (key: keyof typeof notifications) => {
    if (!user?.email) return;
    
    const newNotifications = { ...notifications, [key]: !notifications[key] };
    setNotifications(newNotifications);
    setNotificationsSaving(true);
    
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.email,
        },
        body: JSON.stringify({
          notificationPreferences: newNotifications,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setNotificationMessage({ type: 'success', text: 'Notification preference saved!' });
      } else {
        // Revert on failure
        setNotifications(notifications);
        setNotificationMessage({ type: 'error', text: data.error || 'Failed to save preference' });
      }
    } catch (error) {
      console.error('Error saving notification preference:', error);
      setNotifications(notifications);
      setNotificationMessage({ type: 'error', text: 'Failed to save preference' });
    } finally {
      setNotificationsSaving(false);
      setTimeout(() => setNotificationMessage(null), 2000);
    }
  };
  
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

  // Fetch plans from database - only show the 3 main plans matching home page
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/plans');
        const data = await response.json();
        if (data.success && data.plans) {
          // Filter to only show the 3 main plans: Starter, Growth, Enterprise (matching home page)
          const mainPlanIds = ['starter', 'growth', 'enterprise'];
          const filteredPlans = data.plans.filter((plan: Plan) => mainPlanIds.includes(plan.id));
          // Sort by order field to ensure correct display order
          const sortedPlans = [...filteredPlans].sort((a: Plan, b: Plan) => (a.order || 0) - (b.order || 0));
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

  // Save company/brand settings to MongoDB
  const handleSaveCompany = async () => {
    if (!companyForm.companyName) {
      setCompanyMessage({ type: 'error', text: 'Company name is required. Please set it in Account settings first.' });
      setTimeout(() => setCompanyMessage(null), 3000);
      return;
    }
    
    setIsCompanySaving(true);
    setCompanyMessage(null);
    
    try {
      const response = await fetch('/api/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: companyForm.companyName,
          industry: companyForm.industry || undefined,
          industryType: companyForm.industryType || undefined,
          description: companyForm.description || undefined,
          website: companyForm.website || undefined,
          linkedin_url: companyForm.linkedin_url || undefined,
          twitter_url: companyForm.twitter_url || undefined,
          location: companyForm.location || undefined,
          employee_range: companyForm.employee_range || undefined,
          revenue_range: companyForm.revenue_range || undefined,
          founded_year: companyForm.founded_year ? parseInt(companyForm.founded_year) : undefined,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCompanyMessage({ type: 'success', text: 'Company information saved successfully!' });
        setCompanyExists(true);
      } else {
        setCompanyMessage({ type: 'error', text: data.error || 'Failed to save company information' });
      }
    } catch (error) {
      console.error('Error saving company:', error);
      setCompanyMessage({ type: 'error', text: 'Failed to save company information. Please try again.' });
    } finally {
      setIsCompanySaving(false);
      setTimeout(() => setCompanyMessage(null), 3000);
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
    if (tab && ['account', 'company', 'notifications', 'security', 'billing'].includes(tab)) {
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
          <div className="yc-page" ref={pageRef}>
            {/* YC Background Effects */}
            <div className="yc-page-bg">
              <div className="yc-page-orb yc-page-orb-1"></div>
              <div className="yc-page-orb yc-page-orb-2"></div>
              <div className="yc-page-grid"></div>
            </div>

            {/* YC Page Header */}
            <div className={`yc-page-header ${isVisible ? 'visible' : ''}`}>
              <div className="yc-page-header-content">
                <div className="yc-page-title-section">
                  <div className="yc-page-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <i className="fa-solid fa-gear"></i>
                  </div>
                  <div>
                    <h1 className="yc-page-title">Settings</h1>
                    <p className="yc-page-subtitle">Manage your account and preferences</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Layout */}
            <div className="settings-wrapper" style={{ position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px' }}>
              {/* Navigation - YC Style */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '20px', border: '1px solid var(--border-color)', padding: '20px', height: 'fit-content', position: 'sticky', top: '100px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 12px', marginBottom: '16px' }}>Settings</div>
                {[
                  { id: 'account', icon: 'fa-user', label: 'Account' },
                  { id: 'company', icon: 'fa-building', label: 'Company' },
                  { id: 'notifications', icon: 'fa-bell', label: 'Notifications' },
                  { id: 'security', icon: 'fa-shield', label: 'Security' },
                  { id: 'billing', icon: 'fa-credit-card', label: 'Billing' },
                ].map((tab) => (
                  <div 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                      borderRadius: '12px', cursor: 'pointer', marginBottom: '4px',
                      background: activeTab === tab.id ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' : 'transparent',
                      border: activeTab === tab.id ? '1px solid rgba(102, 126, 234, 0.2)' : '1px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <i className={`fa-solid ${tab.icon}`} style={{ fontSize: '14px', width: '20px', color: activeTab === tab.id ? '#667eea' : 'var(--text-muted)' }}></i>
                    <span style={{ fontSize: '14px', fontWeight: activeTab === tab.id ? 600 : 500, color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{tab.label}</span>
                    {activeTab === tab.id && <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}></div>}
                  </div>
                ))}
              </div>

              {/* Content */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '20px', border: '1px solid var(--border-color)', padding: '32px' }}>
                {activeTab === 'account' && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px' }}>
                        <i className="fa-solid fa-user"></i>
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Profile Information</h3>
                    </div>
                    {saveMessage && (
                      <div style={{ padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', background: saveMessage.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: saveMessage.type === 'success' ? '#22c55e' : '#ef4444' }}>
                        <i className={`fa-solid ${saveMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                        {saveMessage.text}
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {[
                        { label: 'Full Name', desc: 'Your display name', value: profileForm.name, field: 'name', disabled: false },
                        { label: 'Email Address', desc: 'Your primary email', value: profileForm.email, field: 'email', disabled: true },
                        { label: 'Company', desc: 'Your organization', value: profileForm.company, field: 'company', disabled: false },
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(102, 126, 234, 0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{item.label}</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.desc}</div>
                          </div>
                          <input 
                            type={item.field === 'email' ? 'email' : 'text'}
                            value={item.value}
                            disabled={item.disabled}
                            onChange={(e) => setProfileForm({ ...profileForm, [item.field]: e.target.value })}
                            style={{ width: '260px', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '14px', background: item.disabled ? 'rgba(102, 126, 234, 0.05)' : 'var(--bg-primary)', color: 'var(--text-primary)', opacity: item.disabled ? 0.7 : 1 }}
                          />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                      <button className="yc-btn-primary" onClick={handleSaveProfile} disabled={isSaving}>
                        {isSaving ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</> : <><i className="fa-solid fa-save"></i> Save Changes</>}
                      </button>
                    </div>
                  </>
                )}

              {activeTab === 'company' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px' }}>
                      <i className="fa-solid fa-building"></i>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Company & Brand Information</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Update your company profile for better creator matching</p>
                    </div>
                  </div>
                  
                  {!user?.company && (
                    <div style={{ padding: '20px', borderRadius: '12px', marginBottom: '24px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f59e0b' }}>
                        <i className="fa-solid fa-exclamation-triangle"></i>
                        <span style={{ fontWeight: 600 }}>No company set</span>
                      </div>
                      <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Please set your company name in the Account tab first, then return here to add detailed company information.
                      </p>
                    </div>
                  )}
                  
                  {companyMessage && (
                    <div style={{ padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', background: companyMessage.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: companyMessage.type === 'success' ? '#22c55e' : '#ef4444' }}>
                      <i className={`fa-solid ${companyMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                      {companyMessage.text}
                    </div>
                  )}

                  {isCompanyLoading ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '12px' }}></i>
                      <p>Loading company information...</p>
                    </div>
                  ) : (
                    <>
                      {/* Basic Information Section */}
                      <div style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                          <i className="fa-solid fa-info-circle" style={{ color: '#667eea' }}></i>
                          <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Basic Information</h4>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(102, 126, 234, 0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Company Name</div>
                              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Your official company name</div>
                            </div>
                            <input 
                              type="text"
                              value={companyForm.companyName}
                              disabled={true}
                              style={{ width: '280px', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '14px', background: 'rgba(102, 126, 234, 0.05)', color: 'var(--text-primary)', opacity: 0.7 }}
                            />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 20px', background: 'rgba(102, 126, 234, 0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Description</div>
                              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Brief description of your company</div>
                            </div>
                            <textarea 
                              value={companyForm.description}
                              onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                              placeholder="What does your company do?"
                              disabled={!user?.company}
                              rows={3}
                              style={{ width: '280px', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '14px', background: user?.company ? 'var(--bg-primary)' : 'rgba(102, 126, 234, 0.05)', color: 'var(--text-primary)', resize: 'vertical', fontFamily: 'inherit' }}
                            />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ padding: '16px 20px', background: 'rgba(102, 126, 234, 0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Industry</div>
                              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>Your primary industry</div>
                              <select 
                                value={companyForm.industry}
                                onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                                disabled={!user?.company}
                                style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '14px', background: user?.company ? 'var(--bg-primary)' : 'rgba(102, 126, 234, 0.05)', color: 'var(--text-primary)', cursor: 'pointer' }}
                              >
                                <option value="">Select industry</option>
                                <option value="Technology">Technology</option>
                                <option value="E-commerce">E-commerce</option>
                                <option value="Finance">Finance</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Education">Education</option>
                                <option value="Media & Entertainment">Media & Entertainment</option>
                                <option value="Fashion & Beauty">Fashion & Beauty</option>
                                <option value="Food & Beverage">Food & Beverage</option>
                                <option value="Travel & Hospitality">Travel & Hospitality</option>
                                <option value="Real Estate">Real Estate</option>
                                <option value="Automotive">Automotive</option>
                                <option value="Sports & Fitness">Sports & Fitness</option>
                                <option value="SaaS">SaaS</option>
                                <option value="Consumer Goods">Consumer Goods</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div style={{ padding: '16px 20px', background: 'rgba(102, 126, 234, 0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Industry Type</div>
                              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>B2B, B2C, or D2C</div>
                              <select 
                                value={companyForm.industryType}
                                onChange={(e) => setCompanyForm({ ...companyForm, industryType: e.target.value })}
                                disabled={!user?.company}
                                style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '14px', background: user?.company ? 'var(--bg-primary)' : 'rgba(102, 126, 234, 0.05)', color: 'var(--text-primary)', cursor: 'pointer' }}
                              >
                                <option value="">Select type</option>
                                <option value="B2B">B2B (Business to Business)</option>
                                <option value="B2C">B2C (Business to Consumer)</option>
                                <option value="D2C">D2C (Direct to Consumer)</option>
                                <option value="B2B2C">B2B2C (Hybrid)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Company Details Section */}
                      <div style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                          <i className="fa-solid fa-chart-line" style={{ color: '#22c55e' }}></i>
                          <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Company Details</h4>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div style={{ padding: '16px 20px', background: 'rgba(102, 126, 234, 0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Location</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>Headquarters location</div>
                            <input 
                              type="text"
                              value={companyForm.location}
                              onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                              placeholder="e.g., San Francisco, CA"
                              disabled={!user?.company}
                              style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '14px', background: user?.company ? 'var(--bg-primary)' : 'rgba(102, 126, 234, 0.05)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div style={{ padding: '16px 20px', background: 'rgba(102, 126, 234, 0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Founded Year</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>Year company was founded</div>
                            <input 
                              type="number"
                              value={companyForm.founded_year}
                              onChange={(e) => setCompanyForm({ ...companyForm, founded_year: e.target.value })}
                              placeholder="e.g., 2020"
                              disabled={!user?.company}
                              min="1900"
                              max={new Date().getFullYear()}
                              style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '14px', background: user?.company ? 'var(--bg-primary)' : 'rgba(102, 126, 234, 0.05)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div style={{ padding: '16px 20px', background: 'rgba(102, 126, 234, 0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Employee Range</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>Company size</div>
                            <select 
                              value={companyForm.employee_range}
                              onChange={(e) => setCompanyForm({ ...companyForm, employee_range: e.target.value })}
                              disabled={!user?.company}
                              style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '14px', background: user?.company ? 'var(--bg-primary)' : 'rgba(102, 126, 234, 0.05)', color: 'var(--text-primary)', cursor: 'pointer' }}
                            >
                              <option value="">Select range</option>
                              <option value="1-10">1-10 employees</option>
                              <option value="11-50">11-50 employees</option>
                              <option value="51-200">51-200 employees</option>
                              <option value="201-500">201-500 employees</option>
                              <option value="501-1000">501-1000 employees</option>
                              <option value="1001-5000">1001-5000 employees</option>
                              <option value="5000+">5000+ employees</option>
                            </select>
                          </div>
                          <div style={{ padding: '16px 20px', background: 'rgba(102, 126, 234, 0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Revenue Range</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>Annual revenue</div>
                            <select 
                              value={companyForm.revenue_range}
                              onChange={(e) => setCompanyForm({ ...companyForm, revenue_range: e.target.value })}
                              disabled={!user?.company}
                              style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '14px', background: user?.company ? 'var(--bg-primary)' : 'rgba(102, 126, 234, 0.05)', color: 'var(--text-primary)', cursor: 'pointer' }}
                            >
                              <option value="">Select range</option>
                              <option value="Pre-revenue">Pre-revenue</option>
                              <option value="₹0-₹80L">₹0 - ₹80 Lakhs</option>
                              <option value="₹80L-₹8Cr">₹80 Lakhs - ₹8 Crore</option>
                              <option value="₹8Cr-₹40Cr">₹8 Crore - ₹40 Crore</option>
                              <option value="₹40Cr-₹80Cr">₹40 Crore - ₹80 Crore</option>
                              <option value="₹80Cr-₹400Cr">₹80 Crore - ₹400 Crore</option>
                              <option value="₹400Cr+">₹400 Crore+</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Online Presence Section */}
                      <div style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                          <i className="fa-solid fa-globe" style={{ color: '#ec4899' }}></i>
                          <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Online Presence</h4>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(102, 126, 234, 0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <i className="fa-solid fa-globe"></i>
                              </div>
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>Website</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Your company website URL</div>
                              </div>
                            </div>
                            <input 
                              type="url"
                              value={companyForm.website}
                              onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                              placeholder="https://example.com"
                              disabled={!user?.company}
                              style={{ width: '280px', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '14px', background: user?.company ? 'var(--bg-primary)' : 'rgba(102, 126, 234, 0.05)', color: 'var(--text-primary)' }}
                            />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(102, 126, 234, 0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #0077b5 0%, #00a0dc 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <i className="fa-brands fa-linkedin-in"></i>
                              </div>
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>LinkedIn</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Company LinkedIn page</div>
                              </div>
                            </div>
                            <input 
                              type="url"
                              value={companyForm.linkedin_url}
                              onChange={(e) => setCompanyForm({ ...companyForm, linkedin_url: e.target.value })}
                              placeholder="https://linkedin.com/company/..."
                              disabled={!user?.company}
                              style={{ width: '280px', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '14px', background: user?.company ? 'var(--bg-primary)' : 'rgba(102, 126, 234, 0.05)', color: 'var(--text-primary)' }}
                            />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(102, 126, 234, 0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #1da1f2 0%, #0d8ed9 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <i className="fa-brands fa-x-twitter"></i>
                              </div>
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>Twitter / X</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Company Twitter profile</div>
                              </div>
                            </div>
                            <input 
                              type="url"
                              value={companyForm.twitter_url}
                              onChange={(e) => setCompanyForm({ ...companyForm, twitter_url: e.target.value })}
                              placeholder="https://twitter.com/..."
                              disabled={!user?.company}
                              style={{ width: '280px', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '14px', background: user?.company ? 'var(--bg-primary)' : 'rgba(102, 126, 234, 0.05)', color: 'var(--text-primary)' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Save Button */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          {companyExists ? (
                            <span><i className="fa-solid fa-check-circle" style={{ color: '#22c55e', marginRight: '6px' }}></i>Company profile exists</span>
                          ) : user?.company ? (
                            <span><i className="fa-solid fa-info-circle" style={{ color: '#667eea', marginRight: '6px' }}></i>Save to create company profile</span>
                          ) : null}
                        </div>
                        <button 
                          className="yc-btn-primary" 
                          onClick={handleSaveCompany} 
                          disabled={isCompanySaving || !user?.company}
                          style={{ opacity: !user?.company ? 0.5 : 1 }}
                        >
                          {isCompanySaving ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</> : <><i className="fa-solid fa-save"></i> Save Company Info</>}
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}

              {activeTab === 'notifications' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px' }}>
                      <i className="fa-solid fa-bell"></i>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Notification Preferences</h3>
                    {notificationsSaving && (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '6px' }}></i>Saving...
                      </span>
                    )}
                  </div>
                  {notificationMessage && (
                    <div style={{ padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', background: notificationMessage.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: notificationMessage.type === 'success' ? '#22c55e' : '#ef4444' }}>
                      <i className={`fa-solid ${notificationMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                      {notificationMessage.text}
                    </div>
                  )}
                  {notificationsLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', color: 'var(--text-muted)' }}></i>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                        { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
                        { key: 'sms', label: 'SMS Notifications', desc: 'Get text message alerts' },
                        { key: 'weekly', label: 'Weekly Digest', desc: 'Summary of weekly activity' },
                      ].map((item) => (
                        <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(102, 126, 234, 0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{item.label}</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.desc}</div>
                          </div>
                          <div 
                            onClick={() => !notificationsSaving && handleNotificationToggle(item.key as keyof typeof notifications)}
                            style={{ width: '48px', height: '26px', background: notifications[item.key as keyof typeof notifications] ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(102, 126, 234, 0.2)', borderRadius: '26px', position: 'relative', cursor: notificationsSaving ? 'not-allowed' : 'pointer', transition: '0.3s', opacity: notificationsSaving ? 0.6 : 1 }}
                          >
                            <div style={{ position: 'absolute', width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', top: '3px', left: notifications[item.key as keyof typeof notifications] ? '25px' : '3px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)', transition: '0.3s' }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'security' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #22c55e 0%, #00f5ff 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px' }}>
                      <i className="fa-solid fa-shield"></i>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Security Settings</h3>
                  </div>
                  {passwordMessage && (
                    <div style={{ padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', background: passwordMessage.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: passwordMessage.type === 'success' ? '#22c55e' : '#ef4444' }}>
                      <i className={`fa-solid ${passwordMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                      {passwordMessage.text}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    {[
                      { label: 'Current Password', desc: 'Enter your existing password', field: 'currentPassword' },
                      { label: 'New Password', desc: 'Minimum 8 characters', field: 'newPassword' },
                      { label: 'Confirm New Password', desc: 'Re-enter to confirm', field: 'confirmPassword' },
                    ].map((item) => (
                      <div key={item.field} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(102, 126, 234, 0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{item.label}</div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.desc}</div>
                        </div>
                        <input
                          type="password"
                          value={passwordForm[item.field as keyof typeof passwordForm]}
                          onChange={(e) => setPasswordForm({ ...passwordForm, [item.field]: e.target.value })}
                          placeholder="••••••••"
                          style={{ width: '260px', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '14px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
                    <button className="yc-btn-primary" onClick={handleChangePassword} disabled={isPasswordSaving}>
                      {isPasswordSaving ? <><i className="fa-solid fa-spinner fa-spin"></i> Updating...</> : <><i className="fa-solid fa-lock"></i> Update Password</>}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                    <i className="fa-solid fa-mobile" style={{ fontSize: '16px', color: '#667eea' }}></i>
                    <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Active Sessions</h4>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    {sessionsLoading ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-spinner fa-spin"></i> Loading sessions...
                      </div>
                    ) : sessions.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(102, 126, 234, 0.03)', borderRadius: '12px' }}>
                        <i className="fa-solid fa-laptop" style={{ fontSize: '24px', marginBottom: '12px', display: 'block' }}></i>
                        <div>No active sessions</div>
                      </div>
                    ) : (
                      sessions.map((session) => {
                        const { device, browser, os } = parseUserAgent(session.userAgent);
                        const deviceName = [browser, 'on', os].filter(Boolean).join(' ') || 'Unknown Device';
                        const isMobile = device === 'Mobile' || device === 'Tablet';
                        
                        return (
                        <div key={session.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: session.isCurrent ? 'rgba(34, 197, 94, 0.05)' : 'rgba(102, 126, 234, 0.03)', borderRadius: '12px', border: `1px solid ${session.isCurrent ? 'rgba(34, 197, 94, 0.2)' : 'var(--border-color)'}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '40px', height: '40px', background: session.isCurrent ? 'linear-gradient(135deg, #22c55e 0%, #00f5ff 100%)' : 'rgba(102, 126, 234, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: session.isCurrent ? 'white' : '#667eea' }}>
                              <i className={isMobile ? 'fa-solid fa-mobile-screen' : 'fa-solid fa-laptop'}></i>
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{deviceName}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{session.isCurrent ? 'This device · ' : ''}Last active {new Date(session.lastActive).toLocaleString()}</div>
                            </div>
                          </div>
                          {!session.isCurrent ? (
                            <button className="yc-btn-secondary" style={{ padding: '8px 14px', fontSize: '12px' }} onClick={() => handleRevokeSession(session.id)}>
                              <i className="fa-solid fa-right-from-bracket"></i> Sign out
                            </button>
                          ) : (
                            <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>Current</span>
                          )}
                        </div>
                        );
                      })
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(102, 126, 234, 0.03)', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Sign out of other sessions</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Keep this device signed in, log out everywhere else.</div>
                    </div>
                    <button className="yc-btn-secondary" onClick={handleRevokeOthers} disabled={sessionsLoading || sessions.filter(s => !s.isCurrent).length === 0}>
                      <i className="fa-solid fa-door-open"></i> Sign out others
                    </button>
                  </div>

                  {twoFaMessage && (
                    <div style={{ padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', background: twoFaMessage.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: twoFaMessage.type === 'success' ? '#22c55e' : '#ef4444' }}>
                      <i className={`fa-solid ${twoFaMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                      {twoFaMessage.text}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: twoFactorEnabled ? 'rgba(34, 197, 94, 0.05)' : 'rgba(102, 126, 234, 0.03)', borderRadius: '12px', border: `1px solid ${twoFactorEnabled ? 'rgba(34, 197, 94, 0.2)' : 'var(--border-color)'}` }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Two-Factor Authentication</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {twoFactorEnabled ? 'Currently enabled. Verification codes will be emailed when you log in.' : 'Add extra security to your account'}
                      </div>
                    </div>
                    <button className={twoFactorEnabled ? 'yc-btn-secondary' : 'yc-btn-primary'} onClick={handleToggleTwoFactor} disabled={isTwoFaSaving}>
                      {isTwoFaSaving ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</> : <><i className={`fa-solid ${twoFactorEnabled ? 'fa-toggle-off' : 'fa-shield-heart'}`}></i> {twoFactorEnabled ? 'Disable' : 'Enable'}</>}
                    </button>
                  </div>
                </>
              )}

              {activeTab === 'billing' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px' }}>
                      <i className="fa-solid fa-credit-card"></i>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Billing & Plans</h3>
                  </div>
                  
                  {/* Current Plan Display */}
                  <div style={{ marginBottom: '32px' }}>
                    {plansLoading ? (
                      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(102, 126, 234, 0.03)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '12px' }}></i>
                        <span style={{ display: 'block' }}>Loading plan...</span>
                      </div>
                    ) : (() => {
                      const currentPlanData = plans.find(p => p.id === currentPlan);
                      return currentPlanData ? (
                        <div style={{ 
                          padding: '28px', 
                          borderRadius: '20px', 
                          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                          border: '2px solid #22c55e',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{currentPlanData.name}</h3>
                                <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>Current Plan</span>
                              </div>
                              <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
                                {currentPlanData.id === 'starter' ? 'For D2C brands & small teams' : currentPlanData.id === 'growth' ? 'For agencies & mid-size brands' : 'For large brands & agencies'}
                              </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              {currentPlanData.period === 'custom' ? (
                                <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>Custom</span>
                              ) : (
                                <>
                                  <span style={{ fontSize: '32px', fontWeight: 800, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>₹{currentPlanData.price.toLocaleString()}</span>
                                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/mo</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '24px' }}>
                            {currentPlanData.features.slice(0, 6).map((feature, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                <i className="fa-solid fa-check" style={{ color: '#22c55e', fontSize: '11px' }}></i>
                                {feature}
                              </div>
                            ))}
                          </div>

                          <button 
                            onClick={() => setShowPlanModal(true)}
                            style={{ 
                              padding: '12px 24px', borderRadius: '12px', border: 'none', 
                              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                          >
                            <i className="fa-solid fa-arrows-rotate"></i> Change Plan
                          </button>
                        </div>
                      ) : (
                        <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(102, 126, 234, 0.03)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 16px' }}>No active plan found</p>
                          <button 
                            onClick={() => setShowPlanModal(true)}
                            style={{ 
                              padding: '12px 24px', borderRadius: '12px', border: 'none', 
                              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto'
                            }}
                          >
                            <i className="fa-solid fa-plus"></i> Choose a Plan
                          </button>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Payment Methods */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <i className="fa-solid fa-wallet" style={{ color: '#667eea' }}></i>
                    <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Payment Methods</h4>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                    {savedCards.map((card) => (
                      <div key={card.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: card.isDefault ? 'rgba(34, 197, 94, 0.05)' : 'rgba(102, 126, 234, 0.03)', borderRadius: '12px', border: `1px solid ${card.isDefault ? 'rgba(34, 197, 94, 0.2)' : 'var(--border-color)'}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '48px', height: '32px', background: 'var(--bg-primary)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                            <i className={`fa-brands ${getCardIcon(card.type)}`} style={{ fontSize: '20px', color: '#667eea' }}></i>
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>•••• •••• •••• {card.last4}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{card.holderName} · Expires {card.expiry}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {card.isDefault && <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>Default</span>}
                          {!card.isDefault && (
                            <button onClick={() => handleSetDefaultCard(card.id)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(102, 126, 234, 0.1)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '8px', color: '#667eea', cursor: 'pointer' }} title="Set as default">
                              <i className="fa-solid fa-star"></i>
                            </button>
                          )}
                          <button onClick={() => handleDeleteCard(card.id)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }} title="Remove card">
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}

                    {!showAddCard ? (
                      <button onClick={() => setShowAddCard(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', background: 'transparent', border: '2px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', fontWeight: 500, transition: '0.2s' }}>
                        <i className="fa-solid fa-plus"></i> Add New Card
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
                          <i className="fa-solid fa-shield-halved"></i>
                          Your card details are encrypted and secured with 256-bit SSL
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Billing History */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <i className="fa-solid fa-receipt" style={{ color: '#667eea' }}></i>
                    <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Billing History</h4>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {invoicesLoading ? (
                      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(102, 126, 234, 0.03)', borderRadius: '12px' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ marginBottom: '8px', display: 'block' }}></i>
                        <span>Loading billing history...</span>
                      </div>
                    ) : invoices.length === 0 ? (
                      <div style={{ padding: '32px', textAlign: 'center', background: 'rgba(102, 126, 234, 0.03)', borderRadius: '12px' }}>
                        <i className="fa-solid fa-receipt" style={{ fontSize: '32px', color: 'var(--text-muted)', opacity: 0.5, marginBottom: '12px', display: 'block' }}></i>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>No payment history yet</p>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Your invoices will appear here after your first payment</span>
                      </div>
                    ) : (
                      invoices.map((invoice) => (
                        <div key={invoice.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(102, 126, 234, 0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                              <i className="fa-solid fa-file-invoice"></i>
                            </div>
                            <div>
                              <span style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{invoice.planName} Plan - {invoice.invoiceNumber}</span>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(invoice.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>₹{invoice.amount.toLocaleString('en-IN')}</span>
                            <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, background: invoice.status === 'paid' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: invoice.status === 'paid' ? '#22c55e' : '#f59e0b' }}>{invoice.status === 'paid' ? 'Paid' : invoice.status}</span>
                            <button 
                              className="yc-btn-secondary" style={{ padding: '8px 12px', fontSize: '12px' }}
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
                              <i className="fa-solid fa-download"></i> Download
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Plan Selection Modal - YC Style */}
          {showPlanModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setShowPlanModal(false)}>
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '24px', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflow: 'auto', border: '1px solid var(--border-color)' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px', borderBottom: '1px solid var(--border-color)' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Choose Your Plan</h2>
                  <button onClick={() => setShowPlanModal(false)} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(102, 126, 234, 0.1)', border: 'none', borderRadius: '10px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <i className="fa-solid fa-times"></i>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', padding: '32px' }}>
                  {plansLoading ? (
                    <div style={{ gridColumn: 'span 3', padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '12px' }}></i>
                      <span style={{ display: 'block' }}>Loading plans...</span>
                    </div>
                  ) : plans.length === 0 ? (
                    <div style={{ gridColumn: 'span 3', padding: '60px', textAlign: 'center' }}>No plans available</div>
                  ) : plans.map((plan) => (
                    <div 
                      key={plan.id} 
                      style={{ 
                        position: 'relative', padding: '28px', borderRadius: '20px', 
                        background: plan.popular ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)' : 'rgba(102, 126, 234, 0.03)',
                        border: `2px solid ${currentPlan === plan.id ? '#22c55e' : plan.popular ? 'rgba(102, 126, 234, 0.3)' : 'var(--border-color)'}`,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {plan.popular && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>Most Popular</div>}
                      {currentPlan === plan.id && <div style={{ position: 'absolute', top: '-12px', right: '16px', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>Current</div>}
                      
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>{plan.name}</h3>
                      <div style={{ marginBottom: '20px' }}>
                        {plan.period === 'custom' ? (
                          <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>Custom</span>
                        ) : (
                          <>
                            <span style={{ fontSize: '28px', fontWeight: 800, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>₹{plan.price.toLocaleString()}</span>
                            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/mo</span>
                          </>
                        )}
                      </div>
                      
                      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {plan.features.map((feature, i) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                            <i className="fa-solid fa-check" style={{ color: '#22c55e', marginTop: '3px', fontSize: '11px' }}></i>
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <button 
                        onClick={() => handleUpgrade(plan)}
                        disabled={currentPlan === plan.id || isProcessing || (!razorpayLoaded && plan.price > 0 && plan.period !== 'custom')}
                        style={{ 
                          width: '100%', padding: '12px', borderRadius: '12px', border: 'none', 
                          fontSize: '14px', fontWeight: 600, cursor: currentPlan === plan.id ? 'not-allowed' : 'pointer',
                          background: currentPlan === plan.id ? 'rgba(34, 197, 94, 0.15)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: currentPlan === plan.id ? '#22c55e' : 'white',
                          opacity: (isProcessing || (!razorpayLoaded && plan.price > 0 && plan.period !== 'custom')) && currentPlan !== plan.id ? 0.7 : 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                      >
                        {isProcessing && selectedPlan?.id === plan.id ? (
                          <><i className="fa-solid fa-spinner fa-spin"></i> Processing...</>
                        ) : !razorpayLoaded && plan.price > 0 && plan.period !== 'custom' ? (
                          <><i className="fa-solid fa-spinner fa-spin"></i> Loading...</>
                        ) : currentPlan === plan.id ? (
                          'Current Plan'
                        ) : plan.period === 'custom' ? (
                          <><i className="fa-solid fa-envelope"></i> Contact Sales</>
                        ) : (() => {
                          const currentPlanOrder = plans.find(p => p.id === currentPlan)?.order || 0;
                          const thisPlanOrder = plan.order || 0;
                          const isDowngrade = thisPlanOrder < currentPlanOrder;
                          return (
                            <><i className={`fa-solid fa-arrow-${isDowngrade ? 'down' : 'right'}`}></i> {isDowngrade ? 'Downgrade' : 'Upgrade Now'}</>
                          );
                        })()}
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '20px 32px', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <span>Secure payments powered by</span>
                  <img src="https://cdn.razorpay.com/logo.svg" alt="Razorpay" height="20" />
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
