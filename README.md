# ShoozYou

Monorepo de la plateforme e-commerce **ShoozYou** 👍 – backend Node/Express + Prisma et frontend React/Vite.

## Sommaire
- [Architecture générale](#architecture-générale)
- [Prérequis](#prérequis)
- [Installation & scripts](#installation--scripts)
- [Configuration](#configuration)
- [Backend](#backend)
- [Frontend](#frontend)
- [Déploiement (Railway + Vercel)](#déploiement-railway--vercel)
- [Tests & QA](#tests--qa)

## Architecture générale
```
ShoozYou/
├── backend/            # API Express + Prisma (PostgreSQL)
│   ├── prisma/         # Schéma, migrations, seed
│   └── src/            # Routes, services, middlewares…
├── Frontend/
│   └── shoozyou/      # Application React 19 + Vite
└── README.md           # Ce fichier
```

Le backend expose une API REST sécurisée par JWT (clients, vendeurs, admins). Le frontend consomme cette API, propose un tunnel de paiement fictif (checkout), un espace client, un espace vendeur et un espace admin.

## Prérequis
- Node.js ≥ **18.17** (développement). Pour le build Vite, privilégiez Node **20.19** ou **22.12**.
- npm ≥ 9 (installé avec Node).
- Base PostgreSQL (Supabase est utilisé en dev).
- Compte Vercel + Railway (pour le déploiement recommandé).

## Installation & scripts
### Backend
```bash
cd backend
npm install
npm run dev          # API en mode dev (ts-node-dev)
npm run build        # Compile TypeScript → dist/
npm start            # Démarre la version compilée
npm run test         # Jest (voir notes sandbox)
npm run prisma:generate
npm run prisma:migrate
```

### Frontend
```bash
cd Frontend/shoozyou
npm install
npm run dev     # Vite en mode dev
npm run build   # Build production
npm run preview # Prévisualisation du build
```

## Configuration
### Backend – `.env`
Copier `.env.example` et renseigner :
```
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://...
DIRECT_DATABASE_URL=postgresql://...
JWT_SECRET=xxxxxxxxxxxxxxxx
SCRAPE_SOURCE_URL=... (optionnel)
```
Autres variables utilisées : `LOG_LEVEL`, etc.

### Frontend – `.env`
Créer `Frontend/shoozyou/.env` :
```
VITE_API_URL=http://localhost:4000/api
```
Adapter avec l’URL Railway en production.

## Backend
- **Prisma** : schéma `prisma/schema.prisma`, migrations via `npx prisma migrate dev --name <migration>`.
- **Fonctionnalités** :
  - Authentification JWT (clients/vendeurs/admins).
  - Gestion produits, références (marques, types, genres), variantes/sizes.
  - Panier, commandes, paiement fictif (simulation dans `payment.service`), actualisation stock + nettoyage panier.
  - Adresses et résumé paiement stockés dans la table `Order`.
  - Scraper Courir (`npm run scrape:products`).
  - Métriques commandes (`GET /api/orders/metrics`) pour l’admin/vendeur.
- **Tests** : `npm run test` (peut échouer dans un environnement sandbox faute de port). Exécuter localement pour une validation complète.
- **Inspection DB** : `npx prisma studio`.

## Frontend
- **Tech stack** : React 19, Vite, TypeScript, Context API (auth/cart), React Router.
- **Pages clés** :
  - Catalogue + filtres avancés (recherche, marque, type, prix).
  - Espace client (profil, commandes).
  - Espace vendeur (inventaire + métriques commandes/revenus).
  - Espace admin (produits, vendeurs, stats commandes/revenus).
  - Tunnel checkout fictif (adresse + paiement) → création d’une commande et vidage du panier.
- **Environnement** : `VITE_API_URL` doit pointer vers l’API déployée.

## Déploiement (Railway & Vercel)
### Backend → Railway
1. Créer un service **Node.js** et pointer sur `backend/` (monorepo → "Root Directory" = `backend`).
2. Commandes :
   - Install: `npm install`
   - Build: `npm run build`
   - Start: `npm run start`
3. Variables d’environnement à définir : `PORT`, `NODE_ENV`, `DATABASE_URL`, `DIRECT_DATABASE_URL`, `JWT_SECRET`, etc.
4. Associer la base PostgreSQL (Railway ou Supabase) ; exécuter `npx prisma migrate deploy` si nécessaire.
5. Exposer le port (Railway détecte `PORT`).

### Frontend → Vercel
1. Importer le repo GitHub, définir "Root Directory" = `Frontend/shoozyou`.
2. Build command : `npm run build`. Output dir : `dist`.
3. Changer le runtime Node dans les settings si besoin (Node 20). 
4. Ajouter la variable `VITE_API_URL=https://<votre-service>.up.railway.app/api` (ou le domaine custom).
5. Chaque push sur `main` déploie automatiquement ; previews sur les branches.

## Tests & QA
- **Frontend** : `npm run build` + (optionnel) tests manuels sur `/checkout`, `/account`, `/seller`, `/admin`.
- **Backend** : `npm run test` (local). Vérifier `GET /api/orders/metrics` pour alimenter les dashboards.
- **Lint** : `npm run lint` (backend) et `npm run lint` (frontend).

---
Besoin d’un guide plus poussé ? Ouvre une issue ou ping moi 🛠️.
