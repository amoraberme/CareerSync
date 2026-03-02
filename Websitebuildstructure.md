# CAREER SYNC — MASTER ARCHITECTURAL SOP
> **Classification:** System Architecture & Build Structure Document  
> **Version:** 1.0 | **Generated:** 2026-03-02  
> **Codebase Root:** `CareerSync_Clone/`

---

## I. CORE PURPOSE

- **Primary User Value Proposition:** Career Sync is an AI-powered Career Intelligence platform that ingests a user's resume and a target job description, then synthesizes a multi-dimensional ATS analysis report — including trajectory scoring, transferable skill mapping, and AI-generated cover letters calibrated by tone.
- **Target Audience:** Job seekers in the Philippines and Southeast Asia (locale: `en-PH`) who need a data-driven edge in competitive hiring pipelines; from entry-level candidates to professionals targeting lateral or upward career moves.
- **Primary Conversion Goal:** Drive users from the public Landing page to a paid subscription tier (Standard or Premium) via a QR-code GCash payment flow (PayMongo), unlocking higher daily credit allotments and advanced AI features gated by `tierPermissions`.

---

## II. SYSTEM ARCHITECTURE

### 2.1 Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Frontend Framework** | **React 19** + **Vite 7** | SPA, compiled via `@vitejs/plugin-react`. `vite-plugin-singlefile` bundles into a single HTML artifact for portable builds. |
| **Compiler / Build** | **Vite 7.3** | Dev server: `npm run dev`. Production: `npm run build`. |
| **Styling Engine** | **TailwindCSS 3.4** + **PostCSS** | Extended with a custom Mathematical Visual Engine using HSL-based `--background`, `--card`, `--foreground` CSS custom properties. Dark mode via `.dark` class strategy. |
| **Design Token System** | **`tailwind.config.js`** | Custom semantic tokens: `obsidian`, `slate`, `champagne`, `darkBg`, `darkCard`, `darkText`, `surface`. Custom font families: `Inter` (sans), `Playfair Display` (drama), `JetBrains Mono` (mono). Custom easing: `physical` (elastic cubic-bezier), `smooth`. |
| **Global CSS** | **`src/index.css`** | Defines the Mathematical Visual Engine: light mode uses HSL `92%→96%→100%` luminosity layering; dark mode uses `0%→5%→10%`. Custom keyframes: `shimmer`, `marquee`, `spin`. |
| **State Management** | **Zustand 5** | Single store: `useWorkspaceStore.jsx`. Manages analysis data, credit balance, dark mode, and AI analysis loading state. |
| **Backend / BaaS** | **Supabase** (`@supabase/supabase-js ^2.97`) | Handles Auth (email/password + OAuth magic links), database (PostgreSQL via RLS), and session management. Client: `src/supabaseClient.js`. |
| **Serverless API** | **Vercel Serverless Functions** | All API routes under `api/`. Routed via `vercel.json`: `/api/(.*)` → `api/$1`; all other paths → `index.html` (SPA fallback). |
| **AI Engine** | **Google Gemini** (`@google/generative-ai ^0.24.1`) | Powers ATS resume analysis and cover letter generation via `api/analyze.js`. |
| **Payment Gateway** | **PayMongo** | QR-based GCash payment flow. Initiated via `api/initiate-payment.js`. Webhooks processed by `api/webhooks/`. EMVCo QR generation in `api/_lib/emvco.js`. |
| **Smooth Scroll** | **Lenis 1.3** (`lenis` + `@studio-freight/lenis`) | Initialized in `App.jsx`: duration `1.5s`, custom exponential easing, RAF loop. |
| **Animation Engine** | **GSAP 3.14** + **Framer Motion 12** | GSAP for procedural timeline animations. Framer Motion for declarative React component transitions. |
| **PDF Export** | **jsPDF 4** + **html2canvas** | Used in AnalysisTabs for exporting analysis reports to PDF. |
| **Analytics** | **@vercel/analytics** | Injected at the Vercel deployment layer. |
| **Icons** | **lucide-react 0.575** | Consistent icon system across all components. |

---

## III. DATA & USER FLOW

### 3.1 Authentication State Machine

> `App.jsx` acts as the single routing controller. There is **no React Router**. Navigation is handled via `useState(currentView)` + `window.history.pushState()` for URL synchronization. Supabase `onAuthStateChange` drives the session state machine.

