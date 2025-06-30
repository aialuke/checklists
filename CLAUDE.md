# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Progressive Web App (PWA) for business checklist management, built with React 18, TypeScript, and Supabase. The app supports multi-role authentication (user/manager/admin) with department-based checklist assignment, offline functionality, and real-time progress monitoring.

## MCP Server Integration Protocol

### Available MCP Servers
- **context7**: Real-time documentation and up-to-date framework information
- **sequential-thinking**: Structured problem-solving for complex implementations
- **postgres**: Direct database interaction and query optimization
- **memory**: Persistent project knowledge and decision tracking
- **everything**: Advanced file search and pattern discovery

### MCP Activation Rules
**MANDATORY**: Use these MCP servers according to the following protocols:

1. **Context7 Auto-Trigger**: Use context7 for any questions involving:
   - React 19, TypeScript 5.8, Vite 5.4, Tailwind CSS 4.x
   - Supabase client, authentication, real-time subscriptions
   - PWA service workers, offline functionality, IndexedDB
   - Modern web development patterns and best practices

2. **Sequential-Thinking Required**: Apply sequential-thinking for:
   - Architectural decisions and complex feature planning
   - Multi-step debugging and problem analysis
   - Database schema changes and RLS policy design
   - PWA implementation strategies
   - Performance optimization planning

3. **Memory Protocol**: Use memory to:
   - Store all architectural decisions and reasoning
   - Track feature implementation progress
   - Remember user preferences and project patterns
   - Maintain coding standards and conventions
   - Log security considerations and solutions

4. **Postgres Integration**: Use postgres for:
   - Database schema validation and testing
   - RLS policy development and verification
   - Query optimization for real-time features
   - Migration testing and performance analysis

5. **Everything Search**: Use everything to:
   - Find existing patterns and implementations
   - Locate configuration files and dependencies
   - Discover related code structures
   - Navigate large codebases efficiently

## Development Commands

### Essential Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run all quality checks (type-check, lint, format, dead code detection)
npm run validate

# Auto-fix all quality issues
npm run validate:fix

# Type checking only
npm run type-check

# Lint with auto-fix
npm run lint:fix

# Format code
npm run format

