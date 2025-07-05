# 💍 Svatba Marcela & Zbyněk 2025

Moderní svatební webová aplikace s photo gallery, AI enhancement a admin panelem.

## ✨ Funkce

- 📸 **Photo Gallery** - Upload a správa svatebních fotek
- 🤖 **AI Enhancement** - Automatické vylepšení fotek pomocí AI
- ❤️ **Like System** - Hosté můžou lajkovat fotky
- 👑 **Admin Panel** - Kompletní správa obsahu
- 📱 **Responsive Design** - Funguje na všech zařízeních
- 🎵 **Playlist** - Správa svatebního playlistu
- ⏰ **Countdown Timer** - Odpočet do svatby
- 🗓️ **Program** - Časový harmonogram dne

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS
- **Backend**: Express.js, PostgreSQL
- **Database**: Drizzle ORM
- **Storage**: Cloudinary
- **AI**: OpenAI/Groq integration
- **Deployment**: Replit Autoscale

## 🛠️ Instalace

1. **Klonování repozitáře**
   ```bash
   git clone https://github.com/tekvecko/svatbamarcelazbynek.git
   cd svatbamarcelazbynek
   ```

2. **Instalace dependencies**
   ```bash
   npm install
   ```

3. **Nastavení environment variables**
   ```bash
   cp .env.example .env
   # Vyplňte Cloudinary credentials
   ```

4. **Spuštění databáze**
   ```bash
   npm run db:push
   ```

5. **Development server**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📦 Deployment

### Replit (Doporučeno)

1. Import z GitHub do Replit
2. Nastavit environment variables
3. Deploy na Autoscale

### Build příkazy

```bash
# Development
npm run dev

# Production build
npm run build

# Static build (bez backend)
npm run build:static
```

## 📁 Struktura projektu

```
├── client/                 # React frontend
│   ├── src/components/     # React komponenty
│   ├── src/pages/         # Stránky aplikace
│   └── src/lib/           # Utility funkce
├── server/                # Express.js backend
├── shared/                # Sdílené TypeScript schéma
├── scripts/               # Build & deployment scripty
└── tests/                 # Testy
```

## 🎨 Komponenty

- **PhotoGallery** - Hlavní galerie s grid layoutem
- **PhotoUpload** - Drag & drop upload interface
- **AdminPanel** - Password-protected admin rozhraní
- **AIPhotoEnhancer** - AI analýza a enhancement
- **HighlightReel** - Cinematic slideshow nejlepších fotek
- **CountdownTimer** - Odpočet do svatby

## 🔒 Admin Panel

Přístup: `/admin` s heslem (nastaveno v admin panelu)

Funkce:
- Správa wedding details
- Moderace uploadovaných fotek
- Export photo metadat
- Toggle upload/moderation režimů

## 📱 Responsive Design

- **Mobile**: 2-column grid, touch-optimized
- **Tablet**: 3-column grid, medium spacing
- **Desktop**: 4-column grid, plný feature set

## 🤝 Přispívání

1. Fork repozitář
2. Vytvořte feature branch (`git checkout -b feature/nova-funkce`)
3. Commit změny (`git commit -am 'Přidat novou funkci'`)
4. Push do branch (`git push origin feature/nova-funkce`)
5. Vytvořte Pull Request

## 📄 Licence

MIT License - viz [LICENSE](LICENSE) soubor.

## 💝 Svatba

**Datum**: 11. října 2025  
**Místo**: Kovalovice  
**Pár**: Marcela & Zbyněk

---

*Vytvořeno s ❤️ pro nejkrásnější den roku 2025* 🎉