```
SUPABASE AUTH STATE CHANGE
  ├── SIGNED_IN       → fetchCreditBalance(user.id) → render authenticated views
  ├── SIGNED_OUT      → setCurrentView('workspace') → render <Landing />
  ├── PASSWORD_RECOVERY → setIsPasswordRecovery(true) → render <UpdatePassword />
  └── TOKEN_REFRESHED (no session) → force setSession(null)
```

### 3.2 Chronological User Journey

- **[ / ] — Landing Page** (`src/components/Landing.jsx`)
  - Renders the public marketing surface. Contains hero section, features, FAQ accordion, pricing preview, and social proof.
  - Contains an embedded `<Simulation />` component that plays a blurred UI preview with a centered play button.
  - Contains `<ContactModal />` for inbound sales inquiries.
  - CTA buttons call `onNavigate('auth')` to trigger the Auth gate.

- **[ /auth / 'auth' view ] — Authentication** (`src/components/Auth.jsx`)
  - Handles standard email/password login and registration.
  - On successful `SIGNED_IN` event from Supabase, `App.jsx` lifts state and transitions the user to the `workspace` view.
  - On `PASSWORD_RECOVERY` event, `App.jsx` intercepts and renders `<UpdatePassword />`.

- **[ /workspace / 'workspace' view — default ] — Core Engine** (`src/components/CoreEngine.jsx`)
  - **Unauthenticated path:** Shows `<Landing />`.
  - **Authenticated, no analysis data:** Renders `<CoreEngine />` — the primary resume + job description input interface. User uploads or pastes resume (PDF/DOCX/TXT), pastes job description, and submits.
    > On submit: `fetch('/api/parse')` extracts text from uploaded file → `fetch('/api/analyze')` sends resume + JD to Gemini → response is stored in Zustand (`useWorkspaceStore`).
  - **Authenticated, analysis data present:** Renders `<AnalysisTabs />` — the full AI analysis report with tabs for ATS Score, Trajectory Score, Transferable Skills, and Cover Letter.

- **[ 'history' view ] — History Dashboard** (`src/components/HistoryDashboard.jsx`)
  - Protected route. Fetches and displays past analysis sessions from Supabase.
  - Accessible via Navbar. Unauthenticated access redirects to `<Auth />`.

- **[ 'plans' view ] — Billing** (`src/components/Billing.jsx`)
  - Protected route. Renders subscription tier cards (Basic / Standard / Premium).
  - Triggers `fetch('/api/initiate-payment')` on tier selection → displays GCash QR code modal.
  - `fetch('/api/payment-history')` populates the Invoice History modal (lifted to `App.jsx`).
  - Credit ledger transaction types: `TIER_PURCHASE`, `DAILY_REFILL`, `BASIC_TOKEN_BUY`.

- **[ 'profile' view ] — Profile** (`src/components/Profile.jsx`)
  - Protected route. Displays user metadata, current tier, credit balance, and account management controls.
  - Contains `<DeleteAccountButton />` for permanent account removal.

- **[ /Terms ] — Terms of Service** (`src/components/legal/Terms.jsx`)
  - Public route. Rendered via `LegalLayout.jsx` (two-column sidebar layout).
  - URL synced via `window.history.pushState`.

- **[ /Privacy ] — Privacy Policy** (`src/components/legal/Privacy.jsx`)
  - Public route. Same layout as Terms. Sidebar navigation with anchor-linked sections.

---

## IV. COMPONENT & DIRECTORY SKELETON

### 4.1 Root-Level Structure

```
CareerSync_Clone/
├── index.html                  # SPA entry shell — loads /src/main.jsx
├── package.json                # Dependency manifest (name: "hiresync")
├── vite.config.js              # Vite + React plugin + SingleFile bundler
├── tailwind.config.js          # Design token definitions (colors, fonts, easing)
├── postcss.config.js           # PostCSS processor config
├── vercel.json                 # Deployment: API rewrites + SPA fallback
├── eslint.config.js            # ESLint 9 flat config
├── supabase_schema.sql         # Raw DDL schema for Supabase PostgreSQL
├── supabase_migrations/        # 14 incremental SQL migration files
├── .env.local                  # [PRIVATE] VITE_ and API secrets (not committed)
└── public/                     # Static assets served at root (6 files)
```

### 4.2 Frontend Source (`src/`)

