-- =====================================================
-- SETUP COMPLET BERYZ - Toutes les migrations
-- =====================================================
-- Exécuter ce fichier dans l'éditeur SQL de Supabase
-- =====================================================

-- =====================================================
-- ÉTAPE 1: VÉRIFIER LES TABLES EXISTANTES
-- =====================================================
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('seller_profiles', 'categories', 'listings', 'messages', 'favorites', 'admin_logs')
ORDER BY table_name;


-- =====================================================
-- ÉTAPE 2: MIGRATION - Ajouter colonne ROLE
-- =====================================================
-- Ajouter la colonne role si elle n'existe pas
ALTER TABLE public.seller_profiles
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Créer un index pour la performance
CREATE INDEX IF NOT EXISTS idx_seller_profiles_role ON public.seller_profiles(role);

-- Ajouter une contrainte de validation
ALTER TABLE public.seller_profiles
DROP CONSTRAINT IF EXISTS check_role_values;

ALTER TABLE public.seller_profiles
ADD CONSTRAINT check_role_values CHECK (role IN ('user', 'admin'));

-- Vérifier
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'seller_profiles'
  AND column_name = 'role';


-- =====================================================
-- ÉTAPE 3: MIGRATION - Ajouter colonne CONDITION
-- =====================================================
-- Ajouter la colonne condition aux listings
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS condition VARCHAR(20) DEFAULT 'good';

-- Créer un index
CREATE INDEX IF NOT EXISTS idx_listings_condition ON public.listings(condition);

-- Ajouter une contrainte de validation
ALTER TABLE public.listings
DROP CONSTRAINT IF EXISTS check_condition_values;

ALTER TABLE public.listings
ADD CONSTRAINT check_condition_values
CHECK (condition IN ('new', 'excellent', 'good', 'fair'));

-- Vérifier
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'listings'
  AND column_name = 'condition';


-- =====================================================
-- ÉTAPE 4: MIGRATION - Ajouter colonnes BANNED
-- =====================================================
-- Ajouter les colonnes banned
ALTER TABLE public.seller_profiles
ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS banned_reason TEXT,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES auth.users(id);

-- Créer un index pour les requêtes rapides
CREATE INDEX IF NOT EXISTS idx_seller_profiles_banned ON public.seller_profiles(banned);

-- Ajouter des commentaires pour la documentation
COMMENT ON COLUMN public.seller_profiles.banned IS 'Indique si l''utilisateur est banni';
COMMENT ON COLUMN public.seller_profiles.banned_reason IS 'Raison du bannissement';
COMMENT ON COLUMN public.seller_profiles.banned_at IS 'Date du bannissement';
COMMENT ON COLUMN public.seller_profiles.banned_by IS 'Admin qui a banni l''utilisateur';

-- Vérifier
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'seller_profiles'
  AND column_name IN ('banned', 'banned_reason', 'banned_at', 'banned_by')
ORDER BY column_name;


-- =====================================================
-- ÉTAPE 5: CRÉER LE TRIGGER AUTO-PROFILE
-- =====================================================
-- Créer la fonction qui sera appelée par le trigger
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

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger sur auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Vérifier que le trigger a été créé
SELECT
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';


-- =====================================================
-- ÉTAPE 6: RÉPARER LES PROFILS MANQUANTS
-- =====================================================
-- Afficher les utilisateurs sans profil (pour diagnostic)
SELECT
  u.id,
  u.email,
  u.created_at,
  'SANS PROFIL' as status
FROM auth.users u
LEFT JOIN public.seller_profiles sp ON u.id = sp.user_id
WHERE sp.user_id IS NULL
ORDER BY u.created_at DESC;

-- Créer automatiquement les profils pour les users qui n'en ont pas
INSERT INTO public.seller_profiles (
  user_id,
  business_name,
  role,
  verified,
  created_at
)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'business_name', 'Vendeur'),
  'user',
  false,
  NOW()
FROM auth.users u
LEFT JOIN public.seller_profiles sp ON u.id = sp.user_id
WHERE sp.user_id IS NULL;


-- =====================================================
-- ÉTAPE 7: VÉRIFICATION FINALE
-- =====================================================
-- Compter les utilisateurs avec et sans profil
SELECT
  'Utilisateurs avec profil' as description,
  COUNT(*) as nombre
FROM auth.users u
JOIN public.seller_profiles sp ON u.id = sp.user_id
UNION ALL
SELECT
  'Utilisateurs SANS profil',
  COUNT(*)
FROM auth.users u
LEFT JOIN public.seller_profiles sp ON u.id = sp.user_id
WHERE sp.user_id IS NULL;

-- Afficher tous les utilisateurs avec leurs rôles
SELECT
  u.email,
  sp.business_name,
  sp.role,
  sp.verified,
  sp.banned,
  u.created_at
FROM auth.users u
JOIN public.seller_profiles sp ON u.id = sp.user_id
ORDER BY u.created_at DESC
LIMIT 10;

-- Vérifier les colonnes importantes
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'seller_profiles'
  AND column_name IN ('role', 'banned', 'banned_reason', 'verified')
ORDER BY column_name;

SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'listings'
  AND column_name IN ('condition', 'status', 'views_count')
ORDER BY column_name;


-- =====================================================
-- ÉTAPE 8 (OPTIONNELLE): CRÉER UN ADMIN
-- =====================================================
-- Décommentez et modifiez l'email ci-dessous pour créer votre admin

/*
-- MÉTHODE 1: Promouvoir un utilisateur existant
UPDATE public.seller_profiles
SET role = 'admin', verified = true
WHERE user_id = (
  SELECT id FROM auth.users
  WHERE email = 'admin@beryz.com'  -- CHANGEZ CET EMAIL
);

-- Vérifier que ça a fonctionné
SELECT
  u.email,
  sp.business_name,
  sp.role,
  sp.verified
FROM auth.users u
JOIN public.seller_profiles sp ON u.id = sp.user_id
WHERE sp.role = 'admin';
*/


-- =====================================================
-- SETUP TERMINÉ !
-- =====================================================
-- Vous pouvez maintenant:
-- 1. Créer un compte sur /auth/signup
-- 2. Promouvoir ce compte en admin avec la commande de l'ÉTAPE 8
-- 3. Accéder au panneau admin
-- =====================================================
