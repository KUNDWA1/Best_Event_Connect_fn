# Event Connect — Project Documentation
## Course: Best Programming Practices and Design Patterns
## Instructor: RUTARINDWA JEAN PIERRE

---

# PHASE 1: System Analysis & Design

---

## 1. General Description and Analysis of the Case Study

**Project Name:** Event Connect — Professionalising Rwanda's Event Industry through Systems, Skills, and Technology

**Case Study Overview:**
Rwanda's events and MICE (Meetings, Incentives, Conferences, Exhibitions) sector has historically operated through fragmented, manual, and informal processes. Event hosts struggle to find reliable vendors, vendors face inconsistent income and delayed payments, and coordination between stakeholders lacks structure and digital support.

Event Connect is a web-based platform that connects three core user groups — Event Planners, Vendors/Service Providers, and Platform Administrators — into a unified, structured digital ecosystem.

**Tech Stack:**
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + NestJS + Prisma ORM
- Database: PostgreSQL
- Authentication: JWT + Passport
- File Storage: Cloudinary
- Payments: MTN MoMo, Airtel Money, M-Pesa (escrow-based)
- Real-time: Socket.IO (WebRTC for voice/video)
- Hosting: versol
- Version Control: GitHub


---

## 2. Problems Faced by the Organization

| # | Problem | Impact |
|---|---------|--------|
| 1 | Fragmented, manual event planning with no central coordination tool | Inefficiency, errors, missed deadlines |
| 2 | Event hosts cannot easily identify or verify reliable vendors | Poor service quality, wasted time |
| 3 | Vendors face inconsistent income and delayed or no payments | Financial insecurity, low motivation |
| 4 | No secure payment mechanism between planners and vendors | Risk of fraud, disputes, non-delivery |
| 5 | Limited digital literacy among youth in the events sector | Low platform adoption, skills gap |
| 6 | No standardized rating or quality assurance system | No accountability, inconsistent service |
| 7 | Language barrier — most platforms are English-only | Excludes Kinyarwanda-speaking users |
| 8 | No centralized communication channel between stakeholders | Miscommunication, coordination failures |

---

## 3. Functional Diagram — Internal Working of Event Connect

```
+---------------------------------------------------------------------+
|                        EVENT CONNECT PLATFORM                        |
|                                                                       |
|  +--------------+    +----------------------+    +---------------+  |
|  |   EVENT       |    |    PLATFORM CORE      |    |    VENDOR     |  |
|  |   PLANNER     |    |                       |    |   / SERVICE   |  |
|  |               |    |  +----------------+   |    |   PROVIDER    |  |
|  | - Create Event+---->  |  Auth Service  |   <----+               |  |
|  | - Search      |    |  |  (JWT/Passport)|   |    | - Register    |  |
|  |   Vendors     |    |  +----------------+   |    | - List        |  |
|  | - Book Vendor |    |                       |    |   Services    |  |
|  | - Track Budget|    |  +----------------+   |    | - Manage      |  |
|  | - Manage      |    |  |  Event Service |   |    |   Bookings    |  |
|  |   Guests      |    |  +----------------+   |    | - Receive     |  |
|  | - Chat        |    |                       |    |   Payments    |  |
|  | - Pay Vendors |    |  +----------------+   |    | - Chat        |  |
|  +---------------+    |  | Booking Service|   |    +---------------+  |
|                       |  +----------------+   |                       |
|  +--------------+    |                       |    +---------------+  |
|  |    ADMIN      |    |  +----------------+   |    |   EXTERNAL    |  |
|  |               |    |  |Payment Service |   |    |   SERVICES    |  |
|  | - Manage Users+---->  |  (Escrow)      |   |    |               |  |
|  | - Verify      |    |  +----------------+   |    | - MTN MoMo    |  |
|  |   Vendors     |    |                       |    | - Airtel Money|  |
|  | - Manage      |    |  +----------------+   |    | - M-Pesa      |  |
|  |   Categories  |    |  |  Chat Service  |   |    | - Cloudinary  |  |
|  | - Release     |    |  |  (Socket.IO)   |   |    | - Nodemailer  |  |
|  |   Escrow      |    |  +----------------+   |    +---------------+  |
|  | - View Reports|    |                       |                       |
|  +---------------+    |  +----------------+   |                       |
|                       |  |  PostgreSQL DB  |   |                       |
|                       |  |  (via Prisma)   |   |                       |
|                       |  +----------------+   |                       |
|                       +----------------------+                       |
+---------------------------------------------------------------------+
```

