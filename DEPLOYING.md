# Deploying the CHYK Website

## Fastest method

1. Double-click `MAKE HOSTING PACKAGE.cmd`.
2. Wait for the `dist` folder to open.
3. Drag the complete `dist` folder into Netlify Drop, or upload its contents to any static host.

## Vercel or Netlify through Git

Import this repository normally. The included `vercel.json` and `netlify.toml`
automatically build and publish only the clean `dist` folder.

Never upload `content-manager`, `node_modules`, `_SOURCE FILES`, or backups.
