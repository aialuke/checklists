# **PWA Plan for JB Department Checklists**

## **1. App Overview**

**Core Purpose**: Migrate retail staff from paper to digital checklists, enabling team members to complete daily opening and closing tasks efficiently and managers to track and review progress in real-time.  
**Target Users**: Internal tool for retail store team members and managers to manage department-specific checklists (e.g., Computers, Electronics) on store devices (e.g., tablets, phones).  
**Key Objective**: Driven Productivity—streamline task completion with minimal app time, supporting shared progress, real-time oversight, and offline functionality.

---

## **2. Technical Foundation**

### **Stack Preferences**
```
Frontend: React 19 (via Next.js 15)
Build Tool: Next.js 15 with App Router
UI Framework: Tailwind CSS 4
State Management: TanStack Query v5 (server state), React useState/Context API (client state)
Backend: Next.js 15 API Routes (Server Components + Route Handlers)
Hosting: Vercel (app), local server (PostgreSQL)
Database: PostgreSQL (via Prisma v6)
PWA: Next.js native PWA support with manifest.ts
```

### **PWA Configuration**
- **Offline Strategy**: Next.js 15 native caching with `fetch()` cache strategies (`force-cache`, `no-store`, `revalidate`) combined with TanStack Query persistence
- **Update Strategy**: Server Components for static data, TanStack Query optimistic updates for mutations, and periodic refetching (every 30 seconds) for dashboard progress
- **Service Worker**: Minimal, generated automatically by Next.js for PWA manifest and basic caching

---

## **3. Core Features**

### **Feature 1: User Login**
- **What it does**: Staff log in using their staff number, with the system verifying their preset role (team member or manager) against the PostgreSQL database. Team members select their department daily (e.g., "Computers"), while managers access a uniform checklist. No password or signup is needed for this internal tool.  
- **User flow**:  
  1. Staff open the app on a store device (e.g., tablet).  
  2. Enter staff number in a text field on `/auth`.  
  3. Team members select department from a dropdown; managers skip this.  
  4. Click "Login" to access `/checklists` (team members) or `/dashboard` (managers).  
- **Data needed**:  
  - **Uses**: Staff number, role from `Staff` table; department list from static array.  
  - **Creates**: Session data (staff number, name, role, department) stored in React Context.  
- **Offline behavior**: Unavailable offline (requires database verification). Cached session data allows access to other pages if recently logged in.  
- **UI components needed**:  
  - Form with text input (`h-12`, `rounded-xl`) for staff number.  
  - Dropdown (`h-12`, `rounded-xl`) for department (team members).  
  - Pill-style "Login" button (`rounded-full`, `bg-primary-500`, `#FDF351`).

### **Feature 2: Checklist Access**
- **What it does**: Displays daily Opening and Closing Checklists for a team member's selected department (e.g., "Computers"), identical for all department members, with 7–10 tasks each. Shows tasks completed by others (e.g., Sally sees John's ticks). Checklists are pre-loaded using Next.js SSG and available offline.  
- **User flow**:  
  1. Team member logs in, redirected to `/checklists`.  
  2. Sees checklist cards (Opening, Closing) with progress (e.g., "3/7 Tasks Complete").  
  3. Clicks a card to view tasks on `/checklists/[id]`, with completed tasks marked by ticks.  
- **Data needed**:  
  - **Uses**: Checklist data (department, type, tasks) from `Checklists` and `Tasks` tables, fetched via TanStack Query.  
  - **Creates**: None (read-only).  
- **Offline behavior**: Accessible via Next.js `force-cache` fetch strategy and TanStack Query persistence, showing last-known task statuses.  
- **UI components needed**:  
  - Checklist cards (`bg-surface-card`, `#EEE5E9`, `rounded-xl`, `p-4`).  
  - Task list with checkboxes (`h-6 w-6`, disabled for completed tasks).  
  - Static tick icon (`check-square`, `text-primary-500`).

