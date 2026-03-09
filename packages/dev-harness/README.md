# Plotpaper Dev Harness

Local development environment for building Plotpaper mini apps with hot reload.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure `plotpaper.config.ts`:
   - Set `instantdbAppId` to your InstantDB app ID (create one at [instantdb.com](https://instantdb.com))
   - Customize mock user info, credits, and app metadata as needed

3. Create your schema in your InstantDB dashboard (matching what your app expects)

4. Replace `src/App.tsx` with your mini app code

5. Start the dev server:
   ```bash
   npm run ios
   # or
   npm run android
   ```

## How it works

- Your app code imports from `@plotpaper/mini-app-sdk` — this resolves to a local mock that provides the full SDK interface
- **Database**: Real InstantDB instance (you provide the app ID). Full `useQuery`/`transact`/`tx` support with live subscriptions.
- **Theme**: Real Plotpaper light/dark colors. Toggle via the Dev Tools panel.
- **AI**: Returns placeholder responses. Good for testing UI flow without burning credits.
- **Credits, notifications, feed actions**: Mocked locally. Visible in the Dev Tools panel.
- **SDK call logging**: Every SDK call is logged and viewable in Dev Tools.

## Dev Tools

Tap the wrench icon (top-right) to open the Dev Tools panel:

- **Theme**: Toggle light/dark mode
- **Credits**: See current mock balance
- **Feed Action**: Preview the current feed action card
- **Notifications**: See scheduled notifications
- **SDK Logs**: See all SDK method calls with timestamps

## File structure

```
src/App.tsx              ← Your mini app code goes here
plotpaper.config.ts      ← InstantDB app ID and mock settings
mini-app-sdk/            ← Local @plotpaper/mini-app-sdk implementation
components/DevToolbar.tsx ← Dev tools panel
app/                     ← Expo Router screens (don't edit)
```
