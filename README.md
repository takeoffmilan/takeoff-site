# TakeOff Milan — Sito agenzia

Sito vetrina dell'agenzia TakeOff Milan, ricostruito su stack Vite + Cloudflare Pages a partire dal vecchio sito Shopify.

## Stack

- **Vite** (build tool)
- **Vanilla HTML/CSS/JS** (zero framework, massima performance)
- **Lenis** (smooth scroll)
- **Cloudflare Pages** (hosting gratis)
- **Cloudflare Functions** (form contatti, futura API CMS)

## Struttura

```
takeoff-site/
├── index.html              ← homepage
├── src/
│   ├── main.js             ← JS (Lenis, animazioni, form)
│   └── style.css           ← CSS completo brand
├── public/
│   ├── images/             ← logo, favicon, portfolio
│   └── _routes.json        ← routing Cloudflare Functions
├── functions/
│   └── api/contact/        ← endpoint form contatti
├── package.json
├── vite.config.js
├── wrangler.toml
└── .gitignore
```

## Come usare (passo passo)

### 1. Sposta la cartella sul tuo PC di lavoro

Copia `C:\CSM\takeoff-site\` in `C:\Siti\takeoff-site\` (o dove preferisci tenere i progetti).

### 2. Installa le dipendenze

Apri PowerShell nella cartella del progetto e lancia:

```powershell
cd C:\Siti\takeoff-site
npm install
```

Aspetta 30-60 secondi.

### 3. Avvia in locale

```powershell
npm run dev
```

Si aprirà il browser su `http://localhost:5173` con il sito live.
Modifichi i file → il browser si aggiorna da solo.

### 4. Build per produzione (test prima di deploy)

```powershell
npm run build
```

Crea la cartella `dist/` con il sito ottimizzato.

### 5. Inizializza Git e collega a GitHub

```powershell
git init
git add .
git commit -m "Primo sito TakeOff Milan"
git branch -M main
git remote add origin https://github.com/takeoffmilan/takeoff-site.git
git push -u origin main
```

(Prima crea il repo vuoto su GitHub chiamato `takeoff-site`.)

### 6. Deploy su Cloudflare Pages

1. Vai su https://dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git
2. Seleziona il repo `takeoffmilan/takeoff-site`
3. Build settings:
   - Build command: `npm run build`
   - Build output: `dist`
4. Save & Deploy

Dopo qualche minuto avrai un URL `takeoff-site-xxx.pages.dev`.

### 7. Collega il dominio takeoffmilan.com

Vedi la **Fase 9** del piano (gestita da Claude).

## Brand identity (riassunto)

- **Colori signature**: gradient rosa→giallo `#ff66c4 → #ffde59`
- **Font**: Figtree (heading) + Inter (body)
- **Stile**: wide 1400px, gradient animati, sezioni full-width

## Servizi mostrati

1. Website Design & Development
2. Video Editing & Short-Form Content
3. SEO Strategy & Optimization
4. SMM & Google Ads Strategy
5. **CMS TakeOff** (novità, da promuovere come vantaggio competitivo)

## Roadmap

Vedi le task in chat con Claude (Fasi 0-11 + futura CMS plug-in).
