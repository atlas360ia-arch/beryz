-- =====================================================
-- MIGRATION: Ajouter le champ 'condition' à la table listings
-- Exécuter dans l'éditeur SQL de Supabase
-- =====================================================

-- Ajouter la colonne 'condition' avec les valeurs possibles
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS condition VARCHAR(20) DEFAULT 'good';

-- Créer un index pour améliorer les performances de filtrage
CREATE INDEX IF NOT EXISTS idx_listings_condition ON public.listings(condition);

-- Ajouter un commentaire pour documenter les valeurs possibles
COMMENT ON COLUMN public.listings.condition IS 'État de l''article: new, excellent, good, fair';
