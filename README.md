# GrowStrong Achievers Leads Dashboard — Login Edition

## Setup
1. Create a user in Supabase > Authentication > Users > Add user. Use the staff email and password that you created, and confirm the email when applicable.
2. Edit `config.js`: enter the same project's URL and its **publishable** key (or legacy anon key). Never enter any secret or service-role key.
3. Verify existing RLS: authenticated users require a SELECT policy for `public.gsa_leads`. The application never requires anonymous SELECT access.
4. In GitHub, upload the 4 web files (`index.html`, `style.css`, `app.js`, `config.js`) to the repository root, replacing the old versions. Keep `README.md` optional.
5. Under Settings > Pages, select Deploy from branch, main, root. Open the GitHub Pages URL, log in with your Supabase Authentication user, and search leads.
6. If old content persists, refresh with Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac).

## Security requirement before wider deployment
Current RLS policies `TO authenticated USING (true)` allow **every authenticated user** in this Supabase project to read all leads. Disable public sign-ups in Supabase Auth, provision only approved staff, and ideally add a dedicated staff allowlist RLS policy before broad use. Do not disable RLS. Never use an `anon` SELECT policy for this private data.

## Features
Email/password login, persistent session, logout, parent/child/mobile/email search, center/status/program filters, statistics for the first 1000 returned leads. This release is read-only.