### **Feature 3: Task Completion**
- **What it does**: Team members mark tasks complete by tapping a checkbox, triggering a tick animation and static checked state. Updates are saved to the database via TanStack Query mutations with optimistic updates, visible to all department members (e.g., Sally sees John's tasks). Checklists auto-submit when all tasks are done, triggering a notification. Offline updates use TanStack Query persistence.  
- **User flow**:  
  1. Team member opens `/checklists/[id]` (e.g., Computers Opening).  
  2. Sees tasks, with others' completions (e.g., John's) marked by ticks.  
  3. Taps checkbox for a task, showing tick animation.  
  4. Completes all 7–10 tasks, auto-submitting the checklist.  
  5. Offline, updates persist locally and sync when online.  
- **Data needed**:  
  - **Uses**: Task data (description, completed, checklistId) from `Tasks` table; staff number from session.  
  - **Creates**: Updates `completed` (true), `completedAt`, `completedBy` in `Tasks` table.  
- **Offline behavior**: TanStack Query optimistic updates with persistence; mutations queue locally and sync when online.  
- **UI components needed**:  
  - Task list with checkboxes (`h-6 w-6`, `checked:bg-primary-500`).  
  - Animated tick icon (`check-square`, CSS transition, ~200ms).  
  - Static tick icon for completed tasks.

### **Feature 4: Real-Time Notifications**
- **What it does**: Sends managers instant notifications when a checklist is completed (e.g., "John completed Computers Opening Checklist"). Clicking a notification shows task details on `/dashboard`. Notifications are view-only and use Server-Sent Events.  
- **User flow**:  
  1. Team member completes a checklist, triggering auto-submission.  
  2. Manager sees notification in a list on `/dashboard`.  
  3. Clicks notification to view task details (e.g., who completed, timestamps).  
- **Data needed**:  
  - **Uses**: Checklist (department, type), task statuses, staff name from `Checklists`, `Tasks`, `Staff` tables.  
  - **Creates**: Notification event (via SSE, stored in React state).  
- **Offline behavior**: Unavailable offline (SSE requires connectivity). Cached dashboard data shows recent progress.  
- **UI components needed**:  
  - Notification list (`bg-surface-card`, `rounded-xl`, `text-secondary-500`, `#C5283D`).  
  - Clickable notifications linking to task details.

### **Feature 5: Manager Dashboard**
- **What it does**: Shows cards for each department's Opening and Closing Checklists, with progress (e.g., "3/7 Tasks Complete," tick/pending icons). Clicking a card displays task details (tick/no-tick, who completed, timestamps). Historical data (30 days, selectable by date) shows day, department, progress, and completer. Uses Next.js Server Components for initial data and TanStack Query for updates.  
- **User flow**:  
  1. Manager logs in, sees `/dashboard` with checklist cards.  
  2. Views progress (e.g., "3/7 Tasks Complete").  
  3. Clicks a card for task details.  
  4. Uses calendar picker to view historical data.  
  5. Offline, sees cached data.  
- **Data needed**:  
  - **Uses**: Checklist and task data from `Checklists`, `Tasks`, `Staff` tables.  
  - **Creates**: None (read-only).  
- **Offline behavior**: Next.js cache and TanStack Query persistence for offline access to progress and historical data.  
- **UI components needed**:  
  - Checklist cards (`bg-surface-card`, `rounded-xl`, `p-4`).  
  - Progress indicators (text, tick/pending icons).  
  - Task detail list (tick/no-tick, completer, timestamps).  
  - Calendar picker (`primary-500`, `#FDF351`).

### **Feature 6: Offline Support**
- **What it does**: Enables checklist viewing, task completion, and dashboard access in areas with intermittent connectivity using Next.js native caching and TanStack Query persistence. Task updates queue locally and sync when online.  
- **User flow**:  
  1. Team member views checklists and tasks offline on `/checklists`, `/checklists/[id]`.  
  2. Marks tasks, with optimistic updates and local queuing.  
  3. Manager views cached progress and historical data on `/dashboard`.  
  4. Updates sync automatically when online.  
