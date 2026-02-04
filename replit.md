# GRC Shield - Enterprise Governance, Risk & Compliance Platform

## Overview
GRC Shield is a comprehensive, AI-enabled multi-tenant platform designed to streamline Governance, Risk, and Compliance (GRC) processes for enterprises. It offers predictive compliance insights, robust risk management, and a premium 3D glassmorphism user interface. The platform's modular architecture supports policy management, risk assessments, compliance tracking, data privacy, auditing, and vendor risk management. The project's vision is to deliver an intuitive, powerful, and visually engaging GRC solution that leverages cutting-edge technology to meet the complex regulatory and operational demands of modern enterprises across diverse regions and industries.

## User Preferences
I prefer that the agent adheres to the existing architectural patterns and technology choices. When suggesting changes or implementing new features, prioritize solutions that maintain the current premium UI/UX design language. Focus on using real data from the PostgreSQL database rather than mock data for all functionalities. I value detailed explanations for any significant changes or complex logic introduced. Do not introduce new external dependencies without explicit approval.

## System Architecture

### UI/UX Decisions
The platform features a premium dark theme with a 3D glassmorphism design, incorporating mesh gradient backgrounds, 3D card effects, glossy buttons, gradient text, glow effects, and animated transitions. The frontend is built with React, TypeScript, Shadcn UI, and Tailwind CSS.

### Technical Implementations
The application utilizes a modern web stack:
- **Frontend**: React 18, TypeScript, TanStack Query, Wouter, Recharts, Shadcn UI, Tailwind CSS.
- **Backend**: Express.js with TypeScript.
- **Database**: PostgreSQL with Drizzle ORM.

### Feature Specifications
- **Multi-Portal Architecture**: Includes Super Admin, Tenant Admin, Auditor, and End User portals.
- **Tableau-Quality Dashboards**: Interactive charts and AI insights for GRC data visualization.
- **Core GRC Modules**: Governance (policy management, framework library), Risk Management, Compliance, Data Privacy, Auditing, and Vendor Management.
- **AI Intelligence**: OpenAI integration for compliance gap detection, policy recommendations, vendor risk analysis, predictive compliance scoring, and content enrichment for policies and controls.
- **Content Libraries**: Extensive libraries for policies (103), processes (15), procedures (15), and frameworks (109 across Security, Privacy, Governance, Industry, Regional, and Gulf categories).
- **Control Library**: 1,005 controls, with 89% AI-enriched, including detailed implementation guidance and cross-framework mappings.
- **Tenant-Framework Applicability**: Multi-dimensional system for assigning global, industry, and regional frameworks to tenants.
- **Tenant Management**: Super admin capabilities for managing tenants, roles, licenses, and security settings.
- **Report Center**: 35 report templates across various GRC categories.
- **Enterprise Features**: Trust Center, Continuous Control Monitoring, Evidence Management, Regulatory Intelligence, ESG Module, Business Continuity Planning (BCP/DR), and an Integration Hub.
- **Approval Workflow System**: Configurable multi-level approval chains for GRC entities (policies, processes, procedures).
- **Custom Framework Creation**: Allows creation of custom frameworks and controls, including CSV import.
- **Employee Portal**: Features policy acknowledgment, training assignments, device management, cybersecurity tips, incident guidance, and an AI InfoSec Help assistant.
- **Security Module**: Vulnerability Management (upload/analyze scan reports), Security Findings tracking, Security Posture Assessment with AI-powered scorecards and trend analysis.
- **DSPM (Data Security Posture Management)**: Data discovery, sensitive data classification, data flow mapping, and data access risk identification with AI-powered analysis.
- **Integrated Security Scanning Engines**:
  - **Email Security Assessment**: DMARC/DKIM/SPF analysis with recommendations, MX record validation, BIMI/MTA-STS status.
  - **Web Application Scanner**: Acunetix-style comprehensive scanning with OWASP Top 10 detection, technology fingerprinting, SSL/TLS analysis, security header checks, CVSS scoring, CVE references, and attack simulation.
  - **Dark Web Monitor**: HIBP-style breach monitoring with comprehensive breach database, credential leak detection, stealer log monitoring, paste exposures, brand mention tracking, and typosquat domain detection.
  - **Threat Intelligence**: OSINT-based threat intelligence aggregation and analysis.
  - **Unified Vulnerability Management**: Aggregated view of all vulnerabilities across scanning engines with filtering, search, severity-based dashboards, and drill-down capabilities.
- **Vendor Risk Management Module**:
  - Comprehensive vendor registry with add/edit/delete functionality.
  - Vendor risk assessments with questionnaire templates (SIG Lite, SIG Core, CAIQ, VSAQ, Custom).
  - Assessment types: Security, Privacy, Compliance, Due Diligence.
  - AI-powered assessment analysis and vendor data enrichment.
  - Vendor contracts management.
  - Due diligence checklists.
  - Vendor detail view with assessments, contracts, and AI insights tabs.

### System Design Choices
- **Multi-tenancy**: Isolated data for multiple independent tenants.
- **Role-Based Access Control (RBAC)**: Granular access based on user roles (super_admin, tenant_admin, auditor, end_user).
- **Modular Structure**: Codebase organized into `client/`, `server/`, and `shared/`.
- **Database Schema**: Comprehensive PostgreSQL schema supporting all GRC functionalities.
- **API Design**: RESTful API endpoints for core functionalities.

## External Dependencies

