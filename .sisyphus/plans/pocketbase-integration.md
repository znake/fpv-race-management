# PocketBase Backend Integration für Heats

## TL;DR

> **Quick Summary**: Integration von PocketBase als Backend für die bestehende FPV Racing Tournament App. Admin nutzt weiterhin das Synthwave-Frontend, Daten werden automatisch zu PocketBase synchronisiert. Gäste bekommen Read-Only Zugriff auf dieselbe UI via öffentlichem Link mit Live-Updates.
> 
> **Deliverables**:
> - PocketBase Schema (Collections: tournaments, pilots, heats)
> - Zustand Sync-Middleware (Client → PocketBase)
> - Real-time Subscription Layer (PocketBase → Gäste)
> - Offline-Queue für Sync bei Verbindungsverlust
> - Role-Detection (Admin vs Gast) mit UI-Anpassung
> - Export-Endpoints (CSV, JSON)
> - Coolify Docker Deployment
> 
> **Estimated Effort**: Large (2-3 Wochen)
> **Parallel Execution**: YES - 3 Waves
> **Critical Path**: Schema Design → Sync Layer → Real-time → Deployment

---

## Context

### Original Request
Backend-Lösung für transparente Status-Verfolgung bei FPV-Rennen:
- Admin-Account für Rang-Eingabe
- Gast-Account (ohne Login) für Read-Only Status-Ansicht
- Mobile-optimiert für Piloten die warten
- Export von Ergebnissen und Zeiten
- Selbst-gehostet auf VPS

### Interview Summary
**Key Discussions**:
- Admin-Workflow: Bestehendes Frontend weiternutzen, automatischer Sync zu PocketBase
- Gäste-Experience: Gleiche Synthwave-UI, voller Read-Only Zugriff auf alles
- Architektur: Client-First mit PocketBase Sync (Zustand bleibt Master)
- Real-time: Automatisch bei jeder Änderung via SSE
- Export: CSV und JSON
- Deployment: Bestehender VPS mit Coolify

**Critical Decisions (Metis Review)**:
- Offline: Admin arbeitet weiter, Sync-Queue, automatischer Upload bei Reconnect
- Gast-Zugang: Öffentlicher Link ohne PIN
- Multi-Admin: Nur ein Admin (kein Konflikt-Handling)
- Skalierung: Klein (bis 30 Gäste)
- Migration: Import-Funktion beibehalten, nicht mit leeren Daten starten

### Research Findings
- PocketBase: Single Binary, ~50-100MB RAM, SSE Real-time, SQLite
- JS SDK: `pocketbase` npm package mit Real-time Subscriptions
- API Rules: Leere Rules (`""`) = öffentlicher Read-Zugriff
- Coolify: Native Docker-Unterstützung für PocketBase

### Metis Review
**Identified Gaps** (addressed):
- Offline-Strategie: Sync-Queue mit Auto-Retry bei Reconnect
- Gast-Zugang: Öffentlicher Link (keine PIN)
- Multi-Admin: Single-Admin Annahme (kein Konflikt-Handling)
- Sync-Deduplication: Echo-Prevention durch lokale Origin-Tags
- Reconnection: SSE Auto-Reconnect mit State-Reconciliation

---

## Work Objectives

### Core Objective
PocketBase als Sync-Backend integrieren, damit Admin-Änderungen in Echtzeit für Read-Only Gäste sichtbar werden, ohne die bestehende Turnier-Logik zu verändern.

### Concrete Deliverables
- `src/lib/pocketbase/client.ts` - PocketBase Client Konfiguration
- `src/lib/pocketbase/schema.ts` - TypeScript Types für PocketBase Collections
- `src/lib/pocketbase/sync.ts` - Sync-Layer (Zustand → PocketBase)
- `src/lib/pocketbase/subscriptions.ts` - Real-time Subscriptions (PocketBase → UI)
- `src/lib/pocketbase/offline-queue.ts` - Offline-Queue für Sync bei Reconnect
- `src/hooks/useRole.ts` - Admin vs Gast Detection
- `src/components/ReadOnlyGuard.tsx` - Wrapper für mutation-geschützte Komponenten
- `src/lib/export.ts` - CSV/JSON Export Funktionen
- `docker-compose.pocketbase.yml` - Coolify Deployment Config
- `pb_migrations/` - PocketBase Schema Migrations

