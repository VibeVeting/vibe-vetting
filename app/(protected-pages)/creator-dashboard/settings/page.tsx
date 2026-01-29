"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../creator-dashboard.css';

const niches = [
  "Beauty", "Fashion", "Food", "Fitness", "Tech", 
  "Travel", "Lifestyle", "Gaming", "Education", "Other"
];

const followerRanges = [
  "1K - 5K", "5K - 10K", "10K - 25K", "25K - 50K", "50K+"
];

const socialPlatforms = [
  { id: 'instagram', name: 'Instagram', icon: 'fa-instagram', color: '#E4405F' },
  { id: 'youtube', name: 'YouTube', icon: 'fa-youtube', color: '#FF0000' },
  { id: 'twitter', name: 'X', icon: 'fa-x-twitter', color: '#000000' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'fa-linkedin', color: '#0A66C2' },
  { id: 'twitch', name: 'Twitch', icon: 'fa-twitch', color: '#9146FF' },
];

interface CreatorProfile {
  niche: string;
  followerCount: string;
  primaryPlatform: string;
  socialHandles: Record<string, string>;
  city?: string;
  whyBarter?: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  userType: string;
  creatorProfile?: CreatorProfile;
}

export default function CreatorSettings() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    niche: '',
    followerCount: '',
    primaryPlatform: '',
    city: '',
    instagram: '',
    youtube: '',
    twitter: '',
    linkedin: '',
    twitch: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login-barter');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.userType !== 'barter_creator') {
      router.push('/dashboard');
      return;
    }

    setUser(parsedUser);
    
    // Populate form data
    setFormData({
      name: parsedUser.name || '',
      niche: parsedUser.creatorProfile?.niche || '',
      followerCount: parsedUser.creatorProfile?.followerCount || '',
      primaryPlatform: parsedUser.creatorProfile?.primaryPlatform || '',
      city: parsedUser.creatorProfile?.city || '',
      instagram: parsedUser.creatorProfile?.socialHandles?.instagram || '',
      youtube: parsedUser.creatorProfile?.socialHandles?.youtube || '',
      twitter: parsedUser.creatorProfile?.socialHandles?.twitter || '',
      linkedin: parsedUser.creatorProfile?.socialHandles?.linkedin || '',
      twitch: parsedUser.creatorProfile?.socialHandles?.twitch || '',
    });
    
    setLoading(false);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login-barter');
      return;
    }

    try {
      const response = await fetch('/api/barter/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          creatorProfile: {
            niche: formData.niche,
            followerCount: formData.followerCount,
            primaryPlatform: formData.primaryPlatform,
            city: formData.city,
            socialHandles: {
              instagram: formData.instagram,
              youtube: formData.youtube,
              twitter: formData.twitter,
              linkedin: formData.linkedin,
              twitch: formData.twitch,
            },
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local storage
        const updatedUser = {
          ...user,
          name: formData.name,
          creatorProfile: {
            ...user?.creatorProfile,
            niche: formData.niche,
            followerCount: formData.followerCount,
            primaryPlatform: formData.primaryPlatform,
            city: formData.city,
            socialHandles: {
              instagram: formData.instagram,
              youtube: formData.youtube,
              twitter: formData.twitter,
              linkedin: formData.linkedin,
              twitch: formData.twitch,
            },
          },
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser as UserData);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="creator-settings-loading">
        <i className="fa-solid fa-spinner fa-spin"></i>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="creator-settings">
      <div className="settings-container">
        <div className="settings-header">
          <Link href="/creator-dashboard" className="back-link">
            <i className="fa-solid fa-arrow-left"></i>
            Back to Dashboard
          </Link>
          <h1>Edit Profile</h1>
          <p>Update your creator profile and social handles</p>
        </div>

        <form onSubmit={handleSubmit} className="settings-form">
          {error && (
            <div className="alert alert-error">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <i className="fa-solid fa-check-circle"></i>
              Profile updated successfully!
            </div>
          )}

          {/* Basic Info */}
          <div className="settings-section">
            <h2><i className="fa-solid fa-user"></i> Basic Information</h2>
            
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your full name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={user.email}
                disabled
              />
              <p className="form-hint">Email cannot be changed</p>
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-input"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Mumbai, Delhi, Bangalore..."
              />
            </div>
          </div>

          {/* Creator Info */}
          <div className="settings-section">
            <h2><i className="fa-solid fa-star"></i> Creator Information</h2>
            
            <div className="form-group">
              <label className="form-label">Content Niche</label>
              <div className="niche-grid">
                {niches.map((niche) => (
                  <button
                    key={niche}
                    type="button"
                    className={`niche-btn ${formData.niche === niche ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, niche })}
                  >
                    {niche}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Follower Count (Primary Platform)</label>
              <div className="follower-options">
                {followerRanges.map((range) => (
                  <button
                    key={range}
                    type="button"
                    className={`follower-btn ${formData.followerCount === range ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, followerCount: range })}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Social Handles */}
          <div className="settings-section">
            <h2><i className="fa-solid fa-share-nodes"></i> Social Media Handles</h2>
            
            <div className="social-handles-form">
              {socialPlatforms.map((platform) => (
                <div key={platform.id} className="social-input-group">
                  <div className="social-input-header">
                    <i className={`fa-brands ${platform.icon}`} style={{ color: platform.color }}></i>
                    <span>{platform.name}</span>
                    {formData.primaryPlatform === platform.id && (
                      <span className="primary-badge">Primary</span>
                    )}
                  </div>
                  <div className="social-input-row">
                    <input
                      type="text"
                      className="form-input"
                      value={formData[platform.id as keyof typeof formData] || ''}
                      onChange={(e) => setFormData({ ...formData, [platform.id]: e.target.value })}
                      placeholder={`@yourhandle`}
                    />
                    <button
                      type="button"
                      className={`set-primary-btn ${formData.primaryPlatform === platform.id ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, primaryPlatform: platform.id })}
                      disabled={!formData[platform.id as keyof typeof formData]}
                    >
                      {formData.primaryPlatform === platform.id ? 'Primary' : 'Set as Primary'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="settings-actions">
            <Link href="/creator-dashboard" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check"></i>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