**Data Flow:**
1. Users register/login → Auth Service issues JWT token
2. Planners create events → Event Service stores in PostgreSQL
3. Planners search vendors → Vendor Service returns filtered results
4. Planner books vendor → Booking Service creates booking record
5. Payment initiated → Payment Service holds funds in escrow
6. Vendor delivers service → Planner confirms → Admin releases escrow
7. Both parties chat → Chat Service via Socket.IO WebSocket
8. Admin monitors all activity → Admin Dashboard with full CRUD access

---

## 4. UML Diagrams

### 4.1 Use Case Diagram

```
                        EVENT CONNECT SYSTEM
+------------------------------------------------------------------+
|                                                                    |
|  +-----------+                           +-----------------+      |
|  |           |---- Register/Login ------->                 |      |
|  |  EVENT    |---- Create Event --------->                 |      |
|  |  PLANNER  |---- Search Vendors ------->                 |      |
|  |           |---- Book Vendor ---------->  EVENT CONNECT  |      |
|  |           |---- Make Payment --------->    SYSTEM       |      |
|  |           |---- Manage Guests -------->                 |      |
|  |           |---- Chat with Vendor ----->                 |      |
|  |           |---- View Bookings -------->                 |      |
|  +-----------+---- Rate Vendor ---------->                 |      |
|                                           |                 |      |
|  +-----------+                           |                 |      |
|  |           |---- Register/Login ------->                 |      |
|  |  VENDOR   |---- Create Profile ------->                 |      |
|  |           |---- Add Service Packages ->                 |      |
|  |           |---- Manage Bookings ------>                 |      |
|  |           |---- Chat with Planner ---->                 |      |
|  |           |---- View Earnings -------->                 |      |
|  +-----------+---- Receive Payment ------>                 |      |
|                                           |                 |      |
|  +-----------+                           |                 |      |
|  |           |---- Manage Users --------->                 |      |
|  |   ADMIN   |---- Verify Vendors ------->                 |      |
|  |           |---- Manage Categories ---->                 |      |
|  |           |---- Release Escrow ------->                 |      |
|  |           |---- View Reports --------->                 |      |
|  +-----------+---- Manage Disputes ------>                 |      |
|                                           |                 |      |
|  +-----------+                           |                 |      |
|  |  PUBLIC   |---- View Public Events --->                 |      |
|  |   USER    |---- Book Event as Guest -->                 |      |
|  +-----------+                           +-----------------+      |
+------------------------------------------------------------------+
```

---

### 4.2 Class Diagram

