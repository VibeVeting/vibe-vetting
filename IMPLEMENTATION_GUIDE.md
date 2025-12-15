# VibeVetting Implementation Guide

## Component Hierarchy

```
App
├── RootLayout (Sidebar + TopBar)
│   │
│   ├── Dashboard Page
│   │   ├── StatsGrid
│   │   │   └── StatCard (x4)
│   │   ├── ChartSection
│   │   │   ├── LineChart
│   │   │   └── QuickStats Panel
│   │   └── RecentAnalysesTable
│   │
│   ├── Campaigns
│   │   ├── Create Page
│   │   │   └── CampaignForm
│   │   │       ├── TagsInput (brand values)
│   │   │       ├── TagsInput (interests)
│   │   │       └── PlatformSelector
│   │   │
│   │   ├── Scanning Page
│   │   │   └── ScanningProgress
│   │   │       ├── ProgressBar
│   │   │       ├── ScanStep (x5)
│   │   │       └── InfoSection
│   │   │
│   │   ├── Matches Page
│   │   │   ├── MatchFilters
│   │   │   └── InfluencerGrid
│   │   │       └── InfluencerCard (xN)
│   │   │
│   │   └── Add Creator Page
│   │       └── AddToCampaignForm
│   │           ├── CampaignSelector
│   │           └── PartnershipTerms
│   │
│   ├── Creators
│   │   ├── [id] Page
│   │   │   ├── CreatorHeader
│   │   │   ├── RecommendationBox
│   │   │   ├── BrandValuesMatch
│   │   │   ├── AudienceQuality
│   │   │   ├── ToneBehaviorScan
│   │   │   ├── HistoryRedFlags
│   │   │   └── RiskPrediction
│   │   │
│   │   └── Content Analysis Page
│   │       ├── ContentAuditGrid
│   │       ├── RiskAlert (x3)
│   │       ├── BrandProtection
│   │       └── ContentHealthMetrics
│   │
│   ├── Analytics Page
│   │   ├── KPICards (x4)
│   │   ├── ChartsGrid
│   │   │   ├── CampaignPerformanceChart
│   │   │   ├── PlatformDistributionChart
│   │   │   ├── AudienceGrowthChart
│   │   │   └── RiskDistributionChart
│   │   └── TopPerformersTable
│   │
│   ├── Investor Metrics Page
│   │   ├── MetricsGrid (x6)
│   │   ├── RevenueCharts
│   │   ├── FinancialCards (x3)
│   │   ├── GrowthIndicators
│   │   ├── InvestmentHighlights (x6)
│   │   ├── ROISection
│   │   └── CompetitiveAdvantages (x6)
│   │
│   └── Settings Page
│       ├── SettingsNav
│       └── SettingsSections
│           ├── AccountSettings
│           ├── NotificationSettings
│           ├── TeamSettings
│           ├── SecuritySettings
│           ├── IntegrationsSettings
│           └── BillingSettings
```

## Shared Component Library

### Common Components

#### 1. Sidebar.tsx
```tsx
- Logo
- Navigation menu (7 items)
- Active state management
- Responsive (mobile drawer)
```

#### 2. TopBar.tsx
```tsx
- Page title
- Search box
- Action buttons
- User profile avatar
```

#### 3. Button.tsx
```tsx
Variants:
- primary (gradient)
- secondary (outlined)
- danger (red)

Sizes:
- sm, md, lg

States:
- default, hover, active, disabled
```

#### 4. Card.tsx
```tsx
- White background
- Rounded corners
- Shadow
- Optional header with menu
- Hover effects
```

#### 5. Badge.tsx
```tsx
Types:
- verified (green)
- pending (orange)
- risk (red)
- info (blue)
```

#### 6. MetricCard.tsx
```tsx
- Icon badge
- Label
- Value (large number)
- Change indicator (↑/↓)
- Hover lift effect
```

#### 7. ProgressBar.tsx
```tsx
- Configurable width
- Color variants (gradient, warning, danger)
- Animated fill
```

#### 8. TagsInput.tsx
```tsx
- Input field
- Tag chips with remove
- Enter to add
- Clickable tags
```

#### 9. Modal.tsx
```tsx
- Overlay
- Centered content
- Close button
- Backdrop click to close
```

## Color Palette

```css
/* Primary Gradient */
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Background */
--bg-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
--bg-white: #ffffff;
--bg-gray-light: #f7fafc;
--bg-gray: #e2e8f0;

/* Text */
--text-primary: #1a202c;
--text-secondary: #4a5568;
--text-muted: #718096;
--text-light: #cbd5e0;

/* Status Colors */
--success: #22863a;
--success-bg: rgba(34, 134, 58, 0.15);
--warning: #d29922;
--warning-bg: rgba(210, 153, 34, 0.15);
--danger: #cb2431;
--danger-bg: rgba(203, 36, 49, 0.15);
--info: #667eea;
--info-bg: rgba(102, 126, 234, 0.15);

/* Borders */
--border-light: #e2e8f0;
--border-primary: #667eea;
```

## Typography

```css
/* Font Family */
font-family: 'Poppins', sans-serif;

/* Font Weights */
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
--font-black: 900;

/* Font Sizes */
--text-xs: 11px;
--text-sm: 12px;
--text-base: 13px;
--text-md: 14px;
--text-lg: 16px;
--text-xl: 18px;
--text-2xl: 24px;
--text-3xl: 28px;
--text-4xl: 32px;
--text-5xl: 36px;
```

