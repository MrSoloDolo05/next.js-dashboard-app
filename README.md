# Tutoring Centre Management Dashboard

A dashboard for a multi-location tutoring business. Centre staff track students, schedule tutoring sessions, and read two decision charts (session growth + no-show share).

**Production:** https://tutor-dashboard-xyz.vercel.app *(replace with your Vercel URL after first deploy)*

## DEMO LOGIN

- Admin: `admin@demo.example` (password shared verbally in the demo — never committed)
- Second user (RLS proof): `tutor2@demo.example`
- Create both in Supabase Dashboard → Authentication → Users, then set roles in `public.profiles` (`admin` for the demo admin). The `handle_new_user` trigger (migration `002`) auto-creates profile rows on signup.

## How to run

```bash
cp .env.example .env   # fill NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
pnpm install
pnpm dev               # http://localhost:3000
```

Supabase setup: run `supabase/migrations/001_create_students_table.sql` then `002_create_sessions_table.sql` in the Supabase SQL Editor.

Local Postgres tutorial tables (`pnpm db:up`, `pnpm db:seed`) are dev-only legacy and not used by the demo path.

## Tech stack and why

- **Next.js App Router + TypeScript** — Server Components stream charts; Server Actions handle CRUD with Zod validation.
- **Supabase Auth + Postgres RLS** — one auth system so `auth.uid()` policies enforce privacy; enables the two-user 42501 proof.
- **Tailwind CSS** — hand-rolled bar + donut charts (zero baseline, labelled axes) with no chart dependency.

## Known limitations

- Charts are hand-rolled divs/SVG (no chart library, limited accessibility and empty states).
- Realtime session board from the proposal is not implemented (manual refresh).

## What I would do next

1. Add Supabase Realtime on `sessions` for the live Scheduled → Completed board.
2. Replace hand-rolled charts with a chart library + the Tutor × Week utilisation heatmap from the proposal.
3. Add pagination/search to Students and Sessions tables.

## Smoke checks (tick on production before freeze)

- [ ] 1. Production URL loads: `/login` signed out, `/dashboard` signed in.
- [ ] 2. README has live link + demo login + run steps (names only, never secrets).
- [ ] 3. Signed-out `/dashboard` redirects to `/login`.
- [ ] 4. Students: create "Seed student 1", rename, delete; list updates.
- [ ] 5. Sessions: create with "Select a student" dropdown; edit; delete.
- [ ] 6. RLS: user two sees empty lists; pasting user-one edit URL → not-found; SQL cross-insert → 42501.
- [ ] 7. Chart 1 titled "Are sessions growing?…" with labelled axes from zero + decision line.
- [ ] 8. Chart 2 donut titled "What share of this month's sessions are no-shows?" with name+count.
- [ ] 9. `PROPOSAL.md` present with "what changed" note.
- [ ] 10. `git ls-files | grep env` shows only `.env.example`; newest Vercel Production = Ready.

## Backup recording

60–90s happy-path take on the production URL: link here after recording.
