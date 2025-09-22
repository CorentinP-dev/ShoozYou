# ShoozYou

Monorepo de la plateforme e-commerce **ShoozYou**. Cette documentation résume la mise en place du backend Node.js / Prisma.

## Backend

### Prérequis
- Node.js ≥ 18.17
- PostgreSQL (ou l’instance Supabase fournie)
- `npm` (fourni avec Node)

### Installation
```bash
cd backend
npm install
```

Copie `.env.example` vers `.env` puis renseigne :
- `DATABASE_URL` et `DIRECT_DATABASE_URL`
- `JWT_SECRET`
- `SCRAPE_SOURCE_URL` (optionnel, URL de la liste Courir à scraper)

### Scripts principaux
```bash
npm run dev             # API en dev via ts-node-dev
npm run build           # Compilation TypeScript
npm start               # Démarrage en production (dist/)
npm run test            # Tests Jest
npm run lint            # Analyse ESLint (installer les devDependencies si nécessaire)
npm run lint:fix        # ESLint avec correction automatique
npm run scrape:products # Scraper Courir + persistance Prisma
```

### Migrations Prisma
```bash
npx prisma migrate dev --name <migration>
npx prisma generate
# Pour repartir de zéro (perd toutes les données)
npx prisma migrate reset
```

Le schéma courant sépare les tables de référence : `Brand`, `Gender`, `ProductType`, liées aux produits via `brandId`, `genderId`, `shoeTypeId`.

### Scraper Courir
Le fichier `src/scraping/scrapeProducts.ts` :
- parcourt toutes les pages du listing `SCRAPE_SOURCE_URL`
- récupère SKU, marque, genre, type de chaussure, prix, promotions, rating, image
- déduplique par SKU
- crée ou met à jour les tables Prisma (`Brand`, `Gender`, `ProductType`, `Product`)
- affiche un résumé (créés/mis à jour/pages parcourues)

Exécution :
```bash
npm run scrape:products
```
> Prévoir un accès réseau autorisé ; en cas d’échec `ENOTFOUND`, vérifier VPN/proxy.

### Endpoints de référence
- `GET /api/references/genders` : liste ordonnée des genres disponibles
- `GET /api/references/shoe-types` : types de chaussures normalisés

### Inspection des données
```bash
npx prisma studio
```
Permet d’explorer `Product`, `Brand`, `Gender`, `ProductType`, etc.

### Tests
```bash
npm run test
```
Les commandes `npm run lint` / `npm run lint:fix` reposent sur ESLint (`npm install` à exécuter si les modules ne sont pas présents).

---

Pour le frontend ou d’autres services, compléter ce README ou créer une documentation dédiée.