### Definition of Done
- [ ] Admin kann Turnier durchführen, alle Änderungen landen in PocketBase
- [ ] Gäste sehen Live-Updates via öffentlichem Link (keine Login)
- [ ] Bei Offline arbeitet Admin weiter, Sync bei Reconnect
- [ ] Export als CSV und JSON funktioniert
- [ ] Alle neuen Sync-Funktionen haben Tests (TDD)
- [ ] PocketBase läuft in Coolify

### Must Have
- Automatischer Sync: Jede Zustand-Mutation → PocketBase Write
- Real-time Updates: PocketBase → Gäste-UI via SSE
- Offline-Resilience: Sync-Queue bei Verbindungsverlust
- Role-based UI: Gäste sehen keine Mutations-Controls
- Export: CSV und JSON Download
- Deployment: Docker in Coolify

### Must NOT Have (Guardrails)
- KEINE Änderung der bestehenden Bracket-Logik
- KEINE User-Authentication für Gäste (öffentlicher Zugang)
- KEINE Multi-Admin Konflikt-Auflösung
- KEINE neuen Features (Analytics, Chat, Notifications)
- KEINE Änderung des Zustand Store Interfaces
- KEINE Migration von localStorage-Daten (Import-Funktion existiert)
- KEIN separates Admin-Backend (PocketBase Admin UI nur für Debugging)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES (Vitest + Testing Library)
- **User wants tests**: TDD
- **Framework**: Vitest

### TDD Approach
Jede TODO folgt RED-GREEN-REFACTOR:
1. **RED**: Failing Test schreiben
2. **GREEN**: Minimum Implementation
3. **REFACTOR**: Clean up

### Test Categories
| Category | Tool | Location |
|----------|------|----------|
| Unit (Sync Logic) | Vitest | `src/lib/pocketbase/__tests__/` |
| Integration (PocketBase) | Vitest + MSW | `src/lib/pocketbase/__tests__/integration/` |
| E2E (Real-time) | Playwright | `e2e/` |
| E2E (Role-based UI) | Playwright | `e2e/` |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: PocketBase Setup & Schema Design
├── Task 2: PocketBase Client & Types
└── Task 3: Role Detection Hook

Wave 2 (After Wave 1):
├── Task 4: Sync Middleware (depends: 2)
├── Task 5: Offline Queue (depends: 2)
└── Task 6: Real-time Subscriptions (depends: 2)

Wave 3 (After Wave 2):
├── Task 7: ReadOnly UI Guard (depends: 3, 6)
├── Task 8: Export Functions (depends: 4)
└── Task 9: Integration & E2E Tests (depends: 4, 6, 7)

Wave 4 (Final):
└── Task 10: Coolify Deployment (depends: 1, 9)

Critical Path: Task 1 → Task 2 → Task 4 → Task 9 → Task 10
Parallel Speedup: ~40% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 10 | 3 |
| 2 | 1 | 4, 5, 6 | 3 |
| 3 | None | 7 | 1, 2 |
| 4 | 2 | 8, 9 | 5, 6 |
| 5 | 2 | 9 | 4, 6 |
| 6 | 2 | 7, 9 | 4, 5 |
| 7 | 3, 6 | 9 | 8 |
| 8 | 4 | 9 | 7 |
| 9 | 4, 5, 6, 7, 8 | 10 | None |
| 10 | 1, 9 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Dispatch |
|------|-------|---------------------|
| 1 | 1, 2, 3 | 3x parallel sisyphus-junior |
| 2 | 4, 5, 6 | 3x parallel sisyphus-junior |
| 3 | 7, 8, 9 | Sequential (9 depends on all) |
| 4 | 10 | 1x sisyphus-junior |

---

## TODOs

### Wave 1: Foundation

