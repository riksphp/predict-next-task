### Next Task Predictor (base-truths)

Minimal Chrome Extension (Manifest V3) built with React 18, TypeScript, Vite, and Tailwind CSS.

- **Popup shows**: five base truths
- **Context input**: textarea for extra context (name, profession, todo, constraints)
- **Action**: “Predict Next Task” → returns placeholder text (ready to be wired to real logic)

---

### Tech Stack

- React 18 + TypeScript
- Vite (build and dev server)
- Tailwind CSS (via PostCSS)
- ESLint (React + TS + Hooks + a11y) and Prettier

---

### Project Structure

```
base-truths/
  public/
    manifest.json        # MV3 manifest (popup points to index.html; uses storage permission)
    icon128.png          # Extension icon
  src/
    features/
      nextTaskPredictor/
        components/
          Popup.tsx      # Popup UI: base truths, context, predict button
        data-layer/
          baseTruths.ts  # Hardcoded base truths JSON (exported)
          storage.ts     # chrome.storage.local with localStorage fallback
        data-store/
          userContextStore.tsx  # React context provider + hooks for user context
        services/
          predictService.ts     # Placeholder prediction service
    main.tsx             # React entry; wraps Popup with UserContextProvider
    styles.css           # Tailwind entry (@tailwind base/components/utilities)
  index.html             # Vite HTML; used as the popup page
  vite.config.ts         # Vite config with React plugin
  tailwind.config.ts     # Tailwind content globs
  postcss.config.js      # Tailwind + autoprefixer
  tsconfig.json          # TypeScript config
  package.json           # Scripts (dev/build/preview/lint) and deps

# Note: legacy files (manifest.json, popup.html, popup.js in this folder root)
# were from an earlier plain MV3 POC; the extension build now uses /public/manifest.json.
```

---

### Scripts

Run these in `base-truths/`:

```bash
npm i                # install deps
npm run dev          # Vite dev server (web preview)
npm run build        # TS type-check + Vite build → dist/
npm run preview      # Preview the production build
npm run lint         # ESLint (TS, React, Hooks, a11y)
```

---

### Load the Extension in Chrome (MV3)

1. `npm run build` to produce `dist/`
2. Open `chrome://extensions`
3. Toggle on Developer Mode (top-right)
4. Click “Load unpacked” → select `.../EAGV2/base-truths/dist`
5. Pin the extension and open the popup

The popup uses `index.html` built by Vite; the MV3 manifest is copied from `public/manifest.json`.

---

### Architecture

- **Feature module**: `src/features/nextTaskPredictor`
  - `components/Popup.tsx`: Renders base truths, textarea, predict button
  - `data-layer/baseTruths.ts`: Hardcoded base truths JSON
  - `data-layer/storage.ts`: Persistence via `chrome.storage.local`; falls back to `localStorage` in dev
  - `data-store/userContextStore.tsx`: React context for user context state and pretty JSON
  - `services/predictService.ts`: Placeholder suggestion generator
- **Entry**: `src/main.tsx` mounts `<Popup />` wrapped by `<UserContextProvider>` into `#root` in `index.html`.
- **Styling**: Tailwind classes in JSX; generated from `src/styles.css` with `@tailwind` directives.
- **Build**: Vite outputs assets to `dist/` (`vite.config.ts`), and Chrome loads `dist/index.html` as the popup defined in `public/manifest.json`.
- **No background/content scripts** in this minimal version. Add a `service_worker` later if you integrate real prediction logic.

#### Storage behavior

- Uses `chrome.storage.local` when running as an extension (MV3) with the `storage` permission.
- Falls back to `localStorage` when running via `npm run dev` (web preview).

---

### Tailwind Usage

- Utility-first classes are used directly in JSX (e.g., `min-w-[360px]`, `bg-neutral-950`, `text-white`).
- To customize, edit `tailwind.config.ts` and/or add component classes in `src/styles.css`.

---

### ESLint/Prettier

- ESLint rules for React, TypeScript, hooks, and accessibility are enabled via `.eslintrc.cjs`.
- Formatting via Prettier (`.prettierrc`) with ESLint config integration (`eslint-config-prettier`).

Run:

```bash
npm run lint
```

---

### Extend: Real Prediction

To replace the placeholder suggestion with real logic:

- Add a background `service_worker` and message from the popup, or
- Call a local model/remote API from the popup, handling CSP and permissions via `manifest.json`.

If adding a service worker, move/extend the MV3 manifest in `public/manifest.json` with the `background.service_worker` field and required permissions.
