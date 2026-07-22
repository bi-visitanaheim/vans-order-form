# Vans Custom Order Form — Azure Static Web Apps deployment

Same form, same guest experience, running on Azure instead of Claude or
Vercel — likely the closest fit to Visit Anaheim's existing Microsoft 365
environment.

## What's in this folder
- `index.html` — the guest-facing form + team master sheet. **Identical** to
  the Vercel version — Azure Static Web Apps uses the same `/api` routing
  convention, so nothing on the frontend needed to change.
- `api/` — an Azure Function (v4 programming model) that replaces Vercel's
  API route, using **Azure Table Storage** instead of Vercel KV.
- `staticwebapp.config.json` — tells Azure the `/api/*` routes are public
  (guests need to reach them without logging in).

## Setup

### 1. Push this folder to a GitHub repo
Same as the Vercel version — create a repo, push these files.

### 2. Create the Static Web App resource
In the Azure Portal: **Create a resource → Static Web App**.
- Pick the **Free** or **Standard** plan (Free is fine for a one-day event).
- Under "Deployment details," connect it to your GitHub repo and branch.
- App location: `/` — API location: `api` — Output location: (leave blank).

Azure automatically creates a GitHub Actions workflow in your repo that
builds and deploys on every push — no manual deploy steps after this.

### 3. Create a Storage Account (for Table Storage)
In the Azure Portal: **Create a resource → Storage account** (any name,
Standard performance, LRS redundancy is fine for this use case).
Once created, go to **Access keys** and copy a **Connection string**.

### 4. Add configuration to the Static Web App
In your Static Web App resource: **Settings → Configuration → Add**:
- `AZURE_TABLES_CONNECTION_STRING` = the connection string from step 3
- `TEAM_ACCESS_CODE` = whatever code your team should use to unlock the
  master sheet

Save — this triggers the Function app to restart with the new settings.

### 5. Test it for real
- Open the URL Azure gives your Static Web App
  (`https://<something>.azurestaticapps.net`).
- Submit a test entry.
- Unlock the master sheet with your access code and confirm it shows up.
- Open the same URL on a second device to confirm syncing works.

## Local development (optional)
If you want to test the Function app locally before deploying:
1. `cd api && npm install`
2. Copy `local.settings.json.example` to `local.settings.json` and fill in
   real values (this file is gitignored — never commit real secrets).
3. `npm start` (requires the Azure Functions Core Tools installed).

## What changed from the Vercel version
- The frontend `index.html` is untouched.
- The API implementation swapped from Vercel KV to Azure Table Storage —
  functionally identical (each submission is one record), just a different
  SDK (`@azure/data-tables` instead of `@vercel/kv`).
- The access code is still checked **server-side only**, in the Function
  app — never shipped to the browser.