- [ ] 1. PocketBase Setup & Schema Design

  **What to do**:
  - PocketBase Docker Container konfigurieren für Coolify
  - Collections Schema definieren:
    - `tournaments`: id, name, phase, config, created, updated
    - `pilots`: id, tournament_id, name, imageUrl, instagramHandle, status, droppedOut
    - `heats`: id, tournament_id, heatNumber, pilotIds, status, bracketType, results, roundNumber
    - `tournament_state`: id, tournament_id, currentHeatIndex, winnerPilots, loserPilots, etc.
  - API Rules konfigurieren:
    - Admin (authenticated): Create, Read, Update, Delete
    - Guest (unauthenticated): Read only
  - PocketBase Migrations erstellen

  **Must NOT do**:
  - Keine komplexen Relations (denormalized für Performance)
  - Keine additional Collections (analytics, logs, etc.)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Schema-Design ist konzeptionell, wenig Code
  - **Skills**: [`git-master`]
    - `git-master`: Commits für Schema-Änderungen

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Tasks 2, 10
  - **Blocked By**: None

  **References**:
  
  **Pattern References**:
  - `src/types/tournament.ts:24-41` - Heat Interface als Vorlage für PocketBase Schema
  - `src/types/tournament.ts:70-86` - TournamentStateData Interface
  
  **API/Type References**:
  - `src/lib/schemas.ts` - Pilot, HeatResults, Ranking Types
  
  **External References**:
  - PocketBase Collections: https://pocketbase.io/docs/collections/
  - PocketBase API Rules: https://pocketbase.io/docs/api-rules-and-filters/

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test file: `src/lib/pocketbase/__tests__/schema.test.ts`
  - [ ] Test: Schema Types matchen bestehende TypeScript Interfaces
  - [ ] `bun test src/lib/pocketbase/__tests__/schema.test.ts` → PASS

  **Automated Verification:**
  ```bash
  # Verify PocketBase container starts
  docker compose -f docker-compose.pocketbase.yml up -d
  sleep 5
  curl -s http://localhost:8090/api/health | jq '.code'
  # Assert: Returns 200
  
  # Verify collections exist
  curl -s http://localhost:8090/api/collections | jq '.[].name'
  # Assert: Contains "tournaments", "pilots", "heats", "tournament_state"
  ```

  **Commit**: YES
  - Message: `feat(backend): add PocketBase schema and Docker config`
  - Files: `docker-compose.pocketbase.yml`, `pb_migrations/`, `src/lib/pocketbase/schema.ts`

---

- [ ] 2. PocketBase Client & TypeScript Types

  **What to do**:
  - PocketBase SDK installieren: `bun add pocketbase`
  - Client-Singleton erstellen mit Konfiguration
  - TypeScript Types für Collections generieren
  - Auth-Helper für Admin-Login
  - Environment Variables Setup (VITE_POCKETBASE_URL)

  **Must NOT do**:
  - Keine automatische Auth-Persistenz (Admin loggt sich manuell ein)
  - Keine Retry-Logik hier (kommt in Sync Layer)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Einfache SDK Integration
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Tasks 4, 5, 6
  - **Blocked By**: Task 1 (Schema muss existieren)

  **References**:

  **Pattern References**:
  - `src/lib/utils.ts` - Utility-Pattern für Singleton
  
  **External References**:
  - PocketBase JS SDK: https://github.com/pocketbase/js-sdk
  - SDK TypeScript: https://pocketbase.io/docs/client-side-sdks/#typescript

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test file: `src/lib/pocketbase/__tests__/client.test.ts`
  - [ ] Test: Client initialisiert mit URL aus Environment
  - [ ] Test: Admin kann sich authentifizieren
  - [ ] `bun test src/lib/pocketbase/__tests__/client.test.ts` → PASS

  **Automated Verification:**
  ```bash
  # Verify SDK installed
  bun pm ls | grep pocketbase
  # Assert: pocketbase listed
  
  # Verify types compile
  bun run tsc --noEmit
  # Assert: Exit code 0
  ```

  **Commit**: YES
  - Message: `feat(backend): add PocketBase client and types`
  - Files: `src/lib/pocketbase/client.ts`, `src/lib/pocketbase/types.ts`, `.env.example`

---