```
src/
├── main.jsx                    # React DOM root — mounts <App /> into #root
├── App.jsx                     # ★ Master Router & Session Controller
│                               #   - GlobalErrorBoundary (class component)
│                               #   - Lenis smooth scroll initialization (RAF loop)
│                               #   - Zustand state subscriptions
│                               #   - navigateTo() (history.pushState wrapper)
│                               #   - fetchInvoiceHistory() (lifted from Billing)
│                               #   - All view rendering logic (renderView switch)
│
├── supabaseClient.js           # Supabase client singleton (createClient)
│
├── index.css                   # Global CSS: Tailwind directives + Mathematical
│                               #   Visual Engine (HSL custom properties, light/dark)
│                               #   Custom keyframes: shimmer, marquee, spin
│
├── App.css                     # Minimal layout overrides
│
├── components/
│   ├── Landing.jsx             # Public marketing page (hero, features, FAQ, pricing)
│   ├── Auth.jsx                # Login / Register / Password Reset UI
│   ├── Navbar.jsx              # Global navigation bar (hidden during QR payment modal)
│   ├── CoreEngine.jsx          # Resume + JD upload → AI analysis trigger
│   ├── AnalysisTabs.jsx        # Tabbed AI report viewer + PDF export
│   ├── HistoryDashboard.jsx    # Paginated past analysis history
│   ├── Billing.jsx             # Subscription tier cards + PayMongo QR payment
│   ├── Profile.jsx             # User account settings + credit balance display
│   ├── Simulation.jsx          # Blurred UI preview with play button (in Landing)
│   ├── ContactModal.jsx        # Inbound sales contact form modal
│   ├── AuthSocialProof.jsx     # Social proof block rendered on Auth page
│   ├── UpdatePassword.jsx      # Password reset form (renders on PASSWORD_RECOVERY)
│   │
│   ├── animations/             # Reusable animated UI primitives
│   │   ├── SwipeLettersButton.jsx    # Letter-swipe hover animation CTA button
│   │   ├── SlideInButton.jsx         # Slide-in reveal button
│   │   ├── OriginButton.jsx          # Origin-point expand button
│   │   ├── NeumorphismButton.jsx     # Neumorphic depth button
│   │   ├── ThemeToggleButton.jsx     # Dark/light mode toggle with animation
│   │   ├── SmartTypewriterText.jsx   # Typewriter text reveal component
│   │   ├── FAQSection.jsx            # FAQ wrapper with single-active accordion
│   │   ├── FAQItem.jsx               # Individual accordion item (open/close)
│   │   └── DeleteAccountButton.jsx   # Destructive action button with confirmation
│   │
│   ├── ui/                     # Base-level UI primitives
│   │   ├── Button.jsx          # Standard button variant system
│   │   ├── Toast.jsx           # Global notification toast system
│   │   ├── Tooltip.jsx         # Hover tooltip wrapper
│   │   ├── GatedFeature.jsx    # Tier-locked feature wrapper (shows upgrade prompt)
│   │   └── card-1.jsx          # Bento-style card primitive
│   │
│   └── legal/                  # Legal page components
│       ├── LegalLayout.jsx     # Two-column sidebar layout shell for legal pages
│       ├── Terms.jsx           # Terms of Service content + sidebar navigation
│       └── Privacy.jsx         # Privacy Policy content + sidebar navigation
│
├── core/
│   └── billing/                # Billing business logic (separated from UI)
│       ├── useBilling.js       # Custom hook: tier selection, payment flow, state
│       ├── initiatePaymentLogic.js  # Payment initiation handler
│       ├── webhookLogic.js     # Payment webhook processing logic
│       ├── tierConfig.js       # Tier definitions (names, credit amounts, prices)
│       └── corsHelper.js       # CORS header helper for billing routes
│
├── lib/
│   ├── tierPermissions.js      # Feature gate map: tier → allowed features list
│   └── utils.js                # Utility helpers (e.g., cn() classname merger)
│
├── store/
│   └── useWorkspaceStore.jsx   # Zustand global store:
│                               #   - analysisData (AI report payload)
│                               #   - isAnalyzing (loading flag)
│                               #   - creditBalance + fetchCreditBalance()
│                               #   - isDark (theme preference)
│                               #   - resetWorkspace()
│
└── utils/
    └── (utility helpers)
```

### 4.3 Serverless API (`api/`)

