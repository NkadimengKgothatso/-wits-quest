# Merge Anticheat (Oratile's Branch) & Migrate to Supabase

The goal of this task is to merge the Anticheat feature built by Oratile (`oratile_task6`) into the current branch (`mahlatse_task2`), and upgrade it to use the new Supabase PostgreSQL database instead of the in-memory array implementation it originally used.

## User Review Required

- **Supabase SQL Editor Action**: You will need to execute the SQL provided in the Verification Plan in your Supabase SQL Editor to create the `telemetry_pings` and `audit_records` tables.

## Proposed Changes

### Database Setup
The `telemetry.ts` route originally used in-memory arrays `pings` and `auditRecords`. We will migrate these to Supabase.
- Table `telemetry_pings` will store user GPS locations over time.
- Table `audit_records` will store actions taken by admins against users (e.g. warned, suspended).

### Backend (telemetry.ts & server.ts)
- `backend/src/routes/telemetry.ts` will be updated to fetch and insert records using `supabaseClient`.
- `backend/src/server.ts` will mount the telemetry router at `/api/telemetry`.

### Frontend
- Check out `frontend/src/utils/antiCheat.ts` and `frontend/src/screens/admin/AdminAntiCheat.tsx` from `oratile_task6`.
- Add `AdminAntiCheat` to the `App.tsx` routing.
- Add the `ANTI-CHEAT` tab to `BottomNav.tsx`.
- Update `MapExplorer.tsx` to ping the `/api/telemetry/ping` endpoint continuously as the user's location updates.
- Update `apiClient.ts` to include the new `telemetry` endpoints.

## Verification Plan

### Manual Verification
1. Open your Supabase SQL Editor and execute the following SQL to create the tables:
```sql
CREATE TABLE telemetry_pings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    incident_id TEXT,
    action TEXT NOT NULL,
    admin_email TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
```
2. Navigate to the Admin Dashboard and click the "Anti-Cheat" tab.
3. Open the Player app and walk around to trigger telemetry pings.
4. Verify the telemetry pings show up in the Admin Anti-Cheat dashboard.
