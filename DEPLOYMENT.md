# iGeo Operations System Deployment Guide

## Current Status

The app is a static site and can deploy from the repository root.

Required files:

- `index.html`
- `styles.css`
- `app.js`
- `branding-settings.js`
- `integration-config.js`
- `igeo-logo.png`
- `.nojekyll`
- `CNAME`

## GitHub Repository Setup

Because this workspace does not have authenticated GitHub access, create the repository in GitHub first.

Recommended repository name:

`igeo-operations-system`

Then run these commands from this project folder:

```powershell
$git = "C:\Users\davis\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe"
& $git --git-dir=.gitdata --work-tree=. remote add origin https://github.com/YOUR-GITHUB-USERNAME/igeo-operations-system.git
& $git --git-dir=.gitdata --work-tree=. push -u origin main
```

If using standard Git after creating a normal `.git` folder locally, use:

```powershell
git remote add origin https://github.com/YOUR-GITHUB-USERNAME/igeo-operations-system.git
git push -u origin main
```

## GitHub Pages Setup

1. Open the GitHub repository.
2. Go to `Settings`.
3. Go to `Pages`.
4. Under `Build and deployment`, choose:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Save.
6. Under `Custom domain`, enter:
   `igeosolutionsllc.com`
7. Save.
8. Enable `Enforce HTTPS` after DNS verification completes.

Expected GitHub Pages URL before custom DNS:

`https://YOUR-GITHUB-USERNAME.github.io/igeo-operations-system/`

Expected custom domain:

`https://igeosolutionsllc.com`

## Namecheap DNS For GitHub Pages

In Namecheap:

1. Open `Domain List`.
2. Select `igeosolutionsllc.com`.
3. Open `Advanced DNS`.
4. Remove conflicting parking, forwarding, or old website records for `@` and `www`.
5. Add these records:

| Type | Host | Value | TTL |
| --- | --- | --- | --- |
| A Record | @ | 185.199.108.153 | Automatic |
| A Record | @ | 185.199.109.153 | Automatic |
| A Record | @ | 185.199.110.153 | Automatic |
| A Record | @ | 185.199.111.153 | Automatic |
| CNAME Record | www | YOUR-GITHUB-USERNAME.github.io | Automatic |

Wait for DNS propagation, then verify the domain in GitHub Pages.

## Cloudflare Pages Setup

Cloudflare Pages can also deploy this static site from the same GitHub repository.

1. Open Cloudflare Dashboard.
2. Go to `Workers & Pages`.
3. Select `Create application`.
4. Choose `Pages`.
5. Connect to GitHub.
6. Select the `igeo-operations-system` repository.
7. Use these build settings:
   - Framework preset: `None`
   - Build command: leave blank
   - Build output directory: `/`
8. Deploy.

Expected Cloudflare Pages preview URL:

`https://igeo-operations-system.pages.dev`

## Namecheap DNS For Cloudflare Pages

Use this only if Cloudflare Pages is the primary public deployment instead of GitHub Pages.

| Type | Host | Value | TTL |
| --- | --- | --- | --- |
| CNAME Record | @ | igeo-operations-system.pages.dev | Automatic |
| CNAME Record | www | igeo-operations-system.pages.dev | Automatic |

If Namecheap does not allow a CNAME at `@`, move DNS nameservers to Cloudflare and configure the custom domain in Cloudflare Pages.

## Important

Do not point the same root domain to GitHub Pages and Cloudflare Pages at the same time. Choose one primary host for `igeosolutionsllc.com`.