```
+---------------------+         +---------------------+
|        User          |         |        Event         |
+---------------------+         +---------------------+
| - userId: string     |         | - id: string         |
| - firstName: string  |         | - title: string      |
| - lastName: string   |         | - description: string|
| - email: string      |         | - eventType: string  |
| - password: string   |         | - status: string     |
| - phone: string      |         | - visibility: string |
| - role: UserRole     |         | - startDate: Date    |
| - createdAt: Date    |         | - endDate: Date      |
+---------------------+         | - location: string   |
| + register()         |         | - budget: number     |
| + login()            |         | - guestCount: number |
| + logout()           |         | - userId: string     |
| + updateProfile()    |         +---------------------+
+----------+----------+         | + create()           |
           |                    | + update()           |
      extends                   | + delete()           |
    +-------+------+            +----------+----------+
    |              |                       | 1..*
    v              v                       v
+--------+    +---------+      +---------------------+
|Planner |    | Vendor  |      |    EventService      |
+--------+    +---------+      +---------------------+
| -events|    |-business|      | - id: string         |
|        |    | Name    |      | - eventId: string    |
|        |    |-bio     |      | - category: string   |
|        |    |-location|      | - title: string      |
|        |    |-verified|      | - budget: number     |
+--------+    +---------+      | - quantity: number   |
|+create |    |+addPkg()|      +---------------------+
| Event()|    |+getBook |
|+book   |    | ings()  |      +---------------------+
| Vendor()|   +---------+      |       Booking        |
+--------+         |           +---------------------+
                   | 1..*      | - id: string         |
                   v           | - packageId: string  |
    +---------------------+   | - eventId: string    |
    |   ServicePackage     |   | - vendorId: string   |
    +---------------------+   | - plannerId: string  |
    | - id: string         |   | - status: string     |
    | - category: string   |   | - bookingDate: Date  |
    | - title: string      |   | - price: number      |
    | - description: string|   +---------------------+
    | - minPrice: number   |   | + create()           |
    | - maxPrice: number   |   | + confirm()          |
    | - vendorId: string   |   | + reject()           |
    +---------------------+   | + cancel()           |
    | + create()           |   +---------------------+
    | + update()           |
    | + delete()           |   +---------------------+
    +---------------------+   |       Payment        |
                               +---------------------+
    +---------------------+   | - id: string         |
    |        Guest         |   | - bookingId: string  |
    +---------------------+   | - amount: number     |
    | - id: string         |   | - status: string     |
    | - eventId: string    |   | - method: string     |
    | - fullName: string   |   | - escrowHeld: boolean|
    | - email: string      |   | - releasedAt: Date   |
    | - phone: string      |   +---------------------+
    | - category: string   |   | + initiate()         |
    | - tableNumber: string|   | + holdEscrow()       |
    | - rsvpStatus: string |   | + release()          |
    +---------------------+   | + refund()           |
    | + add()              |   +---------------------+
    | + update()           |
    | + delete()           |
    | + importCSV()        |
    +---------------------+
```

---

### 4.3 Activity Diagram — Booking Flow

```
  PLANNER                 SYSTEM                    VENDOR
     |                       |                         |
     v                       |                         |
 [Login]                     |                         |
     |                       |                         |
     v                       |                         |
 [Create Event]              |                         |
     |---Save Event---------->|                         |
     |                       |                         |
     v                       |                         |
 [Search Vendors]            |                         |
     |---Filter by Category-->|                         |
     |<--Return Vendor List---|                         |
     |                       |                         |
     v                       |                         |
 [View Vendor Profile]       |                         |
     |                       |                         |
     v                       |                         |
 [Select Package & Book]     |                         |
     |---Submit Booking------>|                         |
     |                       |---Notify Vendor--------->|
     |                       |                         |
     |                       |                  [Review Booking]
     |                       |                         |
     |                       |              +----------+----------+
     |                       |              |                     |
     |                       |          [Confirm]             [Reject]
     |                       |              |                     |
     |                       |<--Update Booking Status-----------+
     |<--Notify Planner------|                         |
     |                       |                         |
     v                       |                         |
 [Make Payment]              |                         |
     |---Initiate Payment---->|                         |
     |                       |                         |
     |               [Hold in Escrow]                  |
     |                       |                         |
     |<--Payment Confirmed---|                         |
     |                       |                         |
     v                       |                         |
 [Event Execution]           |                         |
     |                       |                  [Deliver Service]
     |                       |                         |
     v                       |                         |
 [Confirm Delivery]          |                         |
     |---Confirm Delivery---->|                         |
     |                       |---Release Escrow-------->|
     |                       |                         |
     v                       |                         v
 [Rate Vendor]          [Update Records]        [Receive Payment]
     |                       |                         |
     v                       v                         v
  [END]                   [END]                     [END]
```