- **Data needed**:  
  - **Uses**: Cached checklist/task data (Next.js fetch cache, TanStack Query persistence).  
  - **Creates**: Queued task updates (TanStack Query mutations with persistence).  
- **Offline behavior**: Next.js `force-cache` for static data, TanStack Query persistence for mutations, transparent syncing.  
- **UI components needed**: Same as Checklist Access, Task Completion, Manager Dashboard.

---

## **4. Data Structure**

The PostgreSQL database on a local server stores staff, checklists, and tasks to support login, shared task completion, notifications, and dashboards. Historical data is auto-deleted after 30 days to save storage.

### **Prisma Schema**

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Staff {
  id          String   @id @default(uuid())
  staffNumber String   @unique
  name        String
  role        Role
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  completedTasks Task[] @relation("CompletedBy")
  
  @@map("staff")
}

enum Role {
  TEAM_MEMBER
  MANAGER
}

model Checklist {
  id         String        @id @default(uuid())
  department String
  type       ChecklistType
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt
  
  // Relations
  tasks      Task[]
  
  @@unique([department, type])
  @@map("checklists")
}

enum ChecklistType {
  OPENING
  CLOSING
}

model Task {
  id          String    @id @default(uuid())
  checklistId String
  description String
  completed   Boolean   @default(false)
  completedAt DateTime?
  completedBy String?   // References Staff.staffNumber
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relations
  checklist        Checklist @relation(fields: [checklistId], references: [id], onDelete: Cascade)
  completedByStaff Staff?    @relation("CompletedBy", fields: [completedBy], references: [staffNumber])
  
  @@map("tasks")
}
```

---

## **5. Users**

- **Basic Info**:  
  - Preset in the PostgreSQL database by administrators (no signup).  
  - **Fields**: Staff Number (e.g., "12345"), Name (e.g., "John Smith"), Role ("TEAM_MEMBER" or "MANAGER").  
  - **Note**: Department is selected daily at login, stored in React Context, not database.  
  - **Purpose**: Supports authentication and task attribution.

- **Relationships**:  
  - **Team Members**: Create task completions in `Tasks` table (via `completedBy`). Session data (staff number, department) is temporary.  
  - **Managers**: View checklist progress and historical data on `/dashboard`, no data creation.  
  - **Purpose**: Links users to tasks for shared progress and notifications.

---

## **6. Checklists (Main Entity)**

- **Fields**:  
  - ID (UUID, primary key), Department (e.g., "Computers"; "Manager" for manager checklist), Type ("OPENING" or "CLOSING"), Tasks (7–10, linked via `Tasks` table).  
  - **Purpose**: Defines department checklists and manager checklist, supports shared progress and historical data (30 days, auto-deleted).

- **Create/Edit/Delete**:  
  - **Administrators**: Create/edit/delete checklists via database interface or script.  
  - **Team Members/Managers**: Cannot modify checklists; only complete tasks.  

- **Relationships**:  
  - **To Users**: Team members access checklists via selected department; managers view all or their uniform checklist.  
  - **To Tasks**: Each checklist links to 7–10 tasks via `checklistId`.  
  - **Purpose**: Central entity for task completion, notifications, and dashboard reporting.

---

## **7. Relationships**

- **Each user can have many task completions**: Users complete multiple tasks, recorded in `Tasks` table via `completedBy`.  
- **Each task belongs to one user (for completion)**: Task completions link to one staff number. Uncompleted tasks are unassigned.  
- **Tasks can be shared with other users**: Tasks are shared within a department via `checklistId`, visible to all members (e.g., Sally sees John's ticks).  
- **Each user can access many checklists**: Team members access department checklists; managers view all or their uniform checklist.  
- **Each checklist belongs to one department**: Linked via `department` field, except manager checklist.  
- **Each checklist has many tasks**: 7–10 tasks linked via `checklistId`.  
- **Purpose**: Enables collaborative task completion, notifications, and dashboard data.

---

## **8. Tools and Usage**

The following tools ensure a clean, maintainable, and optimized codebase, supporting the Next.js 15, React 19, TypeScript, and Tailwind CSS 4 stack for a productivity-driven app.

- **Prettier** (v3+):  
  - **Purpose**: Automatically formats code (JavaScript, TypeScript, JSX, CSS) for consistent style.  
  - **Usage**: Formats React 19 components (`.tsx`), Next.js 15 API routes, and Tailwind CSS 4 classes. Uses `prettier-plugin-tailwindcss` for class sorting. Integrated with Vercel CI/CD.  
  - **Config**: `semi: true`, `singleQuote: true`, `tabWidth: 2` in `prettier.config.js`.  

- **ESLint** (v9):  
  - **Purpose**: Lints code to catch errors and enforce best practices.  
  - **Usage**: Ensures code quality in React 19 components, Next.js 15 API routes, and TanStack Query logic. Uses `eslint-config-next` and accessibility plugins. Integrated with Vercel CI/CD.  
  - **Config**: Includes React 19 and Next.js 15 rules in `eslint.config.js`.

- **Knip**:  
  - **Purpose**: Detects unused files, exports, and dependencies to keep the codebase lean.  
  - **Usage**: Identifies unused components, API routes, or dependencies to reduce bundle size (~190 KB target). Configured to ignore dynamic imports.  
  - **Config**: Scans `src/**/*.{ts,tsx}`, excludes dynamic imports.

---

## **9. Interactions and Behaviors**

- **Login redirect uses Next.js navigation**: `redirect()` from `next/navigation` for server-side redirects after authentication verification.  
- **Form submission uses Server Actions**: Login form on `/auth` uses Next.js Server Actions for type-safe form handling and validation.  
- **Task completion uses optimistic updates**: TanStack Query `useMutation` with `onMutate` provides immediate UI feedback with automatic rollback on failure.  
- **Real-time updates use Server-Sent Events**: Dashboard notifications implemented with EventSource API for live updates.  
- **Success actions show toast notifications**: Task completion shows success toasts using React state with auto-hide after 2 seconds.  
- **Error handling uses Error Boundaries**: Comprehensive error catching with graceful fallbacks and retry mechanisms.  
- **Long lists use pagination**: Historical data on `/dashboard` uses cursor-based pagination for performance.

---

## **10. Pages and Navigation**

### **Page Structure**
```
/ → Landing Page (Server Component)
```
- **What it shows**: Brief welcome message and "Login" button linking to `/auth`.  
- **Details**: Static page using Next.js Server Component for optimal performance.

```
/auth → Login (Server + Client Components)
```
- **What it shows**: Server Action form for staff number and department selection. Server-side validation and redirect.  
- **Details**: Uses Next.js Server Actions for secure form handling and authentication.

```
/checklists → Checklist Selection (Server Component + TanStack Query)
```
- **What it shows**: Checklist cards with progress, fetched via Server Component initially, updated via TanStack Query.  
- **Details**: Hybrid approach combining Server Components with client-side reactivity.

```
/checklists/[id] → Checklist Detail (Client Component + TanStack Query)
```
- **What it shows**: Task list with optimistic updates via TanStack Query mutations and real-time collaboration.  
- **Details**: Full client-side interactivity with offline persistence and automatic sync.

```
/dashboard → Manager Dashboard (Server Component + TanStack Query)
```
- **What it shows**: Progress cards and historical data, combining Server Components with real-time updates.  
- **Details**: SSE for notifications, TanStack Query for progress updates, cursor-based pagination.

```
/profile → User Profile (Server Component)
```
- **What it shows**: Preset staff details (staff number, name, role, selected department), view-only.  
- **Details**: Server Component with session data, includes navigation links.

### **Navigation Flow**
- **Login Redirect**: `/auth` redirects to `/checklists` (team members) or `/dashboard` (managers) using Server Actions.  
- **Main Navigation Menu**:  
  - **Team Members**: Checklist Selection, Profile, Logout. Available via top navigation bar.  
  - **Managers**: Dashboard, Profile, Logout. Available via top navigation bar.  
- **Authenticated Pages**: `/checklists`, `/checklists/[id]`, `/dashboard`, `/profile`.  
- **Public Pages**: `/`, `/auth`.  
- **Primary User Journey**:  
  - **Team Member**: `/` → `/auth` → `/checklists` → `/checklists/[id]` → `/profile` → Logout.  
  - **Manager**: `/` → `/auth` → `/dashboard` → `/profile` → Logout.

---

## **11. UI/UX Specifications**

### **Design Direction**
- **Style**: Functional Minimalism with enhanced accessibility  
- **Color Scheme**: Light with Yellow and Red Accents using CSS custom properties  
  - `--color-primary-500: #FDF351` (yellow for buttons, ticks)  
  - `--color-secondary-500: #C5283D` (red for headers, notifications)  
  - `--color-surface-card: #EEE5E9` (card backgrounds)  
