# Vans Custom Order Form — Azure Static Web Apps deployment (final, correct structure)

This is the complete, correct file set — everything from earlier attempts
consolidated into one clean folder tree. Use this to replace what's
currently in your GitHub repo.

## The exact folder structure (this matters)

```
vans-order-form/
├── index.html
├── staticwebapp.config.json
├── README.md
└── api/
    ├── host.json
    ├── package.json
    ├── local.settings.json.example
    └── submissions/
        ├── function.json
        └── index.js
```

Azure's Static Web App is configured with "Api location: `api`" — so
everything backend-related MUST be nested inside a folder literally named
`api`, and the function itself inside `api/submissions/`. Nothing should
sit loose at the repo root except `index.html`, `staticwebapp.config.json`,
and this README.

## How to use this to fix your repo

**Recommended: replace everything at once, rather than moving files
around one by one.**

1. In GitHub Desktop, go to **Repository → Show in Finder** to find your
   local repo folder.
2. Delete **everything** inside that folder (all the loose files from
   earlier attempts — `oldindex.html`, `oldpackage.json`, `submissions.js`,
   loose `function.json`/`index.js`/`host.json`/`package.json` at the root,
   all of it). Leave the `.git` folder and `.github` folder alone if you
   see them (hidden folders — don't touch those).
3. Copy every file from this download into that now-empty folder, keeping
   the `api/submissions/` nesting exactly as shown above.
4. Back in GitHub Desktop, you'll see a large list of changes (deletions
   and additions) — that's expected and correct.
5. Commit with a message like "clean up folder structure."
6. Click **Push origin**.

## After pushing
Check the **Actions** tab on GitHub for the new deployment run. Once it
shows a green checkmark, give it a minute, then retest submitting an entry
on your live site.

## Configuration reminder
These two still need to be set in the Static Web App's **Configuration**
in the Azure Portal (this part doesn't change with this file update):
- `AZURE_TABLES_CONNECTION_STRING` — from your storage account's Access keys
- `TEAM_ACCESS_CODE` — whatever code your team uses to unlock the master sheet