---

### 4.4 Sequence Diagram — Vendor Booking & Payment

```
Planner    Frontend    AuthService   EventService  BookingService  PaymentService  Vendor
   |           |            |              |               |               |          |
   |--login()->|            |              |               |               |          |
   |           |--validate()->            |               |               |          |
   |           |<--token----|              |               |               |          |
   |<-dashboard|            |              |               |               |          |
   |           |            |              |               |               |          |
   |--createEvent()-------->|              |               |               |          |
   |           |            |--saveEvent()->               |               |          |
   |           |            |<--eventId----|               |               |          |
   |<-eventCreated---------|              |               |               |          |
   |           |            |              |               |               |          |
   |--searchVendors()------>|              |               |               |          |
   |           |            |--getVendors()->              |               |          |
   |           |            |<--vendorList--|               |               |          |
   |<-vendorList-----------|              |               |               |          |
   |           |            |              |               |               |          |
   |--bookVendor()---------------------------------------->|               |          |
   |           |            |              |               |--notifyVendor()--------->|
   |           |            |              |               |               |          |
   |           |            |              |               |<--confirm()--------------| 
   |<-bookingConfirmed------------------------------------|               |          |
   |           |            |              |               |               |          |
   |--makePayment()-------------------------------------------------------->|          |
   |           |            |              |               |               |--hold()  |
   |           |            |              |               |               |--escrow->|
   |<-paymentConfirmed-----------------------------------------------------|          |
   |           |            |              |               |               |          |
   |--confirmDelivery()---------------------------------------------------->|          |
   |           |            |              |               |               |--release->|
   |<-complete-------------|              |               |               |          |
```

---

### 4.5 Component Diagram

```
+-------------------------------------------------------------------------+
|                         EVENT CONNECT SYSTEM                             |
|                                                                           |
|  +--------------------------------------------------------------------+  |
|  |                     FRONTEND (React 18 / Vite)                      |  |
|  |                                                                      |  |
|  |  +------------+  +--------------+  +----------------------------+  |  |
|  |  | Auth Pages  |  | Planner Pages|  |       Vendor Pages          |  |  |
|  |  | - Login     |  | - Dashboard  |  | - VendorDashboard           |  |  |
|  |  | - Register  |  | - CreateEvent|  | - ServicePackages           |  |  |
|  |  +------+------+  | - PublicEvts |  | - Bookings / Earnings       |  |  |
|  |         |         +------+-------+  +-------------+--------------+  |  |
|  |         |                |                        |                  |  |
|  |  +------v----------------v------------------------v--------------+  |  |
|  |  |                    Shared Components                           |  |  |
|  |  | Navbar | Footer | DashboardSidebar | BookingModal | Chat       |  |  |
|  |  +---------------------------+------------------------------------+  |  |
|  |                              |                                       |  |
|  |  +---------------------------v------------------------------------+  |  |
|  |  |               State & Services Layer                           |  |  |
|  |  | AuthContext | ThemeContext | useEvents | useBookings | api.ts  |  |  |
|  |  +---------------------------+------------------------------------+  |  |
|  +------------------------------|--------------------------------------+  |
|                                 | HTTP/REST + WebSocket                   |
|  +------------------------------v--------------------------------------+  |
|  |                        BACKEND (NestJS)                              |  |
|  |                                                                      |  |
|  |  +----------+ +----------+ +----------+ +----------+ +----------+  |  |
|  |  |Auth      | |Event     | |Vendor    | |Booking   | |Payment   |  |  |
|  |  |Module    | |Module    | |Module    | |Module    | |Module    |  |  |
|  |  |JWT/Pass  | |CRUD ops  | |Profile   | |Escrow    | |MoMo/     |  |  |
|  |  +----------+ +----------+ +----------+ +----------+ |Airtel    |  |  |
|  |                                                       +----------+  |  |
|  |  +----------+ +----------+ +----------+                            |  |
|  |  |Chat      | |Guest     | |Admin     |                            |  |
|  |  |Module    | |Module    | |Module    |                            |  |
|  |  |Socket.IO | |QR Check  | |User mgmt |                            |  |
|  |  +----------+ +----------+ +----------+                            |  |
|  |                                                                      |  |
|  |  +------------------------------------------------------------------+  |  |
|  |  |                    Prisma ORM Layer                               |  |  |
|  |  +------------------------------+-----------------------------------+  |  |
|  +--------------------------------|--------------------------------------+  |
|                                   |                                         |
|  +--------------------------------v--------------------------------------+  |
|  |                     PostgreSQL Database                                |  |
|  | Users | Events | EventServices | Vendors | Bookings | Payments        |  |
|  | Messages | Guests | Reviews | Categories | Announcements              |  |
|  +------------------------------------------------------------------------+  |
|                                                                           |
|  +------------------------------------------------------------------------+  |
|  |                      External Services                                  |  |
|  | Cloudinary (Media) | MTN MoMo | Airtel Money | Nodemailer (Email)      |  |
|  +------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
```