- [ ] 3. Role Detection Hook (useRole)

  **What to do**:
  - Hook erstellen: `useRole()` → `{ isAdmin: boolean, isGuest: boolean }`
  - Detection Logic:
    - URL Parameter: `?mode=admin` → zeige Login
    - PocketBase Auth Token vorhanden → isAdmin = true
    - Kein Token → isGuest = true (Read-Only)
  - Context Provider für Role-State
  - Logout-Funktion für Admin

  **Must NOT do**:
  - Keine Gäste-Authentifizierung
  - Keine Persistenz des Admin-Status über Sessions hinaus

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Einfacher React Hook
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Task 7
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/hooks/useZoomPan.ts` - Existing Hook Pattern
  - `src/hooks/usePilots.ts` - Existing Hook Pattern
  
  **External References**:
  - PocketBase Auth Store: https://pocketbase.io/docs/authentication/

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test file: `src/hooks/__tests__/useRole.test.tsx`
  - [ ] Test: Ohne Token → isGuest = true
  - [ ] Test: Mit validem Token → isAdmin = true
  - [ ] Test: URL param `?mode=admin` zeigt Login-Möglichkeit
  - [ ] `bun test src/hooks/__tests__/useRole.test.tsx` → PASS

  **Automated Verification:**
  ```bash
  bun test src/hooks/__tests__/useRole.test.tsx
  # Assert: All tests pass
  ```

  **Commit**: YES
  - Message: `feat(auth): add useRole hook for admin/guest detection`
  - Files: `src/hooks/useRole.ts`, `src/context/RoleContext.tsx`

---

### Wave 2: Core Sync Layer

- [ ] 4. Zustand Sync Middleware

  **What to do**:
  - Zustand Middleware erstellen die Mutations abfängt
  - Bei jeder `set()` Operation:
    1. Lokalen State updaten (Zustand)
    2. Änderung in Sync-Queue pushen
    3. Async zu PocketBase schreiben
  - Sync-ID Tagging für Echo-Prevention:
    - Lokale Änderungen markieren mit `_localOrigin: true`
    - Bei eingehenden Subscriptions: Ignorieren wenn `_localOrigin`
  - Error Handling: Bei Fehler → Offline-Queue

  **Must NOT do**:
  - Keine Änderung der bestehenden Zustand Actions
  - Keine Blocking-Syncs (UI darf nicht warten)

  **Recommended Agent Profile**:
  - **Category**: `business-logic`
    - Reason: Kritische Sync-Logik mit Edge Cases
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: Tasks 8, 9
  - **Blocked By**: Task 2

  **References**:

  **Pattern References**:
  - `src/stores/tournamentStore.ts:188-192` - Zustand persist middleware Pattern
  - `src/stores/tournamentStore.ts:520-726` - submitHeatResults als Beispiel für komplexe Mutation
  
  **API/Type References**:
  - `src/stores/tournamentStore.ts:76-186` - TournamentState Interface
  
  **External References**:
  - Zustand Middleware: https://docs.pmnd.rs/zustand/guides/typescript#middleware-that-changes-the-store-type

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test file: `src/lib/pocketbase/__tests__/sync.test.ts`
  - [ ] Test: addPilot() → PocketBase write wird aufgerufen
  - [ ] Test: submitHeatResults() → Heat in PocketBase aktualisiert
  - [ ] Test: Bei Netzwerkfehler → Änderung in Offline-Queue
  - [ ] Test: Echo-Prevention: Lokale Änderung wird nicht doppelt verarbeitet
  - [ ] `bun test src/lib/pocketbase/__tests__/sync.test.ts` → PASS

  **Automated Verification:**
  ```bash
  bun test src/lib/pocketbase/__tests__/sync.test.ts
  # Assert: All tests pass, including edge cases
  ```

  **Commit**: YES
  - Message: `feat(sync): add Zustand sync middleware for PocketBase`
  - Files: `src/lib/pocketbase/sync.ts`, `src/stores/tournamentStore.ts` (middleware integration)

---

- [ ] 5. Offline Queue Implementation

  **What to do**:
  - Queue-Struktur für pending Syncs:
    - `{ id, action, payload, timestamp, retryCount }`
  - Queue in localStorage persistieren
  - Online/Offline Detection via `navigator.onLine`
  - Bei Reconnect: Queue abarbeiten (FIFO)
  - Retry-Logik: Max 3 Retries, dann User-Notification
  - UI-Indikator: "Sync pending" Badge wenn Queue nicht leer

  **Must NOT do**:
  - Keine komplexe Konflikt-Auflösung (Single-Admin Annahme)
  - Keine Queue-Merging (jede Aktion einzeln)

  **Recommended Agent Profile**:
  - **Category**: `business-logic`
    - Reason: Reliability-kritische Logik
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6)
  - **Blocks**: Task 9
  - **Blocked By**: Task 2

  **References**:

  **Pattern References**:
  - `src/stores/tournamentStore.ts:189` - localStorage persist Pattern
  
  **External References**:
  - Navigator.onLine: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test file: `src/lib/pocketbase/__tests__/offline-queue.test.ts`
  - [ ] Test: Bei offline → Änderung in Queue
  - [ ] Test: Bei online → Queue wird abgearbeitet
  - [ ] Test: Queue überlebt Page Refresh (localStorage)
  - [ ] Test: Nach 3 Retries → Error Callback
  - [ ] `bun test src/lib/pocketbase/__tests__/offline-queue.test.ts` → PASS

  **Automated Verification:**
  ```bash
  bun test src/lib/pocketbase/__tests__/offline-queue.test.ts
  # Assert: All tests pass
  ```

  **Commit**: YES
  - Message: `feat(sync): add offline queue with retry logic`
  - Files: `src/lib/pocketbase/offline-queue.ts`, `src/components/SyncStatusIndicator.tsx`

---

- [ ] 6. Real-time Subscriptions Layer

  **What to do**:
  - PocketBase SSE Subscriptions für alle Collections:
    - `tournaments.*` → Tournament-State Updates
    - `pilots.*` → Pilot-Liste Updates
    - `heats.*` → Heat-Status Updates
  - Subscription Manager mit Auto-Reconnect
  - State Reconciliation bei Reconnect:
    - Full Fetch nach Reconnect (nicht nur diff)
  - Echo-Prevention: Ignoriere Events mit lokalem Origin
  - Hook: `useRealtimeSync()` für Gäste-Modus

  **Must NOT do**:
  - Keine Subscriptions im Admin-Modus (Admin ist Source of Truth)
  - Keine partial Updates (immer full record)

  **Recommended Agent Profile**:
  - **Category**: `business-logic`
    - Reason: Real-time Synchronisation erfordert sorgfältige Logik
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Tasks 7, 9
  - **Blocked By**: Task 2

  **References**:

  **Pattern References**:
  - `src/stores/tournamentStore.ts` - State Structure für Updates
  
  **External References**:
  - PocketBase Realtime: https://pocketbase.io/docs/realtime/
  - JS SDK Realtime: https://github.com/pocketbase/js-sdk#realtime-subscriptions

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test file: `src/lib/pocketbase/__tests__/subscriptions.test.ts`
  - [ ] Test: Bei Heat-Update Event → Zustand State aktualisiert
  - [ ] Test: Bei Disconnect → Auto-Reconnect nach 5s
  - [ ] Test: Bei Reconnect → Full State Refetch
  - [ ] Test: Echo-Prevention verhindert Loops
  - [ ] `bun test src/lib/pocketbase/__tests__/subscriptions.test.ts` → PASS

  **Automated Verification:**
  ```bash
  bun test src/lib/pocketbase/__tests__/subscriptions.test.ts
  # Assert: All tests pass
  ```

  **Commit**: YES
  - Message: `feat(realtime): add PocketBase subscription layer`
  - Files: `src/lib/pocketbase/subscriptions.ts`, `src/hooks/useRealtimeSync.ts`

---

### Wave 3: UI Integration & Export

- [ ] 7. ReadOnly UI Guard Component

  **What to do**:
  - `<ReadOnlyGuard>` Wrapper Component:
    - Im Gast-Modus: Children werden nicht gerendert
    - Im Admin-Modus: Children normal rendern
  - Alle Mutations-Buttons wrappen:
    - Add/Edit/Delete Pilot
    - Submit Results
    - Reset Tournament
    - etc.
  - Optional: Dimmed Placeholder im Gast-Modus ("Nur für Admin")

  **Must NOT do**:
  - Keine neue UI-Elemente für Gäste
  - Keine Änderung der bestehenden Componenten-Logik

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI-Komponente mit konditionellem Rendering
  - **Skills**: [`frontend-ui-ux`, `git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 8)
  - **Blocks**: Task 9
  - **Blocked By**: Tasks 3, 6

  **References**:

  **Pattern References**:
  - `src/components/ui/button.tsx` - UI Component Pattern
  - `src/components/PilotCard.tsx` - Component mit Props
  
  **Documentation References**:
  - Alle Componenten in `src/components/` die Mutations enthalten

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test file: `src/components/__tests__/ReadOnlyGuard.test.tsx`
  - [ ] Test: Im Gast-Modus → Children nicht gerendert
  - [ ] Test: Im Admin-Modus → Children gerendert
  - [ ] `bun test src/components/__tests__/ReadOnlyGuard.test.tsx` → PASS

  **Automated Verification (Playwright):**
  ```
  # e2e/guest-readonly.spec.ts
  1. Navigate to: http://localhost:5173 (no auth)
  2. Assert: Button "Pilot hinzufügen" NOT visible
  3. Assert: Button "Ergebnis eintragen" NOT visible
  4. Assert: Bracket-Visualisierung visible (read-only content)
  5. Screenshot: .sisyphus/evidence/guest-readonly.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add ReadOnlyGuard for guest mode`
  - Files: `src/components/ReadOnlyGuard.tsx`, updates to mutation-containing components

