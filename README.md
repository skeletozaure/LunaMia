# LunaMia 🌙

Une application web progressive (PWA) pour suivre votre cycle menstruel, vos symptômes, votre humeur et vos données de santé reproductive.

## 🌟 Fonctionnalités

- 📅 **Suivi du cycle menstruel** - Enregistrez les dates de vos règles et suivez automatiquement vos phases
- 🎭 **Enregistrement quotidien** - Documentez votre humeur, symptômes et flux menstruel chaque jour
- 📊 **Statistiques et graphiques** - Visualisez vos données de cycle et identifiez des patterns
- 💾 **Base de données locale** - Toutes vos données sont stockées localement en toute sécurité avec IndexedDB
- 📱 **Mode hors ligne** - Fonctionne complètement hors ligne en tant qu'application progressive (PWA)
- 🎨 **Interface intuitive** - Design moderne et responsive pour une meilleure expérience utilisateur
- 🌓 **Mode sombre** - Support du thème avec préférences persistantes

## 🛠️ Stack Technique

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite (ultra-rapide)
- **Styling**: Tailwind CSS
- **Base de données**: Dexie (wrapper IndexedDB)
- **Icons**: Lucide React
- **Dates**: date-fns
- **PWA**: vite-plugin-pwa

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 16+ et npm

### Installation

```bash
# Cloner le repository
git clone https://github.com/skeletozaure/LunaMia.git
cd LunaMia

# Installer les dépendances
npm install
```

### Développement

```bash
# Lancer le serveur de développement (http://localhost:5173)
npm run dev

# Linter le code
npm run lint
```

### Production

```bash
# Build pour la production
npm run build

# Prévisualiser le build
npm run preview
```

## 📂 Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── BottomNav.tsx   # Navigation inférieure
│   ├── CycleRing.tsx   # Visualisation du cycle
│   ├── ConfirmModal.tsx # Modal de confirmation
│   ├── FlowSelector.tsx # Sélecteur de flux menstruel
│   ├── Insights.tsx    # Affichage des insights
│   ├── MoodSelector.tsx # Sélecteur d'humeur
│   └── SymptomChips.tsx # Chips des symptômes
├── screens/             # Écrans/Pages principales
│   ├── Dashboard.tsx    # Vue d'ensemble du cycle
│   ├── Calendar.tsx     # Calendrier interactif
│   ├── DayEntry.tsx    # Modal d'enregistrement quotidien
│   ├── Stats.tsx       # Statistiques et graphiques
│   └── Settings.tsx    # Paramètres et préférences
├── hooks/               # Custom React hooks
│   ├── useCycleStats.ts   # Stats du cycle menstruel
│   ├── useDayLog.ts       # Logs quotidiens
│   ├── useCustomSymptoms.ts # Symptômes personnalisés
│   ├── useSettings.ts     # Paramètres utilisateur
│   └── useTheme.ts        # Gestion du thème
├── db/                  # Configuration base de données
│   └── database.ts      # Dexie DB setup
├── types/               # Définitions TypeScript
├── utils/               # Fonctions utilitaires
│   ├── constants.ts        # Constantes (humeurs, flux, etc)
│   ├── cycleCalculations.ts # Calculs du cycle menstruel
│   └── dataExport.ts      # Export de données
└── assets/              # Ressources statiques
```

## 📱 Écrans Principaux

### 🏠 Dashboard
Vue d'ensemble rapide avec:
- Visualisation du cycle actuel
- Phase menstruelle actuelle
- Données d'aujourd'hui (humeur, symptômes, flux)
- Accès rapide à l'enregistrement du jour

### 📅 Calendrier
- Calendrier mensuel interactif
- Code couleur par phase du cycle
- Sélection de date pour enregistrer/consulter données
- Navigation entre les mois

### 📊 Statistiques
- Graphiques de tendances
- Durée moyenne du cycle
- Analyses des symptômes les plus fréquents
- Patterns d'humeur par phase

### ⚙️ Paramètres
- Durée personnalisée du cycle (par défaut 28 jours)
- Gestion des symptômes personnalisés
- Export des données (JSON)
- Préférences d'affichage

### ✏️ Enregistrement Quotidien
Enregistrez facilement:
- 🩸 Flux menstruel (absent, léger, modéré, abondant)
- 😊 Humeur (10 options)
- 🤢 Symptômes (nausées, crampes, fatigue, acné, etc)
- 📝 Notes personnelles

## 💡 Caractéristiques Techniques

### Calculs du Cycle
- Suivi automatique des phases (menstruation, folliculaire, ovulation, lutéal)
- Prédiction de l'ovulation basée sur l'historique
- Durée de cycle configurable (min 21j, max 35j)

### Stockage Sécurisé
- IndexedDB pour le stockage persistant local
- Aucune donnée envoyée à un serveur
- Confidentialité totale de vos données

### Fonctionnement Offline
- L'application fonctionne complètement sans internet
- Installation possible comme app native sur mobile/desktop
- Synchronisation automatique des données

## 📱 PWA (Progressive Web App)

LunaMia est une PWA complète:
- Installable sur téléphone (iOS/Android) et desktop
- Icônes et splash screens personnalisés
- Fonctionne hors ligne
- Chargement instantané en cache

## 🤝 Contribution

Les contributions sont bienvenues! N'hésitez pas à:
- Signaler des bugs via les [Issues](https://github.com/skeletozaure/LunaMia/issues)
- Suggérer des features
- Proposer des améliorations via Pull Requests

## 📄 License

MIT - Voir le fichier LICENSE pour plus de détails

## 🙏 Support

Pour toute question, suggestion ou signalement de bug, créez une issue sur GitHub.

---

**LunaMia** - Suivez votre cycle, comprenez votre corps 🌙
