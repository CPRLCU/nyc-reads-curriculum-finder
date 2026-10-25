# NYC Curriculum Finder

Search NYC schools by date, district, school, and grade to instantly see:

- Curriculum (HMH Into Reading, EL Education, Wit & Wisdom)
- Current module (based on the selected date)
- Essential question
- Book list

## Quick start

Serve the folder locally:

```bash
cd "/Users/sandychan/Desktop/NYC Curriculum Finder"
python3 -m http.server 5173
```

Open `http://localhost:5173` in your browser.

## Vercel (Serverless) Deployment

This repo is structured for Vercel to host both the static frontend and a Python Flask API:

- Static frontend is served from `public/`
- Flask API runs as a Python Serverless Function in `api/index.py`

### Requirements

```bash
npm i -g vercel
```

### Local development

```bash
vercel dev
```

Then:
- UI: http://localhost:3000/
- API: http://localhost:3000/api/search?... and http://localhost:3000/api/meta, http://localhost:3000/api/modules

### Stored curriculum translations

Curriculum module titles, essential questions, text genres, and book titles can be translated in an offline batch. Translated book titles are displayed beside their original English titles; the original remains the linked title. School names, curriculum names, book links, and cover art are unchanged. The live site only reads the checked-in translation bundle and does not call a translation service.

Run the translation workflow in a separate Python environment; the model dependencies are not required by the deployed API:

```powershell
py -m pip install -r scripts/requirements-translation.txt
py scripts/translate_curriculum.py export
py scripts/translate_curriculum.py translate
```

The export command fetches the current pacing-guide sheet and writes unique source strings to `data/curriculum_translation_sources.json`. The translate command uses Meta's [MIT-licensed M2M100 model](https://huggingface.co/facebook/m2m100_418M) to add missing entries to `data/curriculum_translations.json` for Arabic, Bangla, French, Haitian Creole, Korean, Mandarin Chinese, Russian, Spanish, and Urdu. It reuses existing entries so unchanged source text is not translated again. Review machine-generated educational text and title translations with fluent speakers before committing the bundle. If the tokenizer does not support a requested language code, the command stops with an error rather than silently substituting another translation.

#### Updating curriculum data and translations

1. Update the published pacing-guide Google Sheet as usual. The export reads the current sheet configured by `SHEET_ID` and `GID_FOR_PACING` in `api/_shared.py` (or the corresponding environment variables).
2. Refresh the source manifest from the repository root:

   ```powershell
   py scripts/translate_curriculum.py export
   ```

   This collects unique module/theme titles, essential questions, genres, and book titles. Source text is keyed by a SHA-256 hash so unchanged entries keep their existing translations.
3. Generate only missing translations:

   ```powershell
   py scripts/translate_curriculum.py translate
   ```

   This fills `data/curriculum_translations.json` for all nine non-English locales. To generate only selected locales, pass their codes, for example `--locales fr es`.
4. Review the generated strings with fluent speakers. Correct wording directly in `data/curriculum_translations.json`, under `locales` → language code → source-text hash. Keep the original English source and book title intact; book translations render beside their English titles. The JSON bundle is the deployed source of truth, so hand-reviewed corrections persist and are not overwritten for unchanged source strings.
5. Run the tests and commit the updated translation bundle. If a source string is edited, its hash changes and the next translation run adds a translation for the new text while retaining the previous entry. Missing translations display the English source as a fallback.

The UI also displays a translated-language notice below the existing disclaimer to let visitors know that online resources were used to create translations and invite feedback about major errors. `vercel.json` explicitly includes the translation bundle in the Python function package so the same saved translations are available after deployment.

Notes:
- The Flask app in `api/index.py` defines routes without the `/api` prefix (e.g. `/search`), which Vercel mounts at `/api/search`.
- Frontend fetches use relative paths: `/api/meta`, `/api/search`, `/api/modules`.
- Ensure the hero image exists at `public/assets/nycreads-web-header.png`. If needed, copy it:

```bash
mkdir -p public/assets
cp assets/nycreads-web-header.png public/assets/
```

### Deploy

```bash
vercel
```

## Vercel Deployment

- UI (static): `/` served from `public/`
- API (serverless Python Flask): `/api/meta`, `/api/search`, `/api/modules` handled by `api/index.py`
- Routing/builds are controlled by `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    { "src": "api/index.py", "use": "@vercel/python" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "api/index.py" },
    { "src": "/(.*)", "dest": "/public/$1" }
  ]
}
```

Notes:
- Ensure `public/index.html` exists (static entrypoint).
- Frontend fetch paths are relative (`/api/meta`, `/api/search`, `/api/modules`) and will work both locally via `vercel dev` and in production.
- Keep Python dependencies in `requirements.txt` for the serverless function.

## Configure Google Sheet

This app loads data from a published Google Sheet with two tabs: `Pacing Guide` and `School Directories`.

1) Publish your sheet to the web (File → Share → Publish to web), ensure it’s visible to anyone with the link.
2) Copy the published base URL in this form (note `/pub`):

```
https://docs.google.com/spreadsheets/d/e/XXXX/pub
```

3) In `scripts/main.js`, update the config:

```js
const CONFIG = {
  SHEET_BASE_PUB: https://docs.google.com/spreadsheets/d/e/2PACX-1vSE0Mlty0JFy27H58nEULY3GNCsvwyCfIw4CQvf2_KbXsGXa4GIhU_SQojf5eXdz1MkKO7se9lJyjZT/pub,
  SHEETS: {
    pacingGuide: Pacing
