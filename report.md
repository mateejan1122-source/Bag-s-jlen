# Features and Fixes Report - March 14, 2026

Today's session focused on stabilizing the newsletter system, enhancing the admin dashboard, and optimizing the AI chatbot's logic and connectivity.

## 1. Newsletter System Enhancements
- **Automatic Welcome Emails**: Successfully implemented a system where new subscribers automatically receive a "Thank You" email upon signing up via the footer.
- **Editable Email Templates**: Added a new section in **Settings → Email Templates** allowing admins to customize the Newsletter Welcome email's subject and body for Danish, English, and German.
- **Subscriber Count Fix**: Resolved a data discrepancy where the dashboard showed 0 subscribers despite records existing. The query now correctly uses the `subscribed_at` column.
- **Default Content Seeded**: Populated the database with high-quality default templates for the newsletter welcome email in all three supported languages.

## 2. Admin Dashboard Improvements
- **Total Tables Booked Card**: Replaced the "Daily Visitors" placeholder with a functional "Total Tables Booked" card.
- **Dynamic Table Management**: Admins can now click the card to update the restaurant's total capacity, which immediately updates the booking ratio (e.g., "10 / 100 tables").
- **Reservation Auto-Confirmation**: Updated the booking workflow so all guest reservations (via Chat, Inline Form, or Homepage) are automatically set to `confirmed` status.

## 3. AI Chatbot Optimization
- **Connectivity Fix**: Resolved a `401 Unauthorized` issue that prevented the chatbot from generating replies for public website visitors.
- **Extended Memory**: Increased the conversation history window from 10 to 30 messages, allowing the AI to remember context in long-form booking discussions.
- **Improved Booking Logic**: Rewrote the system prompt to enforce better state tracking. The AI now remembers previously provided details (guests, time, date) and only asks for missing information.
- **Language Consistency**: The AI now strictly adheres to the user's language (Danish, English, or German) throughout the session.

## 4. Technical Infrastructure
- **Unified Email Handler**: Integrated the newsletter welcome email into the robust `send-booking-email` edge function, ensuring it uses the same SMTP configuration as reservation confirmations.
- **GitHub Synchronization**: All changes have been committed and pushed to the repository at [mateejan1122-source/Bag-s-jlen](https://github.com/mateejan1122-source/Bag-s-jlen).

---
**Status**: All requested fixes are live and verified.
**Action Required**: Ensure the project is redeployed to your hosting provider (Vercel/Netlify) to reflect the frontend and edge function changes.
