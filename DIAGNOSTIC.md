# 🔍 Diagnostic et Résolution de Bugs - Beryz

## ✅ Statut du Build
- **Build Production:** ✅ Succès (pas d'erreurs TypeScript)
- **Toutes les pages:** ✅ 19 pages générées
- **Middleware:** ✅ Compilé correctement

---

## 🗄️ Migrations SQL Requises (Dans l'ordre)

### 1. Migration Trigger Auto-Profile ⚠️ **IMPORTANT - À FAIRE EN PREMIER**
**Fichier:** `supabase-create-auto-profile-trigger.sql`

**Pourquoi:** Crée automatiquement un profil seller pour chaque nouvel utilisateur lors de l'inscription.

**Exécuter dans Supabase SQL Editor:**
```sql
-- Créer la fonction
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.seller_profiles (
    user_id,
    business_name,
    role,
    verified,
    created_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'Vendeur'),
    'user',
    false,
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Créer le trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 2. Migration Condition ⚠️ **REQUIS**
**Fichier:** `supabase-migration-add-condition.sql`

**Exécuter:**
```sql
-- Ajouter la colonne condition
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS condition VARCHAR(20) DEFAULT 'good';

-- Ajouter une contrainte
ALTER TABLE public.listings
ADD CONSTRAINT check_condition_values
CHECK (condition IN ('new', 'excellent', 'good', 'fair'));

-- Créer un index
CREATE INDEX IF NOT EXISTS idx_listings_condition ON public.listings(condition);
```

### 3. Migration Role Admin ⚠️ **REQUIS**
**Fichier:** `supabase-migration-add-roles.sql`

**Exécuter:**
```sql
-- Ajouter la colonne role si elle n'existe pas
ALTER TABLE public.seller_profiles
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Créer un index
CREATE INDEX IF NOT EXISTS idx_seller_profiles_role ON public.seller_profiles(role);

-- Ajouter une contrainte
ALTER TABLE public.seller_profiles
ADD CONSTRAINT check_role_values CHECK (role IN ('user', 'admin'));
```

### 4. Migration Banned Status ⚠️ **REQUIS**
**Fichier:** `supabase-migration-add-banned.sql`

**Exécuter:**
```sql
-- Ajouter les colonnes banned
ALTER TABLE public.seller_profiles
ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS banned_reason TEXT,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES auth.users(id);

-- Créer un index
CREATE INDEX IF NOT EXISTS idx_seller_profiles_banned ON public.seller_profiles(banned);
```

---

## 🐛 Bugs Potentiels Identifiés et Solutions

### Bug #1: Utilisateurs sans profil seller_profiles
**Symptôme:** Les utilisateurs existent dans `auth.users` mais n'apparaissent pas dans les tables admin.

**Solution:**
```sql
-- 1. Vérifier les utilisateurs sans profil
SELECT u.id, u.email, u.created_at, 'SANS PROFIL' as status
FROM auth.users u
LEFT JOIN public.seller_profiles sp ON u.id = sp.user_id
WHERE sp.user_id IS NULL;

-- 2. Créer les profils manquants
INSERT INTO public.seller_profiles (user_id, business_name, role, verified, created_at)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'business_name', 'Vendeur'), 'user', false, NOW()
FROM auth.users u
LEFT JOIN public.seller_profiles sp ON u.id = sp.user_id
WHERE sp.user_id IS NULL;
```

### Bug #2: Pas d'admin configuré
**Symptôme:** Impossible d'accéder au panneau admin.

**Solution Rapide:**
```sql
-- Promouvoir un utilisateur existant en admin
UPDATE public.seller_profiles
SET role = 'admin', verified = true
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'VOTRE_EMAIL@example.com'
);

