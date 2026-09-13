# Fixed Income Analytics Platform - Design Document

## Overview
This document outlines the design for a Fixed Income Analytics Platform that provides tools for bond analysis, yield curve construction, portfolio analytics, and trading insights. The platform is designed to help users learn fixed income concepts and develop skills relevant to capital markets roles at institutions like J.P. Morgan.

## Architecture Approach
- **Pattern**: Modular Full-Stack Application
- **Deployment**: Containerized using Docker (optional for learning)
- **Technology Stack**: 
  - Backend: FastAPI (Python)
  - Frontend: React with TypeScript, Tailwind CSS, Zustand
  - Charting: TradingView Lightweight Charts or similar
  - Real-time: WebSocket connections for live data
  - Deployment: Docker Compose orchestration (optional)

## Core Features
1. **Yield Curve Analysis** - Interactive yield curve visualization with multiple curve types (Par, Zero, Forward)
2. **Bond Screener & Filter** - Search and filter bonds by issuer, maturity, yield, credit rating, etc.
3. **Portfolio Analytics** - Real-time portfolio valuation, risk metrics (duration, convexity), and performance tracking
4. **Relative Value Trading Tools** - Curve trades, butterfly strategies, and roll-down analysis
5. **Credit Analysis** - Z-spread, OAS calculation, and credit spread analysis
6. **Educational Component** - Built-in learning resources and concept explanations

## Component Breakdown

### Backend Services (FastAPI)
1. API Gateway Router
2. Authentication & Authorization Service (optional for learning)
3. Market Data Service (real-time and historical)
4. Yield Curve Construction Service
5. Bond Pricing & Analytics Engine
6. Credit Analysis Service
7. Portfolio Calculation Service
8. WebSocket Service for real-time updates
9. Data Integration Service (market data feeds)
10. Educational Content Service

### Frontend Components (React)
1. **Dashboard Header** - Platform title, subtitle, user profile, notifications
2. **Key Metrics Row** - Portfolio value, YTM, duration, credit spread displays
3. **Yield Curve Chart** - Interactive chart with multiple curve types and controls
4. **Bond Screener** - Filterable table with search, sort, and detailed views
5. **Relative Value Analysis Panel** - Curve trades, butterfly strategies
6. **Credit Analysis Panel** - Z-spread/OAS calculations and visualizations
7. **Educational Tooltips/Modals** - Concept explanations on hover/click
8. **Responsive Layout** - Mobile/tablet/desktop adaptive design

### Infrastructure
- **Data Sources**: Market data APIs (optional: simulated data for learning)
- **Cache**: In-memory or Redis for frequently accessed data
- **Storage**: Local storage for user preferences and learning progress
- **Deployment**: Docker containers (backend, frontend) or direct execution

## Key Data Flows

### 1. Market Data Flow
Market Data API → Backend Cache/Services → WebSocket → Frontend Components → Real-time Updates

### 2. User Interaction Flow
User Input (Filters/Search) → Frontend State (Zustand) → Backend API → Processed Data → Frontend Visualization

### 3. Educational Flow
User Interaction → Concept Trigger → Explanation Modal/Tooltip → Learning Reinforcement

## Technology Choices Justification
- **FastAPI**: High performance, automatic API documentation, Python-based for financial calculations
- **React/TypeScript**: Strong typing, component reusability, large ecosystem for financial UI
- **Tailwind CSS**: Utility-first CSS for rapid UI development and consistent design
- **Zustand**: Lightweight state management for React with predictable updates
- **TradingView Lightweight Charts**: Professional financial charting with interactive features
- **WebSocket**: Real-time updates for live market data and analytics
- **Docker**: Consistent deployment, easy scaling, environment isolation

## Success Criteria
1. Platform provides accurate bond pricing and yield curve calculations
2. Interactive visualizations respond smoothly to user interactions
3. Educational components effectively explain fixed income concepts
4. Platform handles simulated real-time data updates
5. Responsive design works across device sizes
6. Code is well-structured and follows modern development practices

## UI/UX Design Specification

### Dashboard Layout (1440x900px)
- **Header**: Platform title ("Fixed Income Analytics Platform"), subtitle, user controls
- **Key Metrics**: Four metric cards showing portfolio value, YTM, duration, credit spread
- **Main Content**: 
  - Left (60%): Yield Curve Chart with controls
  - Right (40%): Bond Screener with filter panel and results table

### Color Scheme (Professional Financial)
- Primary: #2563EB (Blue-600)
- Secondary: #64748B (Slate-500)
- Background: #FFFFFF (White)
- Surface: #F8F9FA (Gray-50)
- Border: #E9ECEF (Gray-200)
- Text Primary: #111827 (Gray-900)
- Text Secondary: #6B7280 (Gray-500)
- Success: #10B981 (Emerald-500)
- Warning: #F59E0B (Amber-500)
- Error: #EF4444 (Red-500)

### Typography
- Font Family: Inter (system fallback: Helvetica, Arial, sans-serif)
- Weights: Regular (400), Medium (500), SemiBold (600), Bold (700)
- Sizes: Display (24px), Heading (16-20px), Body (14px), Caption (12px)

### Components
1. **GlassPanel** - Reusable glassmorphic component (from TradingAgents project)
2. **MetricCard** - For key metrics display
3. **YieldCurveChart** - Wrapper for TradingView Lightweight Charts
4. **BondScreener** - Filterable bond table with search and sort
5. **DateRangePicker** - For historical data selection
6. **Badge** - For credit ratings and status indicators

### Interactions & Animations
- Hover effects: Subtle scale (1.02) on interactive elements
- Loading states: Skeleton screens for data fetching
- Transitions: Framer Motion for smooth state changes
- Real-time updates: WebSocket connection for live price/yield updates
- Tooltips: On chart hover showing exact yield/maturity points

## Educational Components
1. **Concept Tooltips**: Hover-over explanations of financial terms
2. **Learning Modal**: Detailed explanations when clicking on metrics or charts
3. **Guided Tours**: Step-by-step walkthroughs of platform features
4. **Glossary**: Searchable fixed income terminology reference
5. **Calculation Walkthroughs**: Step-by-step bond pricing and yield calculations

## Next Steps
1. Set up development environment with Node.js and Python
2. Create basic project structure for frontend and backend
3. Implement core analytics engine (bond pricing, yield curve)
4. Build dashboard UI with key metrics and charts
5. Add bond screener with filtering capabilities
6. Integrate WebSocket for real-time updates (optional)
7. Add educational tooltips and modals
8. Implement responsive design for different screen sizes
9. Add Docker configuration for easy deployment
10. Create user testing plan for learning effectiveness