---

---

# PHASE 2: Software Prototype & Design Patterns

---

## 1. Software Development Prototype Summary

Event Connect follows a component-based architecture using React 18 and TypeScript. The prototype is structured into clear layers:

| Layer | Location | Responsibility |
|-------|----------|---------------|
| Pages | `src/pages/` | Route-level views (Login, Dashboard, CreateEvent, PublicEvents) |
| Components | `src/components/` | Reusable UI pieces (Navbar, BookingModal, DashboardSidebar) |
| Context | `src/context/` | Global state management (Auth, Theme) |
| Hooks | `src/hooks/` | Reusable stateful logic (useEvents, useBookings) |
| Services | `src/services/` | API calls and external service logic (api.ts, webrtc.ts) |
| Utils | `src/utils/` | Pure helper functions (eventCategories.ts) |
| Locales | `src/locales/` | i18n translations (en, fr, rw) |

**Coding Standards Applied (Google TypeScript Style Guide):**
- Strict TypeScript typing throughout — no `any` except where unavoidable
- Named exports for components and utilities
- Custom hooks prefixed with `use` (useEvents, useBookings, useAuth)
- Single responsibility per component/hook
- Environment variables via `.env` — no hardcoded API URLs in source
- Consistent file naming: PascalCase for components, camelCase for hooks/utils

---

## 2. Design Pattern Selected: Context/Provider Pattern (Observer Pattern Variant)

### 2.1 Pattern Overview

The **Context/Provider Pattern** is a structural pattern in React that implements the core concept of the **Observer Pattern** from the Gang of Four (GoF) design patterns.

- **Subject (Observable):** The Context Provider — holds state and notifies subscribers on change
- **Observers:** Any component that calls `useContext()` — automatically re-renders when state changes
- **Subscription mechanism:** The `useAuth()` and `useTheme()` custom hooks

### 2.2 Why This Pattern Was Chosen

The Event Connect frontend has three distinct user roles (Planner, Vendor, Admin), each with different dashboards, permissions, and UI states. Authentication state — who is logged in, their role, and their JWT token — must be accessible across dozens of components without prop drilling.

The Context/Provider pattern solves this by:
- Centralizing auth state in one place (`AuthContext.tsx`)
- Making it globally available to any component via `useAuth()`
- Automatically propagating state changes (login/logout) to all subscribed components

### 2.3 Implementation in Event Connect

#### Step 1 — Define the Context (Subject)

File: `src/context/AuthContext.tsx`

```typescript
// 1. Create the context (the Subject)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Define the Provider — wraps the app and holds state
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login — updates state, notifies all observers
  const login = async (email: string, password: string) => {
    setLoading(true);
    const response = await loginUser({ email, password });
    setUser(response.data.user);
    setIsAuthenticated(true);
    localStorage.setItem('token', response.data.token);
    setLoading(false);
  };

  // Logout — clears state, notifies all observers
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, error, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### Step 2 — Create the Observer Hook

```typescript
// The subscription mechanism — any component calls this to observe auth state
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

