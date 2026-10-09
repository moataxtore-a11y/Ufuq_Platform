# Keeping Supabase active

The GitHub Actions workflow `.github/workflows/supabase-keep-alive.yml` reads
at most one user ID every six hours. It discards the response and fails visibly
when the query fails. It runs independently of the application server.

## Setup

1. Push the workflow to the GitHub repository's default branch.
2. In **Settings → Secrets and variables → Actions**, add repository secrets:
   - `SUPABASE_URL`: the project's Supabase URL.
   - `SUPABASE_SERVICE_KEY`: the backend's service role JWT key. Keep it secret;
     never add it to frontend code or commit it.
3. In **Actions → Supabase keep alive**, choose **Run workflow** and confirm
   that the run succeeds.
4. If the Supabase project is already paused, restore it in the Supabase
   dashboard first.

Scheduled workflows require Actions to be enabled and run from the default
branch. GitHub can delay scheduled runs and disables scheduled workflows in
public repositories after 60 days without repository activity. Check that the
workflow remains enabled.

Supabase Free projects with low database activity over seven days can be
paused. Periodic queries help keep the project active but do not guarantee
exemption. A paid Supabase plan prevents automatic inactivity pausing.

References:
- https://supabase.com/docs/guides/platform/free-project-pausing
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule
