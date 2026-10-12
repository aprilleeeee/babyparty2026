# Baby Voting Pool

## Setup (free)
1. Create a Supabase project.
2. In SQL Editor, run `schema.sql`.
3. In Authentication > Users, create your organiser email/password.
4. Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` in `supabase.js`.
5. Upload the folder to Netlify, GitHub Pages, or another static host.

## Pages
- `index.html`: public voting, confirmation, leaderboard, results.
- `admin.html`: protected organiser dashboard.
- Admin can mark offline payments as paid, delete entries, close voting, and reveal Boy/Girl.

## Notes
This implementation intentionally has no payment gateway. Each submitted entry is RM10 and the admin reconciles cash manually.
For a private event, keep the admin URL private and use a strong Supabase Auth password.
