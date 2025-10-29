# 🌍 Beryz - Plateforme d'Annonces Locales

Plateforme gratuite d'annonces pour la Guinée Conakry, inspirée du design minimaliste d'Etsy.

## 📋 Fonctionnalités actuelles (Prompt 1 - Setup Initial)

- ✅ Architecture Next.js 14 avec App Router
- ✅ Authentification complète (inscription, connexion, déconnexion)
- ✅ Design system Etsy (couleurs, composants)
- ✅ Navigation responsive
- ✅ Profil vendeur
- ✅ Structure base de données Supabase (7 tables)
- ✅ Row Level Security (RLS)
- ✅ Pages de base (home, browse, listings, profile)

## 🚀 Installation rapide

### Prérequis

- Node.js 18+ installé
- Compte Supabase gratuit (https://supabase.com)

### Étape 1: Installer les dépendances

```bash
cd beryz
npm install
```

### Étape 2: Configuration Supabase

1. Créez un projet sur [Supabase](https://supabase.com)
2. Dans votre projet Supabase, allez dans **SQL Editor**
3. Copiez et exécutez le contenu du fichier `supabase-setup.sql`
4. Attendez que toutes les tables soient créées (environ 30 secondes)

### Étape 3: Variables d'environnement

1. Copiez `.env.local.example` vers `.env.local`:
   ```bash
   copy .env.local.example .env.local
   ```

2. Dans Supabase, allez dans **Settings > API**
3. Copiez vos clés dans `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
   SUPABASE_SERVICE_ROLE_KEY=votre_cle_service
   ```

### Étape 4: Lancer le projet

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du projet

```
beryz/
├── app/                      # Pages et routes Next.js
│   ├── auth/                 # Pages d'authentification
│   │   ├── login/            # Page de connexion
│   │   ├── signup/           # Page d'inscription
│   │   └── verify-email/     # Page de vérification email
│   ├── browse/               # Page de navigation des annonces
│   ├── listing/              # Pages de détails des annonces
│   ├── seller/               # Dashboard vendeur
│   │   ├── listings/         # Gestion des annonces
│   │   ├── messages/         # Messagerie
│   │   ├── profile/          # Profil vendeur
│   │   └── favorites/        # Annonces favorites
│   ├── layout.tsx            # Layout principal
│   └── page.tsx              # Page d'accueil
├── components/               # Composants réutilisables
│   └── Navbar.tsx            # Barre de navigation
├── lib/                      # Utilitaires et configurations
│   ├── actions/              # Server Actions
│   │   └── auth.actions.ts   # Actions d'authentification
│   └── supabase/             # Configuration Supabase
│       ├── client.ts         # Client côté navigateur
│       ├── server.ts         # Client côté serveur
│       └── middleware.ts     # Middleware auth
├── types/                    # Types TypeScript
│   ├── database.types.ts     # Types générés depuis Supabase
│   └── index.ts              # Types personnalisés
├── middleware.ts             # Middleware Next.js
├── supabase-setup.sql        # Script de création de la BDD
└── tailwind.config.ts        # Configuration Tailwind (couleurs Etsy)
```

## 🎨 Design System (Couleurs Etsy)

Le projet utilise les couleurs inspirées d'Etsy:

- **Primary**: `#F1641E` (Orange chaleureux)
- **Secondary**: `#F3F3F1` (Beige clair)
- **Dark**: `#222222` (Charbon)
- **Gold**: `#C8B100` (Or/Doré)
- **Success**: `#228863` (Vert)
- **Error**: `#C73A3A` (Rouge)

Utilisez-les dans Tailwind:
```tsx
<div className="bg-etsy-primary text-white">
  <button className="bg-etsy-success hover:bg-etsy-success-dark">
    Bouton
  </button>
</div>
```

## 🗄️ Base de données

### Tables créées:

1. **seller_profiles** - Profils des vendeurs
2. **categories** - Catégories d'annonces (Emploi, Immobilier, Services, Objets)
3. **listings** - Annonces
4. **messages** - Système de messagerie
5. **favorites** - Annonces favorites
6. **reports** - Signalements
7. **admin_logs** - Logs d'administration

### Storage Buckets:

- **listings** - Images des annonces
- **avatars** - Photos de profil

## 🔐 Authentification

L'authentification est gérée par Supabase Auth avec:

- Inscription par email/mot de passe
- Connexion
- Déconnexion
- Vérification email
- Profil vendeur automatiquement créé

### Utiliser l'auth dans vos composants:

**Server Component:**
```tsx
import { createClient } from '@/lib/supabase/server'

export default async function MyComponent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <div>User: {user?.email}</div>
}
```

**Client Component:**
```tsx
'use client'
import { createClient } from '@/lib/supabase/client'

export default function MyComponent() {
  const supabase = createClient()
  // Utilisez supabase pour vos requêtes
}
```

## 📝 Scripts disponibles

```bash
npm run dev      # Lancer en mode développement
npm run build    # Build pour production
npm run start    # Lancer en production
npm run lint     # Vérifier le code
```

## 🔜 Prochaines étapes (Prompts suivants)

### Prompt 2: Système de Listings (Semaines 3-4)
- CRUD complet pour les annonces
- Upload d'images
- Formulaire de création/édition
- Composants ListingCard, ListingGrid

### Prompt 3: Search + Filters (Semaine 7)
- Barre de recherche
- Filtres (catégorie, ville, prix)
- Tri des résultats
- URL params sync

### Prompt 4: Messaging (Semaine 5)
- Chat vendeur/acheteur
- Real-time messages
- Notifications

### Prompt 5: Admin Dashboard (Semaines 9-11)
- Dashboard admin
- Modération
- Gestion utilisateurs

### Prompt 6: Deploy (Semaines 18-20)
- Déploiement Vercel
- Monitoring
- Documentation

## 🐛 Problèmes courants

### Erreur: "Invalid JWT"
- Vérifiez que vos variables d'environnement sont correctes
- Redémarrez le serveur après modification de `.env.local`

### Erreur: "relation does not exist"
- Exécutez le script `supabase-setup.sql` dans l'éditeur SQL de Supabase

### Erreur de connexion Supabase
- Vérifiez votre connexion internet
- Vérifiez que votre projet Supabase est actif

## 📚 Documentation

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contribution

Ce projet est en cours de développement. Les contributions sont bienvenues!

## 📄 Licence

MIT

---

**Créé avec ❤️ pour la Guinée Conakry**
