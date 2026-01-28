"use client";

import Link from 'next/link';
import { useState } from 'react';

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
];

const companySizes = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
];

const interests = [
  { id: 'creator-discovery', label: 'Creator Discovery & Matching' },
  { id: 'brand-safety', label: 'Brand Safety & Risk Assessment' },
  { id: 'campaign-management', label: 'Campaign Management' },
  { id: 'analytics', label: 'Analytics & Reporting' },
  { id: 'api-integration', label: 'API Integration' },
  { id: 'enterprise', label: 'Enterprise Solutions' },
];

export default function BookDemoPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    companySize: '',
    jobTitle: '',
    interests: [] as string[],
    preferredDate: '',
    preferredTime: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInterestToggle = (interestId: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(i => i !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [calendarLinks, setCalendarLinks] = useState<{
    googleCalendarLink: string;
    icsContent: string;
  } | null>(null);

  // Email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Phone validation (optional but if provided, must be valid)
  const isValidPhone = (phone: string) => {
    if (!phone) return true;
    return /^[\d\s\-\+\(\)]{10,}$/.test(phone);
  };

  // Validate Step 1
  const validateStep1 = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!isValidPhone(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.company.trim()) {
      errors.company = 'Company name is required';
    } else if (formData.company.trim().length < 2) {
      errors.company = 'Company name must be at least 2 characters';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate Step 2
  const validateStep2 = () => {
    const errors: {[key: string]: string} = {};
    
    if (formData.interests.length === 0) {
      errors.interests = 'Please select at least one interest';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/book-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book demo');
      }

      console.log('Demo booked successfully:', data);
      
      // Store calendar links
      if (data.calendar) {
        setCalendarLinks(data.calendar);
      }
      
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error booking demo:', err);
      setError(err instanceof Error ? err.message : 'Failed to book demo. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadICS = () => {
    if (!calendarLinks?.icsContent) return;
    
    const icsData = atob(calendarLinks.icsContent);
    const blob = new Blob([icsData], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibevetting-demo-${formData.preferredDate}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const openGoogleCalendar = () => {
    if (!calendarLinks?.googleCalendarLink) return;
    window.open(calendarLinks.googleCalendarLink, '_blank');
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) {
      return;
    }
    if (currentStep === 2 && !validateStep2()) {
      return;
    }
    setFieldErrors({});
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setFieldErrors({});
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStep1Valid = formData.firstName && formData.lastName && formData.email && formData.company;
  const isStep2Valid = formData.interests.length > 0;
  const isStep3Valid = formData.preferredDate && formData.preferredTime;

  // Generate next 30 days for date selection
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Skip weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        });
      }
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  if (isSubmitted) {
    return (
      <div className="book-demo-page">
        <div className="demo-success-container">
          <div className="success-card glass">
            <div className="success-icon">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <h1>Demo Booked Successfully!</h1>
            <p className="success-message">
              Thank you, {formData.firstName}! Your demo has been scheduled for{' '}
              <strong>{new Date(formData.preferredDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong> at{' '}
              <strong>{formData.preferredTime}</strong>.
            </p>
            
            {/* Add to Calendar Section */}
            <div className="add-to-calendar-section">
              <h3>Add to Your Calendar</h3>
              <div className="calendar-buttons">
                <button onClick={openGoogleCalendar} className="calendar-btn google">
                  <i className="fa-brands fa-google"></i>
                  Google Calendar
                </button>
                <button onClick={downloadICS} className="calendar-btn ics">
                  <i className="fa-solid fa-calendar-plus"></i>
                  Download .ics
                </button>
              </div>
            </div>
            
            <div className="confirmation-details">
              <div className="detail-item">
                <i className="fa-solid fa-user"></i>
                <span>Attendee: <strong>{formData.email}</strong></span>
              </div>
              <div className="detail-item">
                <i className="fa-solid fa-building"></i>
                <span>Company: <strong>{formData.company}</strong></span>
              </div>
              <div className="detail-item">
                <i className="fa-solid fa-video"></i>
                <span>Meeting link will be shared before the demo</span>
              </div>
            </div>
            <div className="success-actions">
              <Link href="/" className="btn-primary-glow">
                <i className="fa-solid fa-rocket"></i>
                Explore VibeVetting
              </Link>
            </div>
          </div>
        </div>

        <style jsx>{`
          .book-demo-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%);
            padding: 60px 20px;
          }
          .demo-success-container {
            max-width: 600px;
            margin: 0 auto;
            padding-top: 60px;
          }
          .success-card {
            background: rgba(20, 20, 35, 0.9);
            border-radius: 24px;
            padding: 60px 40px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .success-icon {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: linear-gradient(135deg, #22c55e 0%, #10b981 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 30px;
            font-size: 48px;
            color: white;
          }
          .success-card h1 {
            font-size: 32px;
            color: white;
            margin-bottom: 16px;
          }
          .success-message {
            color: rgba(255, 255, 255, 0.7);
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .success-message strong {
            color: #00f5ff;
          }
          .add-to-calendar-section {
            background: rgba(102, 126, 234, 0.1);
            border: 1px solid rgba(102, 126, 234, 0.3);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
          }
          .add-to-calendar-section h3 {
            color: white;
            font-size: 16px;
            margin-bottom: 16px;
          }
          .calendar-buttons {
            display: flex;
            gap: 12px;
            justify-content: center;
          }
          .calendar-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            border: none;
          }
          .calendar-btn.google {
            background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
            color: white;
          }
          .calendar-btn.google:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(66, 133, 244, 0.4);
          }
          .calendar-btn.ics {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .calendar-btn.ics:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-2px);
          }
          .confirmation-details {
            background: rgba(0, 245, 255, 0.05);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 30px;
          }
          .detail-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 0;
            color: rgba(255, 255, 255, 0.8);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }
          .detail-item:last-child {
            border-bottom: none;
          }
          .detail-item i {
            color: #00f5ff;
            width: 20px;
          }
          .success-actions {
            display: flex;
            gap: 16px;
            justify-content: center;
          }
          .btn-primary-glow, .btn-secondary-glass {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 14px 28px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 14px;
            text-decoration: none;
            transition: all 0.3s ease;
          }
          .btn-primary-glow {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .btn-primary-glow:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
          }
          .btn-secondary-glass {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .btn-secondary-glass:hover {
            background: rgba(255, 255, 255, 0.15);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="book-demo-page">
      {/* Header */}

      <div className="demo-container">
        {/* Left Side - Info */}
        <div className="demo-info">
          <div className="info-badge">
            <i className="fa-solid fa-calendar-check"></i>
            Schedule Your Demo
          </div>
          <h1>See vibeAI™ in Action</h1>
          <p className="info-desc">
            Get a personalized walkthrough of our AI-powered creator intelligence platform. 
            Our team will show you how to find perfect brand-aligned creators in minutes.
          </p>

          <div className="demo-benefits">
            <div className="benefit-item">
              <div className="benefit-icon">
                <i className="fa-solid fa-clock"></i>
              </div>
              <div className="benefit-content">
                <h4>30-Minute Session</h4>
                <p>Quick, focused demo tailored to your needs</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <i className="fa-solid fa-user-tie"></i>
              </div>
              <div className="benefit-content">
                <h4>Expert Guidance</h4>
                <p>Work with our product specialists</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <i className="fa-solid fa-gift"></i>
              </div>
              <div className="benefit-content">
                <h4>Exclusive Offer</h4>
                <p>Demo attendees get extended trial access</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <i className="fa-solid fa-question-circle"></i>
              </div>
              <div className="benefit-content">
                <h4>Q&A Session</h4>
                <p>Get all your questions answered live</p>
              </div>
            </div>
          </div>

          <div className="trust-badges">
            <div className="trust-item">
              <i className="fa-solid fa-shield-halved"></i>
              <span>Secure & Private</span>
            </div>
            <div className="trust-item">
              <i className="fa-solid fa-credit-card"></i>
              <span>No Credit Card</span>
            </div>
            <div className="trust-item">
              <i className="fa-solid fa-ban"></i>
              <span>No Commitment</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="demo-form-container">
          <div className="form-card glass">
            {/* Progress Steps */}
            <div className="form-steps">
              <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                <div className="step-number">
                  {currentStep > 1 ? <i className="fa-solid fa-check"></i> : '1'}
                </div>
                <span>Your Info</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                <div className="step-number">
                  {currentStep > 2 ? <i className="fa-solid fa-check"></i> : '2'}
                </div>
                <span>Interests</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <span>Schedule</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Step 1: Contact Info */}
              {currentStep === 1 && (
                <div className="form-step-content">
                  <h2>Tell us about yourself</h2>
                  <p>We&apos;ll use this to personalize your demo experience.</p>

                  <div className="form-row">
                    <div className={`form-group ${fieldErrors.firstName ? 'has-error' : ''}`}>
                      <label>First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        className={fieldErrors.firstName ? 'error' : ''}
                      />
                      {fieldErrors.firstName && <span className="field-error">{fieldErrors.firstName}</span>}
                    </div>
                    <div className={`form-group ${fieldErrors.lastName ? 'has-error' : ''}`}>
                      <label>Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        className={fieldErrors.lastName ? 'error' : ''}
                      />
                      {fieldErrors.lastName && <span className="field-error">{fieldErrors.lastName}</span>}
                    </div>
                  </div>

                  <div className={`form-group ${fieldErrors.email ? 'has-error' : ''}`}>
                    <label>Work Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@company.com"
                      className={fieldErrors.email ? 'error' : ''}
                    />
                    {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
                  </div>

                  <div className={`form-group ${fieldErrors.phone ? 'has-error' : ''}`}>
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 000-0000"
                      className={fieldErrors.phone ? 'error' : ''}
                    />
                    {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
                  </div>

                  <div className="form-row">
                    <div className={`form-group ${fieldErrors.company ? 'has-error' : ''}`}>
                      <label>Company Name *</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Acme Inc."
                        className={fieldErrors.company ? 'error' : ''}
                      />
                      {fieldErrors.company && <span className="field-error">{fieldErrors.company}</span>}
                    </div>
                    <div className="form-group">
                      <label>Company Size</label>
                      <select
                        name="companySize"
                        value={formData.companySize}
                        onChange={handleInputChange}
                      >
                        <option value="">Select size</option>
                        {companySizes.map(size => (
                          <option key={size.value} value={size.value}>{size.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Job Title</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      placeholder="Marketing Manager"
                    />
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn-next"
                      onClick={nextStep}
                      disabled={!isStep1Valid}
                    >
                      Continue
                      <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Interests */}
              {currentStep === 2 && (
                <div className="form-step-content">
                  <h2>What interests you most?</h2>
                  <p>Select the features you&apos;d like to see in your demo.</p>

                  <div className={`interests-grid ${fieldErrors.interests ? 'has-error' : ''}`}>
                    {interests.map(interest => (
                      <div
                        key={interest.id}
                        className={`interest-card ${formData.interests.includes(interest.id) ? 'selected' : ''}`}
                        onClick={() => handleInterestToggle(interest.id)}
                      >
                        <div className="interest-check">
                          {formData.interests.includes(interest.id) && (
                            <i className="fa-solid fa-check"></i>
                          )}
                        </div>
                        <span>{interest.label}</span>
                      </div>
                    ))}
                  </div>
                  {fieldErrors.interests && <span className="field-error">{fieldErrors.interests}</span>}

                  <div className="form-group">
                    <label>Anything specific you&apos;d like to discuss?</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us about your use case, challenges, or questions..."
                      rows={4}
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-back" onClick={prevStep}>
                      <i className="fa-solid fa-arrow-left"></i>
                      Back
                    </button>
                    <button 
                      type="button" 
                      className="btn-next"
                      onClick={nextStep}
                      disabled={!isStep2Valid}
                    >
                      Continue
                      <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Schedule */}
              {currentStep === 3 && (
                <div className="form-step-content">
                  <h2>Pick a time that works</h2>
                  <p>All times are shown in your local timezone ({formData.timezone}).</p>

                  <div className="form-group">
                    <label>Select a Date *</label>
                    <div className="date-grid">
                      {availableDates.slice(0, 10).map(date => (
                        <div
                          key={date.value}
                          className={`date-card ${formData.preferredDate === date.value ? 'selected' : ''}`}
                          onClick={() => setFormData(prev => ({ ...prev, preferredDate: date.value }))}
                        >
                          {date.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Select a Time *</label>
                    <div className="time-grid">
                      {timeSlots.map(time => (
                        <div
                          key={time}
                          className={`time-card ${formData.preferredTime === time ? 'selected' : ''}`}
                          onClick={() => setFormData(prev => ({ ...prev, preferredTime: time }))}
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="error-message">
                      <i className="fa-solid fa-circle-exclamation"></i>
                      {error}
                    </div>
                  )}

                  <div className="form-actions">
                    <button type="button" className="btn-back" onClick={prevStep}>
                      <i className="fa-solid fa-arrow-left"></i>
                      Back
                    </button>
                    <button 
                      type="submit" 
                      className="btn-submit"
                      disabled={!isStep3Valid || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i>
                          Booking...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-calendar-check"></i>
                          Book My Demo
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .book-demo-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%);
          overflow-x: hidden;
        }

        .demo-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(10, 10, 15, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .header-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 16px 40px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }

        .logo {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 12px;
          text-decoration: none;
        }

        .logo-icon {
          width: 42px;
          height: 42px;
          min-width: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #00f5ff 0%, #a855f7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0a0a0f;
          font-size: 18px;
          box-shadow: 0 4px 20px rgba(0, 245, 255, 0.3);
        }

        .logo-text {
          font-size: 22px;
          font-weight: 700;
          display: inline-flex;
          gap: 0;
        }

        .logo-vibe {
          background: linear-gradient(135deg, #00f5ff 0%, #0099ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-vetting {
          background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @media (max-width: 600px) {
          .header-inner {
            padding: 14px 20px;
          }
          .logo-text {
            font-size: 18px;
          }
          .logo-icon {
            width: 36px;
            height: 36px;
            font-size: 16px;
          }
        }

        .demo-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
          padding-top: 0;
        }

        .demo-info {
          padding: 60px 40px 60px 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          color: white;
        }

        .info-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(102, 126, 234, 0.2);
          color: #a5b4fc;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 24px;
          width: fit-content;
        }

        .info-badge i {
          color: #667eea;
        }

        .demo-info h1 {
          font-size: 48px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 20px;
          line-height: 1.2;
        }

        .info-desc {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.7;
          margin-bottom: 40px;
        }

        .demo-benefits {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 40px;
        }

        .benefit-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .benefit-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(0, 245, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00f5ff;
          font-size: 20px;
          flex-shrink: 0;
        }

        .benefit-content h4 {
          color: white;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .benefit-content p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }

        .trust-badges {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }

        .trust-item i {
          color: #22c55e;
        }

        .demo-form-container {
          padding: 20px 60px 60px 40px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          background: rgba(0, 0, 0, 0.3);
        }

        .form-card {
          width: 100%;
          max-width: 520px;
          background: rgba(20, 20, 35, 0.95);
          border-radius: 24px;
          padding: 40px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
        }

        .form-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          margin-bottom: 40px;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.4);
          font-size: 13px;
          font-weight: 500;
        }

        .step.active {
          color: #00f5ff;
        }

        .step.completed {
          color: #22c55e;
        }

        .step-number {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          line-height: 1;
        }

        .step.active .step-number {
          background: linear-gradient(135deg, #00f5ff 0%, #0099ff 100%);
          color: #0a0a0f;
        }

        .step.completed .step-number {
          background: #22c55e;
          color: white;
        }

        .step-line {
          width: 50px;
          height: 2px;
          background: rgba(255, 255, 255, 0.15);
          margin: 0 8px;
          margin-bottom: 28px;
        }

        .form-step-content h2 {
          font-size: 24px;
          color: white;
          margin-bottom: 8px;
        }

        .form-step-content > p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          margin-bottom: 24px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          font-size: 15px;
          transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #00f5ff;
          background: rgba(0, 245, 255, 0.05);
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .form-group select {
          cursor: pointer;
        }

        .form-group select option {
          background: #1a1a2e;
          color: white;
        }

        .interests-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }

        .interest-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
        }

        .interest-card:hover {
          border-color: rgba(0, 245, 255, 0.3);
        }

        .interest-card.selected {
          background: rgba(0, 245, 255, 0.1);
          border-color: #00f5ff;
        }

        .interest-check {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          flex-shrink: 0;
        }

        .interest-card.selected .interest-check {
          background: #00f5ff;
          border-color: #00f5ff;
          color: #0a0a0f;
        }

        .date-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .date-card {
          padding: 18px 12px;
          background: rgba(25, 25, 40, 0.95);
          border: 2px solid rgba(100, 100, 140, 0.25);
          border-radius: 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: rgba(255, 255, 255, 0.9);
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .date-card:hover {
          border-color: rgba(0, 245, 255, 0.6);
          background: rgba(35, 35, 55, 0.95);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 245, 255, 0.2);
        }

        .date-card.selected {
          background: linear-gradient(135deg, #00f5ff 0%, #0099ff 100%);
          border-color: transparent;
          color: #0a0a0f;
          font-weight: 700;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 245, 255, 0.4);
        }

        .time-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
        }

        .time-card {
          padding: 16px 10px;
          background: rgba(25, 25, 40, 0.95);
          border: 2px solid rgba(100, 100, 140, 0.25);
          border-radius: 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: rgba(255, 255, 255, 0.9);
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .time-card:hover {
          border-color: rgba(139, 92, 246, 0.6);
          background: rgba(35, 35, 55, 0.95);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(139, 92, 246, 0.2);
        }

        .time-card.selected {
          background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
          border-color: transparent;
          color: white;
          font-weight: 700;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 32px;
        }

        .btn-back {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 24px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-back:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .btn-next,
        .btn-submit {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-next:hover:not(:disabled),
        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }

        .btn-next:disabled,
        .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .field-error {
          display: block;
          color: #f87171;
          font-size: 12px;
          margin-top: 6px;
          padding-left: 2px;
        }

        .form-group.has-error input,
        .form-group.has-error select,
        .form-group.has-error textarea {
          border-color: rgba(239, 68, 68, 0.5);
          background: rgba(239, 68, 68, 0.05);
        }

        input.error,
        select.error,
        textarea.error {
          border-color: rgba(239, 68, 68, 0.5) !important;
          background: rgba(239, 68, 68, 0.05) !important;
        }

        .interests-grid.has-error {
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 12px;
          background: rgba(239, 68, 68, 0.02);
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          color: #f87171;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .error-message i {
          font-size: 16px;
        }

        @media (max-width: 1024px) {
          .demo-container {
            grid-template-columns: 1fr;
          }

          .demo-container {
            padding-top: 80px;
          }

          .demo-info {
            padding: 40px 20px;
            order: 1;
          }

          .demo-form-container {
            order: 2;
          }

          .demo-info h1 {
            font-size: 36px;
          }

          .demo-form-container {
            padding: 20px;
          }

          .form-card {
            padding: 30px 20px;
          }
        }

        @media (max-width: 640px) {
          .demo-header {
            padding: 16px 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .interests-grid {
            grid-template-columns: 1fr;
          }

          .date-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .time-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .form-steps span {
            display: none;
          }

          .trust-badges {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}