- **Component Style**: Tailwind CSS 4 utility classes with container queries  
- **Responsive Priority**: Mobile-First with enhanced touch targets (48x48px minimum)

### **Key UI Patterns**
- **Lists**: Cards and vertical task lists with consistent spacing and hover states  
- **Forms**: Server Actions with progressive enhancement and real-time validation  
- **Loading States**: React Suspense boundaries with skeleton components  
- **Empty States**: Descriptive messages with suggested actions  
- **Error Handling**: Error boundaries with retry mechanisms and clear messaging  
- **Animations**: CSS transitions and transforms for smooth, performant interactions

---

## **12. User Authentication & Permissions**

### **Auth Implementation**
```typescript
// lib/auth.ts
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export async function getSession() {
  const sessionCookie = (await cookies()).get('session')
  if (!sessionCookie) return null
  
  // Decrypt and validate session
  return decryptSession(sessionCookie.value)
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) redirect('/auth')
  return session
}

export async function requireRole(role: 'TEAM_MEMBER' | 'MANAGER') {
  const session = await requireAuth()
  if (session.role !== role) redirect('/auth')
  return session
}
```

### **Access Control**
- **Server Components**: Use `getSession()` and `requireAuth()` for authentication checks  
- **Client Components**: Use React Context for session state with automatic updates  
- **API Routes**: Middleware for authentication validation and role checking  
- **Role-based Access**: Enforced at both server and client levels with type safety  
- **Session Security**: HTTP-only cookies with encryption and automatic expiration

