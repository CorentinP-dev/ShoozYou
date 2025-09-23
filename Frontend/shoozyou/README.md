# ShoozYou – Frontend

Application React 19 + Vite pour la plateforme e-commerce ShoozYou.

## Scripts
```bash
npm install      # dépendances
npm run dev      # serveur Vite (http://localhost:5173)
npm run build    # build production dans dist/
npm run preview  # prévisualisation du build
```

## Variables d’environnement
Créer un fichier `.env` à la racine du dossier :
```
VITE_API_URL=http://localhost:4000/api
```
Adapter l’URL avec celle du backend (Railway en prod).

## Fonctionnalités
- Authentification client/vendeur/admin (JWT). 
- Catalogue produits avec recherche, filtres (marque, type, prix).
- Panier local + tunnel de paiement fictif (adresse, carte, résumé).
- Espace client : profil, commandes.
- Espace vendeur : inventaire + métriques commandes/CA en temps réel.
- Espace admin : gestion produits, rôles, statistiques.

## Déploiement Vercel
1. Root directory : `Frontend/shoozyou`.
2. Build command : `npm run build`. Output : `dist`.
3. Ajouter `VITE_API_URL=https://<votre-api>.up.railway.app/api`.
4. Node version recommandée : 20.x.

## QA
- Vérifier `/checkout` (création commande + vidage panier).
- Vérifier `/account`, `/seller`, `/admin` selon les rôles.
- `npm run build` doit passer sans avertissement (hors message Node 21).
