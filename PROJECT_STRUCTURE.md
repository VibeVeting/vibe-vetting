# VibeVetting Project Structure

## Overview
This document outlines the complete project structure for the VibeVetting influencer vetting platform.

## Directory Structure

```
vibe-vetting/
├── app/
│   ├── layout.tsx                          # Root layout with sidebar
│   ├── page.tsx                           # Redirects to /dashboard
│   │
│   ├── dashboard/
│   │   ├── page.tsx                       # Main dashboard (screen1.html)
│   │   └── components/
│   │       ├── StatsGrid.tsx              # 4 stat cards
│   │       ├── StatCard.tsx               # Individual stat card
│   │       ├── ChartSection.tsx           # Charts area
│   │       └── RecentAnalysesTable.tsx    # Creator analyses table
│   │
│   ├── campaigns/
│   │   ├── page.tsx                       # Campaigns list
│   │   ├── create/
│   │   │   └── page.tsx                   # Create campaign form (screen2.html)
│   │   ├── scanning/
│   │   │   └── page.tsx                   # AI scanning progress (screen3.html)
│   │   ├── matches/
│   │   │   └── page.tsx                   # Creator matches (screen4.html)
│   │   ├── add-creator/
│   │   │   └── page.tsx                   # Add creator to campaign (screen7.html)
│   │   └── components/
│   │       ├── CampaignForm.tsx           # Campaign creation form
│   │       ├── ScanningProgress.tsx       # AI scanning UI
│   │       ├── InfluencerCard.tsx         # Individual influencer card
│   │       ├── MatchFilters.tsx           # Filter controls
│   │       └── AddToCampaignForm.tsx      # Add to campaign form
│   │
│   ├── creators/
│   │   ├── page.tsx                       # Creators list
│   │   ├── [id]/
│   │   │   ├── page.tsx                   # Creator profile/report (screen5.html)
│   │   │   └── content-analysis/
│   │   │       └── page.tsx               # Content analysis (screen11.html)
│   │   └── components/
│   │       ├── CreatorHeader.tsx          # Creator profile header
│   │       ├── RecommendationBox.tsx      # Perfect match/recommendation
│   │       ├── BrandValuesMatch.tsx       # Values alignment section
│   │       ├── AudienceQuality.tsx        # Audience metrics
│   │       ├── ToneBehaviorScan.tsx       # Tone analysis
│   │       ├── HistoryRedFlags.tsx        # Red flags section
│   │       ├── RiskPrediction.tsx         # Future risk prediction
│   │       ├── ContentAuditGrid.tsx       # Content audit overview
│   │       ├── RiskAlert.tsx              # Risk alert cards
│   │       └── BrandProtection.tsx        # Brand protection section
│   │
│   ├── analytics/
│   │   ├── page.tsx                       # Analytics dashboard (screen6.html)
│   │   └── components/
│   │       ├── KPICards.tsx               # KPI metric cards
│   │       ├── ChartsGrid.tsx             # Charts layout
│   │       └── TopPerformersTable.tsx     # Top creators table
│   │
│   ├── investor-metrics/
│   │   ├── page.tsx                       # Investor metrics (screen9.html, screen10.html)
│   │   └── components/
│   │       ├── MetricsGrid.tsx            # Key metrics display
│   │       ├── RevenueCharts.tsx          # Revenue visualization
│   │       ├── FinancialCards.tsx         # Financial summary cards
│   │       ├── GrowthIndicators.tsx       # Growth metrics
│   │       ├── InvestmentHighlights.tsx   # Investment highlights
│   │       ├── ROISection.tsx             # ROI projections
│   │       └── CompetitiveAdvantages.tsx  # Competitive advantages
│   │
│   ├── settings/
│   │   ├── page.tsx                       # Settings page (screen8.html)
│   │   └── components/
│   │       ├── SettingsNav.tsx            # Settings navigation tabs
│   │       ├── AccountSettings.tsx        # Account section
│   │       ├── NotificationSettings.tsx   # Notifications section
│   │       ├── TeamSettings.tsx           # Team management
│   │       ├── SecuritySettings.tsx       # Security settings
│   │       ├── IntegrationsSettings.tsx   # Integrations
│   │       └── BillingSettings.tsx        # Billing section
│   │
│   └── api/
│       ├── test-db/
│       │   └── route.ts                   # DB connection test (existing)
│       ├── campaigns/
│       │   ├── route.ts                   # GET, POST campaigns
│       │   └── [id]/
│       │       └── route.ts               # GET, PUT, DELETE campaign
│       ├── creators/
│       │   ├── route.ts                   # GET, POST creators
│       │   ├── search/
│       │   │   └── route.ts               # Search creators
│       │   └── [id]/
│       │       ├── route.ts               # GET, PUT creator
│       │       └── analyze/
│       │           └── route.ts           # Trigger AI analysis
│       └── analytics/
│           └── route.ts                   # Analytics data
│
├── components/
│   ├── common/
│   │   ├── Sidebar.tsx                    # Global sidebar navigation
│   │   ├── TopBar.tsx                     # Top navigation bar
│   │   ├── SearchBox.tsx                  # Search input
│   │   ├── Button.tsx                     # Reusable button
│   │   ├── Card.tsx                       # Reusable card
│   │   ├── Badge.tsx                      # Status badges
│   │   ├── ProgressBar.tsx                # Progress indicators
│   │   ├── MetricCard.tsx                 # Metric display card
│   │   ├── TagsInput.tsx                  # Tags input component
│   │   └── Modal.tsx                      # Modal dialog
│   │
│   ├── dashboard/
│   │   └── (dashboard-specific shared components)
│   │
│   ├── campaigns/
│   │   └── (campaigns-specific shared components)
│   │
│   └── charts/
│       ├── LineChart.tsx                  # Line chart component
│       ├── PieChart.tsx                   # Pie chart component
│       ├── BarChart.tsx                   # Bar chart component
│       └── GaugeChart.tsx                 # Gauge/risk chart
│
├── lib/
│   ├── db.ts                              # Database utilities (existing)
│   ├── mongodb.ts                         # MongoDB connection (existing)
│   ├── models/
│   │   ├── index.ts                       # Models export (existing)
│   │   ├── user.ts                        # User model (existing)
│   │   ├── campaign.ts                    # Campaign model
│   │   ├── creator.ts                     # Creator/influencer model
│   │   ├── analysis.ts                    # Analysis results model
│   │   └── match.ts                       # Creator-campaign match model
│   │
│   ├── services/
│   │   ├── ai-analysis.ts                 # AI analysis service
│   │   ├── social-scraper.ts              # Social media scraping
│   │   ├── risk-assessment.ts             # Risk calculation
│   │   └── matching-algorithm.ts          # Creator matching logic
│   │
│   └── utils/
│       ├── formatting.ts                  # Number/text formatting
│       ├── validation.ts                  # Form validation
│       └── date-helpers.ts                # Date utilities
│
├── types/
│   ├── index.ts                           # Type exports (existing)
│   ├── campaign.ts                        # Campaign types
│   ├── creator.ts                         # Creator types
│   ├── analysis.ts                        # Analysis types
│   └── api.ts                             # API response types
│
├── styles/
│   └── globals.css                        # Global styles (Tailwind + custom)
│
├── public/
│   ├── fonts/                             # Poppins font files
│   └── images/                            # Static images
│
├── hooks/
│   ├── useCampaigns.ts                    # Campaigns data hook
│   ├── useCreators.ts                     # Creators data hook
│   ├── useAnalytics.ts                    # Analytics data hook
│   └── useAuth.ts                         # Authentication hook
│
└── config/
    ├── site.ts                            # Site configuration
    └── navigation.ts                      # Navigation structure

```