## Spacing System

```css
/* Margins & Padding */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;

/* Border Radius */
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 10px;
--radius-xl: 12px;
--radius-2xl: 16px;
--radius-3xl: 20px;
```

## Animation Guidelines

### Transitions
```css
/* Standard transition */
transition: all 0.3s ease;

/* Bounce effect (for cards) */
transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Hover Effects
```tsx
// Card hover
transform: translateY(-8px);
box-shadow: 0 12px 40px rgba(102, 126, 234, 0.2);

// Button hover
transform: translateY(-2px);
box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
```

### Loading Animations
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

## Responsive Breakpoints

```css
/* Mobile First Approach */
--mobile: 0px;        /* Default */
--tablet: 768px;      /* md */
--laptop: 1024px;     /* lg */
--desktop: 1280px;    /* xl */
--wide: 1536px;       /* 2xl */
```

### Responsive Grid Patterns

```tsx
// Stats Grid
grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));

// Influencer Cards
grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));

// 2-column layout
grid-template-columns: 2fr 1fr; // Desktop
grid-template-columns: 1fr;     // Mobile
```

## Data Flow Architecture

```
User Action
    ↓
Component Event Handler
    ↓
API Route (/app/api/...)
    ↓
Service Layer (/lib/services/...)
    ↓
MongoDB Model (/lib/models/...)
    ↓
Database (MongoDB)
    ↓
Response
    ↓
Update UI State
```

## API Route Structure

```typescript
// GET /api/campaigns
export async function GET(request: Request) {
  // 1. Authenticate user
  // 2. Parse query params
  // 3. Fetch from database
  // 4. Return JSON response
}

// POST /api/campaigns
export async function POST(request: Request) {
  // 1. Authenticate user
  // 2. Validate request body
  // 3. Create in database
  // 4. Return created resource
}

// GET /api/campaigns/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 1. Authenticate user
  // 2. Fetch by ID
  // 3. Return resource or 404
}
```

## State Management Strategy

### Server Components (Default)
- Use for data fetching
- Direct database access
- No client-side JS

### Client Components ('use client')
- Form handling
- Interactive UI
- Local state management
- Event handlers

### Example Pattern
```tsx
// app/campaigns/page.tsx (Server Component)
export default async function CampaignsPage() {
  const campaigns = await getCampaigns(); // Direct DB call

  return <CampaignsList campaigns={campaigns} />; // Pass to client
}

// components/CampaignsList.tsx (Client Component)
'use client';
export function CampaignsList({ campaigns }) {
  const [filter, setFilter] = useState('all');
  // Interactive filtering logic
}
```

## Form Validation Pattern

```typescript
// Using Zod for validation
import { z } from 'zod';

const campaignSchema = z.object({
  name: z.string().min(3).max(100),
  brandValues: z.array(z.string()).min(1),
  platforms: z.array(z.string()).min(1),
  targetAudience: z.object({
    ageRange: z.string(),
    location: z.string(),
    interests: z.array(z.string()).min(1)
  })
});

type CampaignFormData = z.infer<typeof campaignSchema>;
```

## Testing Strategy

### Unit Tests
- Individual components
- Utility functions
- Validation schemas

### Integration Tests
- API routes
- Database operations
- Form submissions

### E2E Tests
- Critical user flows
- Campaign creation
- Creator matching

## Performance Optimization

### Image Optimization
```tsx
import Image from 'next/image';

<Image
  src="/creator-avatar.jpg"
  alt="Creator"
  width={64}
  height={64}
  loading="lazy"
/>
```

### Code Splitting
```tsx
import dynamic from 'next/dynamic';

const AnalyticsChart = dynamic(
  () => import('@/components/charts/LineChart'),
  { loading: () => <ChartSkeleton /> }
);
```

### Data Fetching
```tsx
// Use React Suspense for streaming
<Suspense fallback={<LoadingSkeleton />}>
  <CreatorsList />
</Suspense>
```

## Security Considerations

1. **Environment Variables**: Store MongoDB URI, API keys in `.env.local`
2. **Authentication**: Implement NextAuth.js or similar
3. **Authorization**: Role-based access control (Admin, User, Viewer)
4. **Input Sanitization**: Validate and sanitize all user inputs
5. **Rate Limiting**: Protect API routes from abuse
6. **CORS**: Configure properly for API routes

## Deployment Checklist

- [ ] Environment variables configured
- [ ] MongoDB connection string updated
- [ ] Font Awesome CDN or self-hosted
- [ ] Image optimization configured
- [ ] Analytics tracking added
- [ ] Error monitoring (Sentry)
- [ ] SEO metadata
- [ ] Social preview images
- [ ] Performance testing
- [ ] Accessibility audit

## Development Priority Order

1. **Week 1**: Common components + Layout
2. **Week 2**: Dashboard + Campaign creation
3. **Week 3**: AI scanning + Creator matches
4. **Week 4**: Creator profiles + Reports
5. **Week 5**: Analytics + Settings
6. **Week 6**: API integration + Testing
7. **Week 7**: Investor metrics + Polish
8. **Week 8**: Authentication + Deployment