-- Vérifier
SELECT u.email, sp.role FROM auth.users u
JOIN public.seller_profiles sp ON u.id = sp.user_id
WHERE sp.role = 'admin';
```

### Bug #3: Export CSV Auth Error
**Symptôme:** L'export des utilisateurs pourrait échouer car `auth.admin.listUsers()` nécessite des permissions admin.

**Solution:** Le code utilise déjà `requireAdmin()` mais il faut s'assurer que l'admin a les bonnes permissions Supabase.

**Code à vérifier dans:** `lib/actions/export.actions.ts`

---

## ⚠️ Warnings à Surveiller

### 1. Realtime Subscriptions
**Fichier:** `lib/hooks/useRealtimeMessages.ts`

**Potentiel problème:** Les subscriptions Realtime ne se nettoient pas toujours correctement.

**Vérifier:** Le `useEffect` cleanup est bien présent:
```typescript
return () => {
  supabase.removeChannel(channel)
}
```

### 2. Image Uploads
**Fichier:** `components/ImageUpload.tsx`

**Potentiel problème:** Pas de limite de taille de fichier côté client.

**Amélioration suggérée:**
```typescript
// Ajouter dans handleFileSelect
if (file.size > 5 * 1024 * 1024) { // 5MB limit
  alert('Fichier trop volumineux (max 5MB)')
  return
}
```

### 3. Middleware Performance
**Fichier:** `middleware.ts`

**Potentiel problème:** Le middleware fait une requête DB à chaque requête pour vérifier le statut banned.

**Solution:** Déjà optimisé avec un seul `select('banned')`.

---

## 🧪 Tests à Effectuer

### Test #1: Inscription Nouveau Utilisateur
1. Aller sur `/auth/signup`
2. S'inscrire avec un nouvel email
3. **Vérifier:** Le profil seller est créé automatiquement
4. **Vérifier:** Redirection vers `/auth/verify-email`

### Test #2: Création d'Annonce
1. Se connecter
2. Aller sur `/seller/listings/create`
3. Remplir le formulaire
4. **Vérifier:** L'upload d'images fonctionne
5. **Vérifier:** La condition est bien enregistrée
6. **Vérifier:** L'annonce apparaît dans `/seller/listings`

### Test #3: Panneau Admin
1. Se connecter en tant qu'admin
2. **Vérifier:** Le lien "Admin" apparaît dans la navbar
3. Aller sur `/admin/dashboard`
4. **Vérifier:** Les statistiques s'affichent
5. Tester `/admin/users`, `/admin/moderation`, `/admin/reports`, `/admin/exports`

### Test #4: Ban d'Utilisateur
1. En tant qu'admin, aller sur `/admin/users`
2. Bannir un utilisateur
3. Se déconnecter et se reconnecter avec cet utilisateur
4. **Vérifier:** Redirection automatique vers `/banned`

### Test #5: Export CSV
1. Aller sur `/admin/exports`
2. Télécharger "Utilisateurs"
3. **Vérifier:** Le fichier CSV se télécharge
4. **Vérifier:** Le fichier contient les bonnes données

---

## 🔧 Améliorations Recommandées (Non-bloquantes)

### 1. Rate Limiting
Ajouter un rate limiting sur les endpoints sensibles (signup, login, message sending).

### 2. Image Optimization
Utiliser Next.js Image Optimization pour réduire la taille des images uploadées.

### 3. Error Boundaries
Ajouter des Error Boundaries React pour capturer les erreurs frontend.

### 4. Logging
Ajouter un système de logging plus robuste (Sentry, LogRocket, etc.).

### 5. Email Verification
Implémenter la vérification d'email réelle (actuellement la page existe mais pas de vérification).

---

## 📝 Checklist de Déploiement

- [ ] Exécuter toutes les migrations SQL
- [ ] Créer au moins un admin
- [ ] Tester le trigger auto-profile avec un nouvel utilisateur
- [ ] Vérifier que les images s'uploadent correctement
- [ ] Tester le système de ban
- [ ] Vérifier les exports CSV
- [ ] Tester la recherche et les filtres
- [ ] Tester le système de messaging
- [ ] Vérifier les favoris
- [ ] Tester la modération d'annonces

---

## 🚀 Commandes Utiles

```bash
# Build de production
npm run build

# Lancer en mode dev
npm run dev

# Vérifier les types TypeScript
npx tsc --noEmit

# Linter
npm run lint
```

---

## 📞 Support

Si vous rencontrez des problèmes:
1. Vérifiez que toutes les migrations SQL ont été exécutées
2. Vérifiez les variables d'environnement dans `.env.local`
3. Vérifiez les logs de la console navigateur
4. Vérifiez les logs Supabase dans le dashboard
