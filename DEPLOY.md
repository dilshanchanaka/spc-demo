# Free live-demo deployment (no credit card)

| Part | Where | Free plan notes |
|---|---|---|
| Database (PostgreSQL) | **Neon** (neon.com) | permanent free plan, no card |
| API (ASP.NET Core 8, Docker) | **Render** (render.com) | free web service, sleeps after 15 min idle, ~1 min to wake |
| Frontend (React/Vite) | **Vercel** (or Netlify / Cloudflare Pages) | free static hosting |

Your original project uses SQL Server, which no free host offers, so the API now
also supports PostgreSQL. It picks the database from the connection string:
Postgres on the hosted demo, SQL Server locally (your old setup still works).
Tables and demo data are created automatically on first start.

## 1. Push to GitHub
```
cd spc-deploy
git init && git add . && git commit -m "SPC demo"
# create an empty repo on github.com, then:
git remote add origin https://github.com/<you>/spc.git
git push -u origin main
```

## 2. Database - Neon
1. Sign up at neon.com, create a project (any region near you, e.g. Singapore).
2. Copy the **connection string** (looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`).

## 3. API - Render
1. New > **Web Service** > connect your GitHub repo.
2. Settings: **Root Directory** `SPC.API`, **Runtime** `Docker`, **Instance type** `Free`.
3. Environment variables:
   - `ConnectionStrings__DefaultConnection` = the Neon string from step 2
   - `Jwt__Key` = any random string of 32+ characters
   - `Cors__AllowedOrigins` = your frontend URL (fill in after step 4, then redeploy)
4. Deploy. When it is live, open `https://<your-api>.onrender.com/health` - it should say `ok`.

## 4. Frontend - Vercel
1. New Project > import the same repo, **Root Directory** `SPC-Frontend` (framework: Vite).
2. Environment variable: `VITE_API_URL` = `https://<your-api>.onrender.com` (no trailing slash).
3. Deploy, then copy the Vercel URL back into Render's `Cors__AllowedOrigins` and redeploy the API.

## Demo accounts (created automatically)
| Role | Email | Password |
|---|---|---|
| Admin | admin@spc.lk | Admin@123 |
| Plant | plant@spc.lk | Plant@123 |
| Warehouse | warehouse@spc.lk | Warehouse@123 |
| Pharmacy | pharmacy@spc.lk | Pharmacy@123 |
| Supplier | supplier@spc.lk | Supplier@123 |

`pending@spc.lk` / `Pending@123` is an unapproved supplier so you can demo the admin approval screen.

## Before the demo
- The free API sleeps when idle. Open the `/health` URL about a minute before you present.
  A free monitor such as UptimeRobot pinging `/health` every 5 minutes keeps it awake.
- Change the passwords above if the link will be public.

## Local development
Nothing changes: keep the SQL Server connection string in `appsettings.json` and
run the frontend with `npm run dev`. To try Postgres locally set
`ConnectionStrings__DefaultConnection` to a `Host=...;Database=...;Username=...;Password=...` string.