---

## **13. Device Capabilities**

- **PWA Installation**: Web App Manifest with proper icons and theme colors  
- **Push Notifications**: Browser Push API for manager notifications with opt-in consent  
- **Background Sync**: TanStack Query persistence for offline task completion sync  
- **Responsive Design**: Adaptive layouts for tablets and phones with touch optimization  
- **Accessibility**: WCAG 2.1 AA compliance with screen reader support and keyboard navigation

---

## **14. Performance & Optimization**

### **Next.js 15 Optimizations**
- **Server Components**: Default for static content and initial data loading  
- **Streaming**: React Suspense for progressive page loading and improved perceived performance  
- **Caching**: Strategic use of `force-cache`, `no-store`, and `revalidate` for optimal data freshness  
- **Bundle Optimization**: Automatic code splitting, tree shaking, and Turbopack for development

### **TanStack Query v5 Features**
- **Optimistic Updates**: Immediate UI feedback with automatic rollback on failure  
- **Persistence**: Offline-first with automatic synchronization when connectivity returns  
- **Query Invalidation**: Smart cache invalidation for real-time data consistency  
- **Devtools**: Enhanced debugging and performance monitoring in development

### **Caching Strategy**
- **Static Data**: Checklists cached with `force-cache` and revalidated on deployment  
- **Dynamic Data**: Task statuses using TanStack Query with 30-second stale time  
- **Session Data**: React Context with secure cookie persistence  
- **Historical Data**: 30-day retention with automatic cleanup via database triggers

---

## **15. API & Backend Needs**

