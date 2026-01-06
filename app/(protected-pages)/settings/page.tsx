"use client";

import { Sidebar } from '@/components/common/Sidebar';
import { TopBar } from '@/components/common/TopBar';
import { useAuth } from '@/contexts/auth-context';
import { useState } from 'react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    weekly: true,
  });

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
                    <div className="setting-item">
                      <div className="setting-label">
                        <div className="setting-title">Full Name</div>
                        <div className="setting-description">Your display name</div>
                      </div>
                      <input type="text" className="form-input" defaultValue={user?.name || ''} style={{ width: '250px' }} />
                    </div>
                    <div className="setting-item">
                      <div className="setting-label">
                        <div className="setting-title">Email Address</div>
                        <div className="setting-description">Your primary email</div>
                      </div>
                      <input type="email" className="form-input" defaultValue={user?.email || ''} style={{ width: '250px' }} />
                    </div>
                    <div className="setting-item">
                      <div className="setting-label">
                        <div className="setting-title">Company</div>
                        <div className="setting-description">Your organization</div>
                      </div>
                      <input type="text" className="form-input" defaultValue={user?.company || ''} style={{ width: '250px' }} />
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
                  <div className="setting-item">
                    <div className="setting-label">
                      <div className="setting-title">Change Password</div>
                      <div className="setting-description">Update your password</div>
                    </div>
                    <button className="btn btn-secondary">Change</button>
                  </div>
                  <div className="setting-item">
                    <div className="setting-label">
                      <div className="setting-title">Two-Factor Authentication</div>
                      <div className="setting-description">Add extra security to your account</div>
                    </div>
                    <button className="btn btn-primary">Enable</button>
                  </div>
                  <div className="setting-item">
                    <div className="setting-label">
                      <div className="setting-title">Active Sessions</div>
                      <div className="setting-description">Manage logged in devices</div>
                    </div>
                    <button className="btn btn-secondary">View All</button>
                  </div>
                </>
              )}

              {activeTab === 'billing' && (
                <>
                  <div className="section-title">
                    <i className="fa-solid fa-credit-card"></i>
                    Billing & Plans
                  </div>
                  <div className="setting-item">
                    <div className="setting-label">
                      <div className="setting-title">Current Plan</div>
                      <div className="setting-description">Pro Plan - $49/month</div>
                    </div>
                    <button className="btn btn-primary">Upgrade</button>
                  </div>
                  <div className="setting-item">
                    <div className="setting-label">
                      <div className="setting-title">Payment Method</div>
                      <div className="setting-description">Visa ending in 4242</div>
                    </div>
                    <button className="btn btn-secondary">Update</button>
                  </div>
                  <div className="setting-item">
                    <div className="setting-label">
                      <div className="setting-title">Billing History</div>
                      <div className="setting-description">View past invoices</div>
                    </div>
                    <button className="btn btn-secondary">View</button>
                  </div>
                </>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
  );
}