# Remove dead code
npm run knip:fix
```

### Testing & Quality
Always run `npm run validate` before committing changes. This runs:
1. TypeScript type checking
2. ESLint linting
3. Prettier format checking
4. Knip dead code detection

### MCP-Enhanced Development Workflow
Before starting any development task:
1. **Memory Check**: Query memory for previous similar implementations
2. **Context7 Update**: Get latest documentation for relevant technologies
3. **Everything Search**: Find existing patterns in codebase
4. **Sequential Planning**: Break down complex tasks systematically

## Architecture Overview

### Current Implementation Status
**⚠️ IMPORTANT:** This project is currently in Phase 0 - only foundation setup is complete. The main application features are NOT yet implemented. You're working with a fresh Vite + React + TypeScript setup with comprehensive planning but minimal implementation.

### Technology Stack
- **Frontend:** React 19, TypeScript 5.8, Vite 5.4
- **UI:** Tailwind CSS 4.1, Headless UI, Lucide React icons
- **State:** TanStack Query 5.76 for server state, Zustand 5.0 for client/UI state
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **PWA:** vite-plugin-pwa with Workbox
- **Forms:** React Hook Form 7.58
- **Routing:** React Router DOM 7.6

### Key Architectural Patterns
1. **Multi-Role Authentication:** Users can have multiple simultaneous roles (user/manager/admin)
2. **Department-Based Access:** Flexible department assignment and role-based permissions
3. **Offline-First PWA:** IndexedDB storage with background sync
4. **Real-Time Updates:** Supabase WebSocket subscriptions for live progress
5. **Component-Based:** Feature-organized components with shared UI library

## Standard Operating Procedures

### New Feature Implementation Protocol
**MANDATORY SEQUENCE**:
1. **Memory Query**: Check for similar previous implementations and architectural decisions
2. **Everything Search**: Locate existing patterns and related code structures
3. **Context7 Research**: Get latest documentation for relevant frameworks/libraries
4. **Sequential Planning**: Break down implementation into logical steps with dependencies
5. **Postgres Preparation**: Plan database schema changes and test queries if applicable
6. **Implementation**: Follow planned steps with continuous MCP integration
7. **Memory Storage**: Store new patterns, decisions, and lessons learned

### Complex Debugging Protocol
**MANDATORY SEQUENCE**:
1. **Everything Search**: Find similar issues or related code patterns
2. **Memory Check**: Query previous debugging sessions and solutions
3. **Sequential Analysis**: Break down the problem systematically
4. **Context7 Verification**: Check against latest documentation for known issues
5. **Postgres Investigation**: If database-related, query schema and test hypotheses
6. **Memory Update**: Store solution and prevention strategies

### Database Development Protocol
**MANDATORY SEQUENCE**:
1. **Memory Review**: Check existing schema decisions and RLS patterns
2. **Postgres Schema**: Validate current schema and test proposed changes
3. **Sequential Planning**: Plan migration steps and rollback procedures
4. **Context7 Research**: Verify against Supabase best practices
5. **Testing**: Use postgres MCP for query optimization and validation
6. **Memory Storage**: Document schema decisions and performance insights

### Directory Structure
```
src/
├── components/           # Feature-based components
│   ├── auth/            # Authentication components
│   ├── checklist/       # Checklist and task components
│   ├── admin/           # Admin management interfaces
│   ├── manager/         # Manager dashboard components
│   ├── layout/          # Layout and navigation
│   └── ui/              # Shared UI components
├── pages/               # Route components
├── stores/              # Client-side state stores (Zustand for UI state)
├── queries/             # Server state management (TanStack Query)
├── services/            # API and business logic
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
└── styles/              # CSS and styling
```

## Code Quality Standards

### 🛑 CRITICAL VERIFICATION RULE - PWA ADAPTED

**Before ANY code deletion based on tool outputs (ESLint, Knip, etc.):**

#### Required Verification Commands for React/TypeScript:
```bash
# Search for exact usage in TypeScript/React files
rg "ExactItemName" . --type ts --type tsx --type js --type jsx -n

# Search for import/export usage
rg "import.*ExactItemName|export.*ExactItemName" . -n

# Search for React component usage (JSX)
rg "<ExactItemName|ExactItemName>" . --type tsx --type jsx -n