#### Step 3 — Register the Provider at App Root

File: `src/main.tsx`

```typescript
// The Provider wraps the entire app — all components become potential observers
<AuthProvider>
  <ThemeProvider>
    <App />
  </ThemeProvider>
</AuthProvider>
```

#### Step 4 — Components Subscribe (Observe)

```typescript
// Navbar.tsx — observes isAuthenticated and user
const { user, isAuthenticated, logout } = useAuth();
// Re-renders automatically when login/logout happens

// VendorDashboard.tsx — observes user to load vendor-specific data
const { user } = useAuth();
useEffect(() => {
  if (user) loadVendorData(user.userId);
}, [user]);

// api.ts — observes token from localStorage (set by AuthContext)
const token = localStorage.getItem('token');
headers: { Authorization: `Bearer ${token}` }
```

### 2.4 Observer Pattern Flow Diagram

```
                +-----------------------------+
                |         main.tsx             |
                |   <AuthProvider>             |
                |     <ThemeProvider>          |
                |       <App />                |
                |     </ThemeProvider>         |
                |   </AuthProvider>            |
                +-------------+---------------+
                              |
                              | provides context to all children
                              v
                +-----------------------------+
                |       AuthContext            |
                |   (Subject / Observable)     |
                |                             |
                |  state: {                   |
                |    user,                    |
                |    isAuthenticated,         |
                |    loading,                 |
                |    error                    |
                |  }                          |
                |  actions: {                 |
                |    login(),                 |
                |    logout(),                |
                |    register()               |
                |  }                          |
                +-------------+---------------+
                              |
              useAuth() subscription (Observer hook)
                              |
        +---------------------+---------------------+
        |           |           |          |         |
        v           v           v          v         v
  +--------+  +--------+  +--------+  +------+  +------+
  | Navbar |  |Vendor  |  |Planner |  |Login |  |api.ts|
  |        |  |Dash    |  |Dash    |  |Page  |  |      |
  |shows   |  |loads   |  |loads   |  |calls |  |reads |
  |user    |  |vendor  |  |planner |  |login(|  |token |
  |menu or |  |data by |  |events  |  |)     |  |from  |
  |login   |  |userId  |  |by role |  |      |  |local |
  |button  |  |        |  |        |  |      |  |Store |
  +--------+  +--------+  +--------+  +------+  +------+
```

### 2.5 All Design Patterns Present in the Codebase

| Pattern | Category | Where Applied | How |
|---------|----------|--------------|-----|
| **Context/Provider (Observer)** | Behavioral | `AuthContext.tsx`, `ThemeContext.tsx` | Centralized state broadcast to all subscribed components |
| **Custom Hook Pattern** | Structural | `useEvents.ts`, `useBookings.ts`, `useVoiceCall.ts` | Encapsulates reusable stateful logic into composable hooks |
| **Facade Pattern** | Structural | `src/services/api.ts` | Single unified interface hiding HTTP complexity, token management, and error normalization |
| **Strategy Pattern** | Behavioral | `src/utils/eventCategories.ts` | `resolveEventTypeSelection()` applies different resolution strategies based on category input |
| **Factory Pattern** | Creational | `src/services/api.ts` — `createEventWithServices()` | Creates complex objects (event + services) through a single factory function |

---

## 3. Prototype Sprint Delivery Summary

| Phase | Weeks | Key Features Delivered |
|-------|-------|----------------------|
| Phase 1 — Core | 1–3 | Auth, Vendor Listing, Booking, Payment Integration, Chat |
| Phase 2 — MVP | 4–6 | Budget Planner, Reviews, QR Check-in, Guest Management |
| Phase 3 — Pilot | 7–8 | Task Management, Push Notifications, Bilingual Support, Mobile Optimization |

---