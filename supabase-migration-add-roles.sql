-- =====================================================
-- MIGRATION: Ajouter le système de rôles (user/admin)
-- Exécuter dans l'éditeur SQL de Supabase
-- =====================================================

-- Ajouter la colonne 'role' à la table seller_profiles
ALTER TABLE public.seller_profiles
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Créer un index pour améliorer les performances des requêtes par rôle
CREATE INDEX IF NOT EXISTS idx_seller_profiles_role ON public.seller_profiles(role);

-- Ajouter un commentaire pour documenter les valeurs possibles
COMMENT ON COLUMN public.seller_profiles.role IS 'Rôle de l''utilisateur: user, admin';

-- Créer un CHECK constraint pour valider les valeurs de role
ALTER TABLE public.seller_profiles
ADD CONSTRAINT check_role_values CHECK (role IN ('user', 'admin'));
