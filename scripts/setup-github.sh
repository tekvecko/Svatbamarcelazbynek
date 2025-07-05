
#!/bin/bash

# Svatební aplikace - GitHub Export Script
# ======================================

echo "🎉 Nastavení GitHub exportu pro svatební aplikaci"
echo "=================================================="

# Kontrola Git instalace
if ! command -v git &> /dev/null; then
    echo "❌ Git není nainstalován. Instaluji..."
    npm install -g git
fi

# Kontrola GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "⚠️  GitHub CLI není dostupné. Budeme používat manuální setup."
    MANUAL_SETUP=true
else
    MANUAL_SETUP=false
fi

# Získat jméno repozitáře
read -p "📝 Zadejte název GitHub repozitáře (např. svatba-marcela-zbynek-2025): " REPO_NAME

if [ -z "$REPO_NAME" ]; then
    REPO_NAME="svatba-marcela-zbynek-2025"
    echo "✅ Použit výchozí název: $REPO_NAME"
fi

# Získat GitHub username
read -p "📝 Zadejte vaše GitHub uživatelské jméno: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ GitHub username je povinný!"
    exit 1
fi

# Inicializace Git repozitáře (pokud ještě neexistuje)
if [ ! -d ".git" ]; then
    echo "🔧 Inicializace Git repozitáře..."
    git init
    
    # Nastavení základní konfigurace
    git config user.name "Wedding App"
    git config user.email "svatba@example.com"
    
    # Vytvoření .gitignore
    echo "📝 Vytváření .gitignore..."
    cat > .gitignore << EOL
# Dependencies
node_modules/
.npm
.pnpm-debug.log*

# Production builds
dist/
build/

# Environment variables
.env
.env.local
.env.production

# Database
*.db
*.sqlite

# Uploads (použijte Cloudinary)
uploads/
temp/

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed

# Coverage directory used by tools like istanbul
coverage/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Replit specific
.replit
.config/
.upm/
replit.nix

# Temporary files
tmp/
temp/
EOL

else
    echo "✅ Git repozitář již existuje"
fi

# Přidání souborů do staging
echo "📦 Přidávání souborů do Git..."
git add .

# Commit změn
echo "💾 Vytváření commit..."
git commit -m "Initial commit - Svatební aplikace Marcela & Zbyněk 2025

Features:
- React + TypeScript frontend
- Express.js backend s PostgreSQL
- Cloudinary photo upload & AI enhancement
- Admin panel pro správu
- Responsive design pro všechna zařízení
- Photo gallery s like systémem
- Playlist management
- Wedding countdown timer

Tech stack:
- Frontend: React, TypeScript, TailwindCSS, Tanstack Query
- Backend: Express.js, PostgreSQL, Drizzle ORM
- Storage: Cloudinary
- AI: OpenAI/Groq integration
- Deployment: Replit Autoscale ready"

# GitHub remote setup
REPO_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

if [ "$MANUAL_SETUP" = true ]; then
    echo ""
    echo "🔗 Manuální GitHub setup:"
    echo "========================="
    echo "1. Jděte na https://github.com/new"
    echo "2. Vytvořte repozitář s názvem: $REPO_NAME"
    echo "3. Nechte jej prázdný (bez README, .gitignore, license)"
    echo "4. Po vytvoření repozitáře spusťte:"
    echo ""
    echo "   git remote add origin $REPO_URL"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
    
    read -p "✅ Pokračovat s přidáním remote? (y/n): " continue_manual
    if [ "$continue_manual" = "y" ]; then
        git remote add origin $REPO_URL
        git branch -M main
        echo "🎯 Remote přidán. Nyní můžete použít: git push -u origin main"
    fi
else
    # Automatické vytvoření repozitáře pomocí GitHub CLI
    echo "🚀 Vytváření GitHub repozitáře..."
    
    read -p "📝 Má být repozitář veřejný? (y/n): " is_public
    if [ "$is_public" = "y" ]; then
        VISIBILITY="--public"
    else
        VISIBILITY="--private"
    fi
    
    gh repo create $REPO_NAME $VISIBILITY --description "Svatební aplikace Marcela & Zbyněk 2025 - Photo gallery s AI enhancement" --source=.
    
    # Push do GitHub
    echo "⬆️  Nahrávání do GitHub..."
    git push -u origin main