### **Database Setup with Prisma v6**
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
```

### **API Routes Structure**
```
app/api/
├── auth/
│   ├── login/
│   │   └── route.ts          # Staff authentication
│   └── logout/
│       └── route.ts          # Session cleanup
├── checklists/
│   ├── route.ts              # Get all checklists for department
│   └── [id]/
│       ├── route.ts          # Get specific checklist with tasks
│       └── tasks/
│           └── route.ts      # Task operations
├── tasks/
│   ├── complete/
│   │   └── route.ts          # Task completion with optimistic updates
│   └── bulk/
│       └── route.ts          # Bulk task operations
└── dashboard/
    ├── progress/
    │   └── route.ts          # Real-time progress data
    ├── notifications/
    │   └── route.ts          # SSE endpoint for notifications
    └── history/
        └── route.ts          # Historical data with pagination
```

---

## **16. State Management Approach**

### **Modern State Architecture**
```typescript
// providers/auth-provider.tsx
const AuthContext = createContext<{
  user: User | null
  login: (staffNumber: string, department?: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}>()

// providers/query-provider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        toast.error('Something went wrong. Please try again.')
      },
      retry: 3,
    },
  },
})

// Persistent storage for offline support
const persister = experimental_createPersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
  prefix: 'jb-checklists-',
})
```

### **State Categories**
- **Authentication State**: React Context with secure session management  
- **Server State**: TanStack Query with optimistic updates and persistence  
- **UI State**: Component-level `useState` for forms and toggles  
- **Global UI State**: React Context for theme and user preferences  
- **Offline Queue**: TanStack Query mutation persistence for seamless sync

---

## **17. Error Handling & Edge Cases**

### **Comprehensive Error Strategy**
```typescript
// Global error boundary
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundaryProvider 
      fallback={({ error, retry }) => (
        <ErrorFallback error={error} retry={retry} />
      )}
    >
      {children}
    </ErrorBoundaryProvider>
  )
}

// TanStack Query error handling
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (error.status === 401) {
        // Redirect to login
        window.location.href = '/auth'
      } else if (error.status >= 500) {
        toast.error('Server error. Please try again later.')
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, variables, context, mutation) => {
      if (mutation.options.onError) return // Let component handle it
      toast.error('Operation failed. Please try again.')
    },
  }),
})
```

### **Common Scenarios**
- **No Internet**: Offline support with clear indicators and automatic sync when online  
- **Authentication Errors**: Automatic redirect to login with preserved navigation state  
- **Validation Errors**: Server-side validation with client-side feedback  
- **Database Errors**: Graceful fallbacks with retry mechanisms  
- **Stale Data**: Automatic revalidation with background updates

---

## **18. Launch Checklist**

### **Development Checklist**
- [ ] **Database Setup**: PostgreSQL running with Prisma migrations applied  
- [ ] **Environment Variables**: All required env vars configured for development and production  
- [ ] **Authentication Flow**: Login/logout working with proper session management  
- [ ] **Core Features**: All 6 features implemented and tested  
- [ ] **Offline Support**: Task completion and sync working without connectivity  
- [ ] **Real-time Updates**: SSE notifications functioning for managers  
- [ ] **Error Handling**: Comprehensive error boundaries and user feedback  
- [ ] **Performance**: Bundle size under 190KB, Core Web Vitals optimized  

### **Production Checklist**
- [ ] **PWA Installation**: Web app manifest configured and installable  
- [ ] **Security**: HTTPS enforced, CSP headers configured  
- [ ] **Database**: Production PostgreSQL configured with proper connection pooling  
- [ ] **Monitoring**: Error tracking and performance monitoring enabled  
- [ ] **Accessibility**: WCAG 2.1 AA compliance verified  
- [ ] **Cross-browser Testing**: Chrome, Safari, Firefox, Edge compatibility confirmed  
- [ ] **Mobile Testing**: iOS and Android tablet/phone testing completed  
- [ ] **Load Testing**: Performance under expected concurrent user load verified