# Performance and Architecture Refactoring Plan

This report outlines a strategic plan to refactor the application for high performance, scalability, and maintainability. The recommendations are based on a detailed codebase analysis and have been validated against modern best practices using `context7`.

### Executive Summary: The Three Pillars of Refactoring

The refactoring effort is organized around three core pillars that address the most critical architectural and performance issues in the codebase:

1.  **Adopt TanStack Query for Server State:** Centralize all data fetching, caching, and synchronization logic by adopting TanStack Query. This will solve issues related to inefficient data fetching, caching, and complex offline requirements.
2.  **Refine Client State and Component Architecture:** Decouple UI state from server state. Refactor Zustand stores to manage only client-side state and enforce a clear separation of concerns in the component hierarchy.
3.  **Optimize Build and Asset Loading:** Modernize the build configuration and implement code-splitting to ensure fast initial load times and an efficient asset delivery pipeline.

A fourth pillar addresses the specific challenge of client-side computation in a phased, pragmatic manner.

### Projected Performance Gains: A Summary

Implementing this plan is expected to yield significant, measurable improvements across the application.

#### **Build Performance**
*   **Metric:** Build Time
*   **Change:** Switching from `terser` to `esbuild` for minification.
*   **Estimated Gain:** **20-40x faster** minification process, reducing build times from minutes to seconds.

#### **Load Performance**
*   **Metric:** Initial JavaScript Bundle Size
*   **Change:** Implementing route-based code splitting with `React.lazy`.
*   **Estimated Gain:** **40-70% reduction**, leading to significantly faster initial page loads.
*   
*   **Metric:** Lighthouse Performance Score
*   **Change:** Code splitting and modernized build targets.
*   **Estimated Gain:** An increase of **15-30 points**, reflecting major improvements in First Contentful Paint (FCP) and Time to Interactive (TTI).

#### **Runtime & User Experience**
*   **Metric:** Redundant Network Requests
*   **Change:** Caching data with TanStack Query.
*   **Estimated Gain:** **50-80% reduction** in unnecessary API calls on subsequent views.
*   
*   **Metric:** UI Responsiveness
*   **Change:** Memoizing selectors with `reselect`.
*   **Estimated Gain:** Fewer and faster component re-renders, leading to a smoother, more responsive UI.
*   
*   **Metric:** Offline Capability
*   **Change:** Implementing TanStack Query's offline mutation persistence.
*   **Estimated Gain:** **From non-existent to fully functional**, allowing users to continue working without an internet connection.

---

### Pillar 1: Adopt TanStack Query for All Server State

**Problem:** The current data management is spread across Zustand stores, leading to inefficient fetching (N+1 queries), no caching, risky manual subscriptions for Suspense, and a complex path to robust offline support.

**Recommendations:**

1.  **Centralize Data Fetching:** Replace all data-fetching logic within Zustand actions (`loadChecklists`, `loadChecklist`) with TanStack Query's `useQuery` and `useSuspenseQuery` hooks. This provides automatic caching, background revalidation, and stale-data management out of the box.
2.  **Eliminate Risky Suspense Hooks:** Replace the manual `Promise`-based Suspense hooks with `useSuspenseQuery` and wrap the consuming components in a React `<ErrorBoundary>` for robust, declarative loading and error states.
3.  **Implement Robust Offline Support:**
    -   **Storage:** Replace `localStorage` with `IndexedDB` using the `idb` library for a more capable, asynchronous storage solution.
    -   **Offline Mutations:** Leverage TanStack Query's `persistQueryClient` plugin to save the mutation queue to IndexedDB. On app startup, call `queryClient.resumePausedMutations()` to automatically retry any actions that occurred while the user was offline.
    -   **Optimistic Updates:** Use the `onMutate` and `onError` callbacks in `useMutation` to provide immediate UI feedback and automatic rollbacks, dramatically improving the offline user experience.

---

### Pillar 2: Refine Client State & Component Architecture

**Problem:** The codebase shows early signs of architectural issues that will hinder scalability, including monolithic stores, the mixing of UI and server state, and a lack of clear component patterns.

**Recommendations:**

1.  **Isolate Server State:** As part of adopting TanStack Query, remove all server data and caching logic from Zustand stores.
2.  **Zustand for Pure UI State:** Limit the role of Zustand to managing only globally shared, client-side UI state (e.g., theme, modal visibility, non-persistent UI settings).
3.  **Enforce Component Patterns:**
    -   Use **container components** or **custom hooks** to handle all logic, data fetching, and state management.
    -   Keep **presentational components** (e.g., in `src/components/ui`) "dumb"—they should only receive props and render UI, with no direct access to global state.
4.  **Memoize Derived State:** For complex, client-side state computations (like filtering a list based on multiple UI controls), use `reselect` to create memoized selectors. This prevents expensive re-calculations on every render.

---

### Pillar 3: Optimize Build and Asset Loading

**Problem:** The project's build configuration is outdated, and it doesn't leverage modern code-splitting techniques, leading to slower builds and larger initial bundle sizes.

**Recommendations:**

1.  **Modernize Vite Configuration:**
    -   Update `build.target` from `'es2015'` to `'esnext'` to reduce unnecessary transpilation.
    -   Switch `build.minify` from `'terser'` to `'esbuild'` for significantly faster build times.
    -   Remove the `manualChunks` configuration to let Vite's more advanced chunking algorithm handle splitting automatically.
2.  **Implement Route-Based Code Splitting:** In `src/router/AppRouter.tsx`, use `React.lazy` and `<Suspense>` to load page components on demand. This ensures the initial bundle is small and that users only download the code for the page they are visiting.

---

### Pillar 4: A Phased Approach to Optimizing Heavy Client-Side Computations

**Problem:** The `visibleChecklists` selector performs filtering on the main thread, which could become a performance bottleneck with very large datasets.

**Recommendation:** The high-complexity solution of Web Workers should be a last resort. Instead, follow this pragmatic, phased approach, measuring performance at each step.

1.  **Phase 1: Memoization (Immediate Priority):** Use `reselect` to memoize the `visibleChecklists` selector. This is the most direct and highest-impact fix, ensuring the filtering logic only runs when its inputs change.
2.  **Phase 2: Debounce User Input:** If the UI feels sluggish during search, use a debouncing hook (e.g., `use-debounce`) on the search input to reduce the frequency of re-computations.
3.  **Phase 3: Virtualize the List (For Large-Scale Data):** If rendering thousands of items slows down the DOM, use the `react-window` library to only render the items currently visible in the viewport.
