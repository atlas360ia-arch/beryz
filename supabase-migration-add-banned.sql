-- =====================================================
-- MIGRATION: Ajouter banned status aux utilisateurs
-- =====================================================
-- Exécuter dans l'éditeur SQL de Supabase
-- =====================================================

-- Étape 1: Ajouter les colonnes banned
ALTER TABLE public.seller_profiles
ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS banned_reason TEXT,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES auth.users(id);

-- Étape 2: Créer un index pour les requêtes rapides
CREATE INDEX IF NOT EXISTS idx_seller_profiles_banned ON public.seller_profiles(banned);

-- Étape 3: Ajouter un commentaire pour la documentation
COMMENT ON COLUMN public.seller_profiles.banned IS 'Indique si l''utilisateur est banni';
COMMENT ON COLUMN public.seller_profiles.banned_reason IS 'Raison du bannissement';
COMMENT ON COLUMN public.seller_profiles.banned_at IS 'Date du bannissement';
COMMENT ON COLUMN public.seller_profiles.banned_by IS 'Admin qui a banni l''utilisateur';

-- Étape 4: Vérifier que les colonnes ont été ajoutées
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'seller_profiles'
  AND column_name IN ('banned', 'banned_reason', 'banned_at', 'banned_by')
ORDER BY column_name;

-- Étape 5: Voir un exemple de profil avec les nouvelles colonnes
SELECT
  user_id,
  business_name,
  role,
  verified,
  banned,
  banned_reason,
  banned_at
FROM public.seller_profiles
LIMIT 3;