```
api/
├── analyze.js            # POST /api/analyze
│                         #   Input: resume text + job description
│                         #   Engine: Google Gemini (Apex-ATS v2.0 system prompt)
│                         #   Output: ATS score, trajectory score, transferable skills,
│                         #           cover letter (tone-calibrated)
│
├── parse.js              # POST /api/parse
│                         #   Input: uploaded file (PDF, DOCX, TXT)
│                         #   Engine: pdf-parse (dev dependency)
│                         #   Output: raw extracted text string
│
├── initiate-payment.js   # POST /api/initiate-payment
│                         #   Input: userId, tier, amount
│                         #   Engine: PayMongo API → EMVCo QR generation
│                         #   Output: QR code data for GCash payment
│
├── payment-history.js    # GET /api/payment-history
│                         #   Auth: Bearer token (authMiddleware)
│                         #   Output: credit ledger rows (TIER_PURCHASE, DAILY_REFILL,
│                         #           BASIC_TOKEN_BUY) from Supabase
│
├── contact.js            # POST /api/contact
│                         #   Input: name, email, message
│                         #   Output: Forwards contact form submissions
│
└── _lib/                 # Shared serverless utilities (not publicly routed)
    ├── authMiddleware.js  # Validates Supabase Bearer JWT on protected routes
    ├── corsHelper.js      # Injects CORS headers for cross-origin API calls
    ├── emvco.js           # EMVCo QR code generation spec implementation
    └── tierConfig.js      # Server-side tier configuration (mirrors src/core/billing)

api/user/                  # User-scoped API routes
api/webhooks/              # PayMongo incoming webhook handler
```

### 4.4 Database (`supabase_migrations/` + `supabase_schema.sql`)

> Supabase PostgreSQL. 14 incremental migration files. Schema covers: `users` profile table, `analyses` (stored AI reports), `credit_transactions` ledger, and payment records. Daily credit refill automation via `pg_cron` SQL function (Standard: 40 cr/day, Premium: 50 cr/day). Row-Level Security (RLS) enforced on all tables.

---

## V. DESIGN SYSTEM SPECIFICATION

### 5.1 Mathematical Visual Engine (Light Mode)

| Token | HSL Value | Role |
|---|---|---|
| `background` | `hsl(0 0% 92%)` | Page base (darkest layer) |
| `surface` / `card` | `hsl(0 0% 96%)` | Card/panel elevation |
| `popover` | `hsl(0 0% 100%)` | Highest elevation (modals) |
| `obsidian` | `hsl(0 0% 5%)` | Primary text / brand black |
| `slate` | `hsl(0 0% 15%)` | Secondary text |
| `champagne` | `hsl(40 40% 60%)` | Accent / brand gold |

### 5.2 Mathematical Visual Engine (Dark Mode)

| Token | HSL Value | Role |
|---|---|---|
| `darkBg` | `hsl(0 0% 0%)` | True black base |
| `darkCard` | `hsl(0 0% 5%)` | Card elevation (+5%) |
| `popover` | `hsl(0 0% 10%)` | Modal elevation (+10%) |
| `darkText` | `hsl(0 0% 100%)` | Primary text (white) |

> **Background Pattern:** `radial-gradient` dot grid at `40px × 40px` spacing, using `foreground/5` opacity. Applied globally via `@layer base` in `index.css`.

### 5.3 Typography

| Font | Variable | Usage |
|---|---|---|
| **Inter** | `font-sans` | Body, UI labels, numeric data |
| **Playfair Display** | `font-drama` | Hero headlines, editorial display text |
| **JetBrains Mono** | `font-mono` | Code, scores, credit values, badges |

### 5.4 Custom Animation Keyframes

| Name | Duration | Usage |
|---|---|---|
| `shimmer` | `2.5s infinite linear` | Loading skeleton shimmer overlay |
| `marquee` | `30–50s infinite linear` | Social proof / logo scrolling ticker |
| `spin` (slow) | `3s infinite linear` | Ambient decorative spin elements |

### 5.5 Custom Easing Functions

| Token | Cubic-Bezier | Character |
|---|---|---|
| `physical` | `cubic-bezier(0.68, -0.55, 0.26, 1.55)` | Bouncy elastic overshoot |
| `smooth` | `cubic-bezier(0.4, 0, 0.2, 1)` | Material Design standard ease |

---

## VI. DEPLOYMENT INFRASTRUCTURE

```
Platform:       Vercel (framework: vite)
Routing:        /api/(.*)  →  Vercel Serverless Functions (api/ directory)
                /(.*)      →  index.html (SPA client-side routing fallback)
Environment:    .env.local (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY,
                           GOOGLE_GEMINI_API_KEY, PAYMONGO_SECRET_KEY)
Analytics:      @vercel/analytics (zero-config, injected at deployment layer)
Build Output:   dist/ (Vite production bundle)
```

---

*End of Document — Career Sync Master Architecture SOP v1.0*
