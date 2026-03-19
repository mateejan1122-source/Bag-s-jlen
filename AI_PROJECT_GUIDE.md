# Bag Søjlen - AI Project Guide & Instructions

This guide is designed for AI IDEs/Agents to understand the project structure, prioritize file reading, and optimize token usage.

## 🚀 Project Overview
- **Brand**: Bag Søjlen (Restaurant) & Ishus Bag Søjlen (Ice Cream Parlor).
- **Core Goal**: Conversion-optimized restaurant bookings and brand presentation for the ice cream parlor.
- **Backend**: Custom admin dashboard managing reservations, menu, content, and events.

## 🛠️ Tech Stack
- **Frontend**: React (Vite), TypeScript, Vanilla CSS/Styled Components.
- **Backend/DB**: Supabase (PostgreSQL, Auth, Edge Functions).
- **Hosting**: Vercel.

## 📂 File Categorization (Token Optimization)

### 🔴 High-Impact / Frequent Edit Files (Read First)
These files contain the core logic and UI and are changed almost every session:
- `pages/HomeSplit.tsx`: Main restaurant landing page logic.
- `pages/AdminDashboard.tsx`: Admin interface entry point and routing.
- `pages/admin/*.tsx`: Individual admin tabs (e.g., `ReservationsTab.tsx`, `SettingsTab.tsx`).
- `components/Header.tsx` & `components/Footer.tsx`: Global layout elements.
- `components/ChatWidget.tsx`: AI Chat integration.
- `translations.ts`: Global multi-language dictionary (DA, EN, DE).
- `types.ts`: Global TypeScript interfaces.
- `lib/supabase.ts`: Database client configuration.
- `supabase/functions/*`: Edge Functions for critical logic (Email, Translation, Booking).

### 🟢 Static / One-Off / Generated Files (Ignore unless requested)
These files were created for specific migrations or tests and rarely changed after:
- `Bagsojlen.md`: Large project research/audit document (Context only).
- `scripts/*.js` / `*.cjs`: Database seeders, schema updates, or manual migration scripts.
- `migrate_italian_event.js`, `update_reviews_schema.js`: Migration scripts.
- `check_columns.cjs`, `add_newsletter_language.cjs`: One-off utility scripts.
- `report.md`, `reportfile.md`: Previous analysis outputs.
- `push-guide.md`: Deployment instructions.

## 🧠 Instructions for the AI IDE

### 1. Translation Flow
When adding new text, **always** update `translations.ts` instead of hardcoding strings. The project supports Danish (primary), English, and German. Use the `translate` Edge Function logic for automated translations if available.

### 2. Admin Tab Pattern
To add a new feature to the dashboard:
1. Create a new file in `pages/admin/`.
2. Register it in `pages/AdminDashboard.tsx`.
3. Add corresponding icons and labels in the selection logic.

### 3. Supabase Integration
- Queries should generally happen via `lib/supabase.ts`.
- Complex logic (sending emails, AI handling) should reside in `supabase/functions/`.

### 4. Code Style
- Use **Vanilla CSS** or existing component patterns.
- Stick to functional React components with hooks.
- Prefix IDs for interactive elements to facilitate browser testing.

---
*Created on 2026-03-18 to streamline AI collaboration.*