---

- [ ] 8. Export Functions (CSV, JSON)

  **What to do**:
  - Export-Service erstellen:
    - `exportTournamentCSV()` → Download als CSV
    - `exportTournamentJSON()` → Download als JSON
  - CSV Format:
    - Pilots: Name, Final Place, Heats Participated
    - Heats: Number, Pilots, Results, Times
    - Results: Heat, Pilot, Rank
  - JSON Format: Vollständiger Tournament-State
  - UI: Export-Buttons in Settings oder Results-View

  **Must NOT do**:
  - Kein PDF Export (nur CSV, JSON)
  - Keine Server-Side Export (alles Client-Side)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward Data Transformation
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 7)
  - **Blocks**: Task 9
  - **Blocked By**: Task 4 (needs synced data)

  **References**:

  **Pattern References**:
  - `src/lib/csv-import.ts` - Existing CSV Handling (papaparse)
  - `src/stores/tournamentStore.ts:813-893` - getTop4Pilots für Platzierungen
  
  **External References**:
  - papaparse (already installed): https://www.papaparse.com/

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test file: `src/lib/__tests__/export.test.ts`
  - [ ] Test: CSV Export enthält alle Piloten mit Platzierung
  - [ ] Test: JSON Export enthält vollständigen State
  - [ ] Test: CSV Download triggert File-Download
  - [ ] `bun test src/lib/__tests__/export.test.ts` → PASS

  **Automated Verification:**
  ```bash
  # Verify CSV structure
  bun test src/lib/__tests__/export.test.ts
  # Assert: CSV has headers "Name,Place,Heats"
  ```

  **Commit**: YES
  - Message: `feat(export): add CSV and JSON export functions`
  - Files: `src/lib/export.ts`, `src/components/ExportButtons.tsx`