## Page Routes Mapping

| Screen File | Route | Page File | Description |
|------------|-------|-----------|-------------|
| screen1.html | `/dashboard` | `app/dashboard/page.tsx` | Main dashboard overview |
| screen2.html | `/campaigns/create` | `app/campaigns/create/page.tsx` | Create new campaign |
| screen3.html | `/campaigns/scanning` | `app/campaigns/scanning/page.tsx` | AI scanning progress |
| screen4.html | `/campaigns/matches` | `app/campaigns/matches/page.tsx` | Creator matches results |
| screen5.html | `/creators/[id]` | `app/creators/[id]/page.tsx` | Creator full report |
| screen6.html | `/analytics` | `app/analytics/page.tsx` | Analytics dashboard |
| screen7.html | `/campaigns/add-creator` | `app/campaigns/add-creator/page.tsx` | Add creator to campaign |
| screen8.html | `/settings` | `app/settings/page.tsx` | Settings page |
| screen9.html | `/investor-metrics` | `app/investor-metrics/page.tsx` | Investor metrics |
| screen10.html | `/investor-metrics` | `app/investor-metrics/page.tsx` | Extended investor view |
| screen11.html | `/creators/[id]/content-analysis` | `app/creators/[id]/content-analysis/page.tsx` | Content analysis |