- **Database**: PostgreSQL (Neon)
- **Frontend Frameworks/Libraries**: React, TypeScript, TanStack Query, Wouter, Recharts, Shadcn UI, Tailwind CSS
- **Backend Frameworks/Libraries**: Express.js, Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **AI Integration**: OpenAI (via Replit AI Integrations)
- **PDF/Word Export**: `jsPDF`, `docx`

## Platform Dependencies Page

Located at `/admin/platform-dependencies`, this page provides a comprehensive overview of all external integrations, APIs, and third-party services used by the platform. Features include:
- **Categories**: Core Infrastructure, AI & ML, Web App Scanning, Dark Web Monitoring, Email Security, Vulnerability Intelligence, GRC Frameworks, Document Generation, Notifications
- **License Types**: Free, Open Source, Freemium, Paid, Enterprise
- **Integration Status**: Integrated, Planned, Simulated, Not Integrated
- **Recommendations**: Guidance on production-grade integrations for security scanning modules

### Current Security Scanning Implementation Note
The Web App Scanner and Dark Web Monitor modules currently use **simulated scanning engines** for demonstration. Production deployment requires integration with recommended services:
- **Web App Scanning**: OWASP ZAP (free), Nuclei (free), Acunetix (enterprise), Qualys WAS (enterprise)
- **Dark Web Monitoring**: HIBP API ($3.50/mo), SpyCloud (enterprise), Flare (enterprise), Recorded Future (enterprise)

## Scalability Architecture

### Design Targets
- **Multi-Tenancy**: 100s of independent tenants with complete data isolation
- **Users**: 1M+ users across all tenants
- **Devices**: 1M+ managed devices (employee devices, assets)
- **High Availability**: 99.9% uptime with health monitoring

### Database Optimization (PostgreSQL)

#### Connection Pooling (`server/db.ts`)
- **Pool Size**: 50 max connections (configurable via `DB_POOL_MAX`)
- **Min Connections**: 5 idle connections maintained
- **Connection Timeout**: 10 seconds
- **Idle Timeout**: 30 seconds (releases inactive connections)
- **Keep-Alive**: Enabled with 10-second initial delay
- **Statement Timeout**: 30 seconds (prevents runaway queries)

#### Database Indexes (`server/lib/db-indexes.sql`)
Comprehensive indexes for:
- **Tenant isolation**: All tenant-scoped queries use `tenant_id` indexes
- **User lookups**: Username, email, tenant+role combinations
- **Risk/Policy/Control filtering**: Status, level, dates
- **Activity logs**: High-volume log queries optimized
- **Security modules**: Email, web scan, dark web monitoring
- **Partial indexes**: Active-only users, open risks, pending approvals

### Caching Layer (`server/lib/cache.ts`)

#### Multi-Tier LRU Cache
- **Data Cache**: 10,000 entries for general data
- **Query Cache**: 5,000 entries for query results
- **Session Cache**: 20,000 entries for auth sessions

#### TTL Configuration
| Data Type | TTL | Description |
|-----------|-----|-------------|
| User Session | 60s | Short-lived auth data |
| Dashboard Stats | 5m | Moderately changing metrics |
| Tenant Config | 5m | Tenant settings |
| Frameworks | 30m | Rarely changing reference data |
| Policies | 30m | Document data |
| Controls Catalog | 30m | Control library |
| Regions/Industries | 2h | Static reference data |

#### Cache Key Patterns
- Tenant-scoped: `tenant:{tenantId}:*`
- User-scoped: `user:{userId}:*`
- Global: `global:*`

### Rate Limiting (`server/lib/rate-limiter.ts`)

#### Endpoint Limits (per minute)
| Endpoint Type | Requests | Burst | Purpose |
|--------------|----------|-------|---------|
| Standard API | 100 | +20 | General endpoints |
| Auth | 10 | +5 | Login/register protection |
| AI/OpenAI | 20 | +5 | Expensive AI operations |
| Search | 50 | +10 | Query endpoints |
| Upload | 10 | +2 | File upload protection |
| Export/Reports | 5 | +1 | Heavy operations |

#### Rate Limit Headers
- `X-RateLimit-Limit`: Max requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Window reset timestamp
- `Retry-After`: Seconds until limit resets (on 429)

### Pagination (`server/lib/pagination.ts`)

#### Offset-Based Pagination
- Default page size: 25 items
- Maximum page size: 100 items
- Response includes: `page`, `limit`, `total`, `totalPages`, `hasNext`, `hasPrev`

#### Cursor-Based Pagination
- For large datasets (1M+ rows)
- Uses encoded cursors for efficient traversal
- No total count (faster queries)

### Health Monitoring

#### Endpoints
- `GET /health/live` - Liveness probe (returns 200 if app running)
- `GET /health/ready` - Readiness probe (checks all components)
- `GET /health` - Detailed health status
- `GET /metrics` - Prometheus-compatible metrics

#### Monitored Components
- Database: Connection pool stats, query latency
- Cache: Hit rate, size, evictions
- Memory: Heap usage, RSS

### Performance Best Practices

1. **Query Optimization**
   - All tenant queries include `tenant_id` filter
   - Use pagination for list endpoints
   - Limit SELECT columns when possible

2. **Caching Strategy**
   - Cache frequently accessed data (frameworks, policies)
   - Invalidate cache on mutations
   - Use tenant-scoped cache keys

3. **Rate Limiting**
   - Protect expensive endpoints (AI, exports)
   - Per-user and per-tenant limits
   - Graceful degradation on overload