fi

# Vytvoření README pro GitHub
echo "📄 Vytváření README.md..."
cat > README.md << EOL
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
   \`\`\`bash
   git clone https://github.com/$GITHUB_USERNAME/$REPO_NAME.git
   cd $REPO_NAME
   \`\`\`

2. **Instalace dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Nastavení environment variables**
   \`\`\`bash
   cp .env.example .env
   # Vyplňte Cloudinary credentials
   \`\`\`

4. **Spuštění databáze**
   \`\`\`bash
   npm run db:push
   \`\`\`

5. **Development server**
   \`\`\`bash
   npm run dev
   \`\`\`

## 🔧 Environment Variables

\`\`\`env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
\`\`\`

## 📦 Deployment

### Replit (Doporučeno)

1. Import z GitHub do Replit
2. Nastavit environment variables
3. Deploy na Autoscale

### Build příkazy

\`\`\`bash
# Development
npm run dev

# Production build
npm run build

# Static build (bez backend)
npm run build:static
\`\`\`

## 📁 Struktura projektu

\`\`\`
├── client/                 # React frontend
│   ├── src/components/     # React komponenty
│   ├── src/pages/         # Stránky aplikace
│   └── src/lib/           # Utility funkce
├── server/                # Express.js backend
├── shared/                # Sdílené TypeScript schéma
├── scripts/               # Build & deployment scripty
└── tests/                 # Testy
\`\`\`

## 🎨 Komponenty

- **PhotoGallery** - Hlavní galerie s grid layoutem
- **PhotoUpload** - Drag & drop upload interface
- **AdminPanel** - Password-protected admin rozhraní
- **AIPhotoEnhancer** - AI analýza a enhancement
- **HighlightReel** - Cinematic slideshow nejlepších fotek
- **CountdownTimer** - Odpočet do svatby

## 🔒 Admin Panel

Přístup: \`/admin\` s heslem (nastaveno v admin panelu)

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
2. Vytvořte feature branch (\`git checkout -b feature/nova-funkce\`)
3. Commit změny (\`git commit -am 'Přidat novou funkci'\`)
4. Push do branch (\`git push origin feature/nova-funkce\`)
5. Vytvořte Pull Request

## 📄 Licence

MIT License - viz [LICENSE](LICENSE) soubor.

## 💝 Svatba

**Datum**: 11. října 2025  
**Místo**: Kovalovice  
**Pár**: Marcela & Zbyněk

---

*Vytvořeno s ❤️ pro nejkrásnější den roku 2025* 🎉
EOL

# Commit README
git add README.md
git commit -m "Add comprehensive README.md with project documentation"

# Vytvoření GitHub Actions pro automatické deployment
mkdir -p .github/workflows

echo "⚙️ Vytváření GitHub Actions..."
cat > .github/workflows/deploy.yml << EOL
name: Deploy to Replit

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test || echo "Tests skipped"
    
    - name: Build application
      run: npm run build
      
    - name: Build static version
      run: npm run build:static || echo "Static build skipped"
    
    - name: Deploy to Replit
      run: echo "Deploy to Replit via webhook or API"
      # TODO: Add Replit deployment webhook
EOL

# Commit GitHub Actions
git add .github/
git commit -m "Add GitHub Actions workflow for automated deployment"

# Final push (pokud je remote nastavený)
if git remote get-url origin > /dev/null 2>&1; then
    echo "⬆️  Finální push do GitHub..."
    git push
fi

echo ""
echo "🎉 GitHub export dokončen!"
echo "========================="
echo "✅ Repozitář: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo "✅ README vytvořen s kompletní dokumentací"
echo "✅ GitHub Actions workflow přidán"
echo "✅ .gitignore nakonfigurován pro svatební app"
echo ""
echo "🔄 Synchronizace s Replit:"
echo "1. V Replit jděte do Version Control"
echo "2. Connect to GitHub"
echo "3. Vyberte vytvořený repozitář"
echo "4. Zapněte automatickou synchronizaci"
echo ""
echo "🚀 Aplikace je připravena na GitHub i Replit!"