## Database Models

### Campaign
```typescript
{
  _id: ObjectId,
  name: string,
  description: string,
  brandValues: string[],
  targetAudience: {
    ageRange: string,
    location: string,
    interests: string[],
    gender: string[]
  },
  platforms: string[],
  status: 'draft' | 'scanning' | 'active' | 'completed',
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Creator
```typescript
{
  _id: ObjectId,
  name: string,
  avatar: string,
  platform: string,
  followers: number,
  engagement: number,
  metrics: {
    alignmentScore: number,
    audienceAuthenticity: number,
    riskLevel: 'low' | 'medium' | 'high',
    contentConsistency: number
  },
  analysis: {
    brandValues: object,
    audienceQuality: object,
    toneBehavior: object,
    redFlags: object,
    riskPrediction: object
  },
  lastAnalyzed: Date,
  createdAt: Date
}
```

### Analysis
```typescript
{
  _id: ObjectId,
  creatorId: ObjectId,
  campaignId: ObjectId,
  status: 'pending' | 'in_progress' | 'completed',
  results: object,
  createdAt: Date,
  completedAt: Date
}
```

### Match
```typescript
{
  _id: ObjectId,
  campaignId: ObjectId,
  creatorId: ObjectId,
  score: number,
  status: 'matched' | 'added' | 'rejected',
  createdAt: Date
}
```

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: MongoDB (already configured)
- **Styling**: Tailwind CSS + Custom CSS
- **Fonts**: Poppins (Google Fonts)
- **Icons**: Font Awesome 6.4.0
- **Charts**: Chart.js or Recharts
- **State Management**: React Context + Server Components
- **API**: Next.js Route Handlers

## Key Features by Section

### Dashboard (screen1)
- Overview statistics
- Recent creator analyses
- Quick actions
- Trend charts

### Campaigns
- **Create**: Multi-step form with brand values, audience targeting
- **Scanning**: Real-time AI progress with step indicators
- **Matches**: Filterable grid of matched creators
- **Add Creator**: Select campaign and configure partnership terms

### Creators
- **List/Search**: Browse all creators
- **Profile**: Comprehensive vetting report
- **Content Analysis**: Deep dive into content history and risks

### Analytics (screen6)
- KPI metrics
- Performance charts
- Top performers table
- Platform distribution

### Investor Metrics (screen9, screen10)
- Revenue metrics
- Growth indicators
- Financial projections
- ROI calculations
- Competitive advantages

### Settings (screen8)
- Account management
- Notifications
- Team management
- Security
- Integrations
- Billing

## Next Steps

1. **Phase 1**: Set up shared components (Sidebar, TopBar, Button, Card)
2. **Phase 2**: Implement Dashboard page
3. **Phase 3**: Build Campaign creation flow
4. **Phase 4**: Implement Creator profile pages
5. **Phase 5**: Add Analytics and Settings
6. **Phase 6**: Implement API routes and data integration
7. **Phase 7**: Add authentication and user management

## Development Workflow

1. Start with converting static HTML to React components
2. Extract reusable components into `components/common`
3. Implement API routes with MongoDB models
4. Connect frontend to backend APIs
5. Add form validation and error handling
6. Implement real-time updates for scanning
7. Add authentication and authorization
8. Optimize performance and SEO