---

- [ ] 9. Integration & E2E Tests

  **What to do**:
  - Integration Tests:
    - Full Sync Flow: Zustand Mutation → PocketBase → Subscription → UI Update
    - Offline Flow: Mutation → Queue → Reconnect → Sync
  - E2E Tests (Playwright):
    - Admin Flow: Login → Create Tournament → Add Pilots → Run Heats
    - Guest Flow: Open Link → See Live Updates
    - Real-time: Admin ändert → Guest sieht Update (dual browser)
  - Test Fixtures: Mock PocketBase für Unit Tests, Real PocketBase für E2E

  **Must NOT do**:
  - Keine Änderung bestehender Tournament-Logic Tests
  - Keine Performance/Load Tests

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Komplexe Test-Szenarien mit Multiple Contexts
  - **Skills**: [`playwright`, `git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on all previous)
  - **Parallel Group**: Sequential
  - **Blocks**: Task 10
  - **Blocked By**: Tasks 4, 5, 6, 7, 8

  **References**:

  **Pattern References**:
  - `tests/` - Existing Test Structure
  - `vitest.config.ts` - Vitest Configuration
  
  **External References**:
  - Playwright Multi-Browser: https://playwright.dev/docs/browser-contexts

  **Acceptance Criteria**:

  **Automated Verification:**
  ```bash
  # Unit & Integration Tests
  bun test
  # Assert: All tests pass
  
  # E2E Tests
  bunx playwright test
  # Assert: All E2E scenarios pass
  ```

  **Evidence to Capture:**
  - [ ] `bun test` output showing all sync tests pass
  - [ ] Playwright traces in `e2e/test-results/`
  - [ ] Screenshots in `.sisyphus/evidence/`

  **Commit**: YES
  - Message: `test(e2e): add integration and E2E tests for PocketBase sync`
  - Files: `e2e/*.spec.ts`, `src/**/__tests__/*.test.ts`

---

### Wave 4: Deployment

- [ ] 10. Coolify Deployment

  **What to do**:
  - PocketBase Docker Container für Coolify:
    - `docker-compose.pocketbase.yml` finalisieren
    - Volume für `pb_data` (SQLite + Uploads)
    - Environment Variables (Admin Email, Password)
  - Frontend Build mit PocketBase URL:
    - `VITE_POCKETBASE_URL` für Production
  - Coolify Setup:
    - PocketBase als separater Service
    - Frontend als Static Site
  - Backup-Strategie dokumentieren

  **Must NOT do**:
  - Keine komplexe Cluster-Konfiguration
  - Keine automatisierten Backups (dokumentieren reicht)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: DevOps/Deployment Konfiguration
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: NO (final task)
  - **Parallel Group**: Sequential (Wave 4)
  - **Blocks**: None (final)
  - **Blocked By**: Tasks 1, 9

  **References**:

  **Pattern References**:
  - Existing Dockerfile or deployment config (if any)
  
  **External References**:
  - Coolify PocketBase: https://coolify.io/docs/resources/databases/pocketbase
  - PocketBase Docker: https://pocketbase.io/docs/going-to-production/#using-docker

  **Acceptance Criteria**:

  **Automated Verification:**
  ```bash
  # Verify Docker builds
  docker compose -f docker-compose.pocketbase.yml build
  # Assert: Exit code 0
  
  # Verify containers start
  docker compose -f docker-compose.pocketbase.yml up -d
  docker compose -f docker-compose.pocketbase.yml ps
  # Assert: All containers "running"
  ```

  **Documentation:**
  - [ ] `docs/deployment.md` mit Coolify Setup-Anleitung
  - [ ] `.env.production.example` mit allen nötigen Variables

  **Commit**: YES
  - Message: `chore(deploy): add Coolify deployment configuration`
  - Files: `docker-compose.pocketbase.yml`, `docs/deployment.md`, `.env.production.example`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(backend): add PocketBase schema and Docker config` | docker-compose, pb_migrations, schema.ts | docker compose up |
| 2 | `feat(backend): add PocketBase client and types` | client.ts, types.ts | bun test |
| 3 | `feat(auth): add useRole hook` | useRole.ts, RoleContext.tsx | bun test |
| 4 | `feat(sync): add Zustand sync middleware` | sync.ts, store update | bun test |
| 5 | `feat(sync): add offline queue` | offline-queue.ts | bun test |
| 6 | `feat(realtime): add subscription layer` | subscriptions.ts | bun test |
| 7 | `feat(ui): add ReadOnlyGuard` | ReadOnlyGuard.tsx | bun test |
| 8 | `feat(export): add CSV/JSON export` | export.ts | bun test |
| 9 | `test(e2e): add integration tests` | e2e/*.spec.ts | playwright test |
| 10 | `chore(deploy): add Coolify config` | docker-compose, docs | docker build |

---

## Success Criteria

### Verification Commands
```bash
# All unit tests pass
bun test

# E2E tests pass
bunx playwright test

# PocketBase is healthy
curl http://localhost:8090/api/health

# Frontend builds without errors
bun run build

# Docker containers start
docker compose -f docker-compose.pocketbase.yml up -d
```

### Final Checklist
- [ ] Admin kann Turnier durchführen (bestehendes Frontend unverändert)
- [ ] Alle Mutationen syncen automatisch zu PocketBase
- [ ] Gäste sehen Live-Updates via öffentlichem Link
- [ ] Bei Offline: Admin arbeitet weiter, Sync-Queue funktioniert
- [ ] Export CSV/JSON funktioniert
- [ ] Alle neuen Funktionen haben Tests (TDD)
- [ ] Keine Änderung an bestehender Bracket-Logik
- [ ] Keine neuen Features außerhalb des Scopes
- [ ] PocketBase läuft in Coolify