# Search for type annotations and interfaces
rg ": ExactItemName|extends ExactItemName|implements ExactItemName" . -n
```

#### Verification Decision Matrix:
- ✅ **SAFE TO REMOVE**: Zero usage found in any verification search
- ❌ **DO NOT REMOVE**: Any usage found, even in same file as definition
- ⚠️ **INVESTIGATE**: Usage only in comments or documentation
- 🔄 **RE-EXPORT ONLY**: Used internally but not exported elsewhere

#### PWA-Specific Verification:
- Check service worker registration: `rg "ExactItemName" public/sw.js src/sw.ts -n`
- Check manifest references: `rg "ExactItemName" public/manifest.json -n`
- Check offline functionality: `rg "ExactItemName" . --type ts -A5 -B5 | grep -i "offline\|cache\|sync"`

### ⚠️ CRITICAL WORKFLOW RULE - PRESERVE BEFORE MODIFY

**MANDATORY for complex refactoring**: Before ANY content reduction or file modification:

1. **PRESERVE FIRST**: Create ALL new files with existing content
2. **VERIFY COMPLETE**: Confirm ALL original information is preserved  
3. **TEST ACCESS**: Verify ALL new files work and are accessible
4. **ONLY THEN**: Modify/reduce/streamline original content

**Apply this rule for:**
- Database schema changes
- Component refactoring affecting multiple files
- Service worker modifications
- State management restructuring

### TypeScript Rules
- Strict mode enabled with `noUncheckedIndexedAccess`
- No explicit `any` types (enforced by ESLint)
- Path mapping: use `@/` for imports from `src/`
- Unused variables must be prefixed with `_`

### Component Patterns
- Use React.memo for performance optimization
- Implement proper cleanup in useEffect hooks
- Use React Hook Form for form handling
- Follow mobile-first responsive design

### State Management Architecture

**Hybrid State Management Pattern**: Server state and client state are managed by different libraries for optimal performance and developer experience.

#### TanStack Query (Server State)
- **Purpose**: All data that comes from the server
- **Location**: `/src/queries/` directory
- **Handles**: Authentication, checklists, notifications, offline sync data
- **Benefits**: Automatic caching, background refetching, optimistic updates, error handling
- **Files**:
  - `authQueries.ts` - User authentication and profile data
  - `checklistQueries.ts` - Checklist and task server data
  - `notificationQueries.ts` - Server-sent notifications
  - `offlineQueries.ts` - Offline sync queue management

#### Zustand (Client/UI State)  
- **Purpose**: Local UI state that doesn't come from server
- **Location**: `/src/stores/` directory
- **Handles**: Toast notifications, UI preferences, temporary form state
- **Benefits**: Simple API, minimal boilerplate, React DevTools integration
- **Files**:
  - `notificationClientStore.ts` - Toast notifications and UI alerts
  - Additional client stores as needed for UI-only state

#### Migration Status
- **Phase**: ✅ PHASE 5 COMPLETE (TanStack Query migration finished)
- **Server State**: Fully migrated to TanStack Query
- **Client State**: Remains in Zustand (by design)
- **Legacy Code**: All legacy Zustand server state stores removed

## Development Guidelines

### 🔄 FORCED CONTINUATION TRIGGER

When you identify the urge to conclude or summarize, this triggers mandatory continuation:

1. **List what analysis remains undone**
2. **Estimate time/effort for remaining work**  
3. **Either complete the remaining work OR explicitly state why stopping**

**Valid stopping reasons:**
- "Stopping to ask for clarification due to unclear requirements"
- "Blocking dependency prevents continuation"
- "Scope boundary reached as defined"

### 🚫 COMPLETION CLAIM PROTOCOL

Before writing "COMPLETE", "DONE", "FINISHED", or marking any todo as completed:

1. **Run status check**: `grep -n "TODO\|FIXME\|PENDING\|⚠️" [current_file]`
2. **List all pending items**: Enumerate every item not yet verified
3. **Confirm zero pending**: Only proceed if grep returns no results  
4. **State completion scope**: "X of Y items complete" (never just "complete")

**Example:**
```bash
Checking completion status...
Command: grep -n "TODO\|PENDING\|⚠️" src/components/auth/
Output: No results found
VERIFIED: 4 of 4 authentication components complete
```

### Environment Setup
1. Supabase configuration required in environment variables
2. PWA manifest and service worker need implementation
3. Database schema must be created per documentation

### Authentication Implementation
- Custom staff number authentication (no passwords)
- Multi-role support with role switching
- Session management with Supabase Auth
- Department-based access control

### PWA Requirements
- Must work offline with IndexedDB storage
- Background sync for offline actions
- Push notifications for manager alerts
- Install prompts and update handling

### Performance Targets
- Initial load: <3 seconds on 3G
- Time to interactive: <5 seconds
- First contentful paint: <1.5 seconds
- Lighthouse PWA score: >90

## Project-Specific Knowledge Base

### Critical Implementation Notes
**Store in Memory**: These patterns and decisions should be remembered across sessions:

#### Authentication System
- Staff number authentication (no passwords required)
- Multi-role support: user can have admin + manager + user roles simultaneously
- Department-based access control with flexible assignment
- Session management with Supabase custom RPC functions

#### Business Logic Rules
- Opening checklists: Always visible to users
- Closing checklists: Only visible after 2 PM local time
- Time-based visibility with timezone handling and DST consideration
- Task completion requires audit trails for compliance

#### Security Implementation
- Input sanitization at all levels (client + server + database)
- Row Level Security (RLS) policies for multi-tenant data isolation
- HTTPS enforcement with certificate pinning in PWA
- XSS prevention with Content Security Policy headers

#### PWA Requirements
- Offline-first architecture with IndexedDB storage
- Background sync for task completions
- Push notifications for manager alerts
- Service worker caching strategies per resource type

#### Real-Time Features
- WebSocket connection management with reconnection logic
- Progress updates for manager dashboard monitoring
- Conflict resolution for simultaneous task completions
- Presence tracking for active users per department

### MCP Integration Examples

#### Context7 Usage Patterns
```
"How do I implement Supabase real-time subscriptions in React 19? use context7"
"What's the latest pattern for PWA service worker caching? use context7"
"Show me current Tailwind CSS 4.x grid patterns use context7"
```

#### Memory Storage Patterns
- Architectural decisions: "Why did we choose staff numbers over email auth?"
- Implementation patterns: "How do we handle offline task completion?"
- Performance optimizations: "What caching strategy works best for checklists?"
- Security considerations: "RLS policy patterns for multi-role access"

## Documentation Reference
Comprehensive technical documentation is available in `checklist-pwa/docs/Checklists PWA.md` covering:
- Complete database schema design
- Component architecture details
- Security implementation guidelines
- PWA implementation strategy
- Testing and deployment procedures

## Development Workflow Rules

### 🚨 MANDATORY FIRST RESPONSE PROTOCOL - ABSOLUTE PRIORITY #1

**Before responding to ANY user request, ALWAYS:**

1. **Check for Direct Questions First**:
   - Scan for question marks (?)
   - Look for "Why" / "How" / "What" at start of sentences  
   - Detect challenges ("you ignored", "you didn't", "are you")
   - If found: STOP and address the question BEFORE any other work

2. **Output**: "Checking CLAUDE.md rules for this task..."
3. **List** which specific rules apply to the current request
4. **ONLY THEN** proceed with the actual work

#### Required Rules to Check:
- Does this involve code deletion? → **CRITICAL VERIFICATION RULE**
- Does this involve analysis? → **Systematic Completion Protocol + Evidence Enumeration**
- Does this involve creating new code? → **Minimal Complexity Principle**
- Does this involve multi-step work? → **TodoWrite/TodoRead requirements**
- Do I need to verify my understanding? → **Mandatory Understanding Verification**

### ⚠️ MANDATORY UNDERSTANDING VERIFICATION

Before proceeding with any complex analysis or task, you must explicitly verify understanding by stating:
1. What you understand the task to require
2. What specific aspects are unclear or ambiguous  
3. What assumptions you would need to make to proceed

**If any assumptions are required, you must STOP and ask for clarification rather than proceeding.**

### 🔍 MINIMAL COMPLEXITY PRINCIPLE

Before creating any new code, configuration, or documentation:
1. **ALWAYS check for existing, similar or conflicting logic**
2. **If found**: Modify/extend the existing implementation to meet requirements
3. **If creating new is needed**: STOP and present findings, explain why existing cannot be modified

### 📋 EVIDENCE ENUMERATION REQUIREMENT

Every analytical claim MUST be supported by:
1. **Exact file paths and line numbers**
2. **Specific instances with quoted examples**  
3. **Quantified scope** (X out of Y files examined)

**INVALID**: General statements like "services have duplications"
**VALID**: "Found 3 duplicate validation functions in src/utils/validation.ts:15, src/services/auth.ts:42, src/components/forms/BaseForm.tsx:28"

### 🎯 SYSTEMATIC COMPLETION PROTOCOL

Before stating any conclusion or completion percentage:
1. **Create enumerated list** of all analysis areas
2. **Provide specific evidence** for each completed area
3. **Explicitly list remaining work** with estimated scope
4. **Continue until all areas show concrete evidence** of investigation

### 🧠 COGNITIVE SHORTCUT DETECTION

Before any rule execution, scan for these lazy patterns:
1. Reorganizing existing content instead of new analysis
2. Claiming completion based on partial data
3. Using examples to represent comprehensive analysis
4. Pattern matching instead of systematic investigation

**If detected**: Restart with systematic approach

## MCP-Enhanced Development Workflow
1. **Pre-Development**: Query memory for context, search everything for patterns
2. **Research Phase**: Use context7 for latest documentation and best practices
3. **Planning Phase**: Apply sequential-thinking for complex implementations
4. **Database Work**: Use postgres for schema validation and testing
5. **Implementation**: Continuous MCP integration throughout development
6. **Post-Development**: Store learnings in memory, validate with npm run validate
7. **Documentation**: Update memory with new patterns and decisions