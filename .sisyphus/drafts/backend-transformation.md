# Draft: Backend-Transformation für Heats App

## Aktueller Stand (Research abgeschlossen)

### Tech Stack
- **Frontend**: React 18 + Vite (SPA)
- **State Management**: Zustand mit localStorage-Persist
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Testing**: Vitest + React Testing Library

### Kern-Entities (bestehend)
| Entity | Felder | Beschreibung |
|--------|--------|--------------|
| **Pilot** | `id`, `name`, `imageUrl?`, `instagramHandle?`, `status`, `droppedOut` | Turnierteilnehmer |
| **Heat** | `id`, `heatNumber`, `pilotIds[]`, `status`, `bracketType`, `results`, `roundNumber`, `isRematch`, `rematchForPlace` | Eine Runde mit 2-4 Piloten |
| **Ranking** | `pilotId`, `rank (1-4)` | Ergebnis eines Piloten in einem Heat |
| **TournamentState** | `pilots[]`, `heats[]`, `phase`, `winnerPilots[]`, `loserPilots[]`, `eliminatedPilots[]`, etc. | Globaler Turnier-Zustand |

### Aktuelle Persistenz
- **Storage Key**: `tournament-storage`
- **Mechanismus**: Zustand `persist` Middleware → localStorage
- **Daten**: Gesamter TournamentState als JSON-Blob

### Business Logic (komplex!)
- Double Elimination Bracket
- WB/LB Synchronisation
- Dynamische Heat-Generierung aus Pools
- Rematch-Logik für Grand Finale
- 60+ Piloten Support

---

## User Requirements (Interview)

### Rollen-Konzept
- **Admin**: 
  - Ergebnisse eintragen
  - Runden/Heats abschließen
  - Piloten hinzufügen
  - Turnier verwalten
- **Viewer**: 
  - Nur lesender Zugriff
  - Keine Eingaben möglich
  - Sieht Live-Updates

### Technische Anforderungen
- **Real-time**: WebSocket/Subscriptions für Live-Updates an alle Clients
- **Self-hosted**: Coolify (bereits vorhanden)
- **Datenbank**: PostgreSQL (Supabase vorgeschlagen)
- **Deployment**: Bestehendes SPA-Deployment erweitern

---

## Entscheidungen (bestätigt)

### 1. Deployment: Self-Hosted (Coolify)
- Supabase Self-Hosted via Docker Compose
- Min. 4GB RAM (8GB empfohlen)
- Volle Kontrolle, keine externe Abhängigkeit
- Coolify ist bereits vorhanden

### 2. Auth: Einfaches Passwort
- Admin: Passwort-geschützt
- Viewer: Offene URL (oder optionales View-Passwort)
- Keine User-Accounts nötig
- Implementierung: Server-seitiges Session-Token

### 3. Business Logic: Backend
- Turnier-Logik (Bracket, Heat-Generierung) in Edge/Serverless Functions
- Garantiert Datenintegrität bei Multi-Client (Admin + Viewer)
- Frontend wird "dünn" - nur UI + API-Calls

---

## Supabase Research (abgeschlossen)

### Real-time Pattern
```typescript
const channel = supabase.channel('tournament-updates')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'heats' },
    (payload) => updateUI(payload)
  )
  .subscribe()
```

### RLS für Admin/Viewer
```sql
-- Admin kann alles
create policy "Admin full access" on heats
  for all using (auth.jwt()->>'role' = 'admin');

-- Viewer nur lesen
create policy "Viewer read only" on heats
  for select using (true);
```

### Self-Hosted Requirements
- 4GB RAM min (8GB recommended)
- Docker Compose deployment
- Postgres, GoTrue (Auth), Realtime services
