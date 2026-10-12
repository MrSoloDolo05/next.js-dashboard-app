# Capstone Proposal: Tutoring Centre Management Dashboard

**Vercel URL:** https://tutor-dashboard-xyz.vercel.app *(replace with live URL after deploy)*

> What changed since proposal: Students entity shipped as proposed. Sessions
> entity shipped as proposed (FK `student_id → students.id`). The Utilisation
> Heatmap was simplified to a "completed sessions per month" bar so the
> honesty checklist (zero baseline, labelled axes) holds; the Subject Demand
> Trend became a session-status donut (same decision purpose: spot no-show
> loss). Roles cut to admin + tutor for the two-user RLS proof; centre-manager
> policies remain in SQL for later.

---

## Domain
A **Tutoring Centre Management Dashboard** for a multi-location tutoring business. Tutors, administrators, and centre managers track sessions, student progress, and tutor utilisation.

---

## Three Entities (replacing Customers / Invoices / Revenue)

| Original | New Entity | Fields |
|----------|------------|--------|
| **Customers** | **Students** | `id`, `name`, `email`, `phone`, `grade_level`, `subjects[]`, `parent_name`, `parent_phone`, `enrollment_date`, `status` (active/paused/graduated), `preferred_tutor_id` |
| **Invoices** | **Sessions** | `id`, `student_id`, `tutor_id`, `subject`, `date`, `start_time`, `end_time`, `duration_minutes`, `status` (scheduled/completed/cancelled/no-show), `location_id`, `notes`, `created_at` |
| **Revenue** | **Tutor Utilisation** | `id`, `tutor_id`, `month`, `total_hours`, `billable_hours`, `utilisation_rate`, `sessions_count`, `avg_rating`, `revenue_generated` |

---

## Two Charts (Decision-Focused Questions)

| Chart | Question It Answers | Decision It Drives |
|-------|---------------------|---------------------|
| **1. Utilisation Heatmap (Tutor × Week)** | "Which tutors are under/over-utilised in the current week?" | Rebalance schedules, hire/trim tutor roster, identify burnout risk. |
| **2. Subject Demand Trend (Monthly Bar + Line)** | "Which subjects are growing or declining month-over-month?" | Allocate marketing budget, recruit subject-specialist tutors, plan curriculum. |

---

## Roles & Permissions

| Role | Can View | Can Edit |
|------|----------|----------|
| **Admin** | All centres, all tutors, all students, financials | Everything (CRUD), manage roles |
| **Centre Manager** | Own centre's sessions, tutors, students | Schedule sessions, assign tutors, update student status |
| **Tutor** | Own sessions, own students' basic info | Update session notes, mark completion, view own utilisation |

> RLS policies will enforce: `centre_id` scoping for Managers, `tutor_id` scoping for Tutors.

---

## Stretch Feature: Realtime Session Status
**Supabase Realtime** on the `sessions` table. Centre Managers see a live board where session cards flip from "Scheduled" → "In Progress" → "Completed" as tutors update status from mobile. No refresh needed.