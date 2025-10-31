-- Migration: Ajouter la table des avis (reviews)
-- Semaine 14: Avis & Notes

-- Créer la table reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,

  -- Contenu de l'avis
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(100),
  comment TEXT NOT NULL,

  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Éviter les doublons: un utilisateur ne peut laisser qu'un seul avis par vendeur
  CONSTRAINT unique_reviewer_seller UNIQUE (reviewer_id, seller_id),

  -- Un utilisateur ne peut pas s'évaluer lui-même
  CONSTRAINT no_self_review CHECK (seller_id != reviewer_id)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON public.reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON public.reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- RLS Policies
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les avis
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews
  FOR SELECT
  USING (true);

-- Les utilisateurs authentifiés peuvent créer des avis
CREATE POLICY "Users can create reviews"
  ON public.reviews
  FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- Les utilisateurs peuvent modifier leurs propres avis
CREATE POLICY "Users can update their own reviews"
  ON public.reviews
  FOR UPDATE
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

-- Les utilisateurs peuvent supprimer leurs propres avis (ou admin)
CREATE POLICY "Users can delete their own reviews"
  ON public.reviews
  FOR DELETE
  USING (
    auth.uid() = reviewer_id
    OR EXISTS (
      SELECT 1 FROM public.seller_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_reviews_updated_at();

-- Fonction pour calculer la note moyenne d'un vendeur
CREATE OR REPLACE FUNCTION public.calculate_seller_rating(seller_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  avg_rating DECIMAL;
BEGIN
  SELECT AVG(rating)::DECIMAL(3,2)
  INTO avg_rating
  FROM public.reviews
  WHERE seller_id = seller_user_id;

  RETURN COALESCE(avg_rating, 5.0);
END;
$$ LANGUAGE plpgsql;

-- Fonction trigger pour mettre à jour automatiquement le rating du vendeur
CREATE OR REPLACE FUNCTION public.update_seller_rating()
RETURNS TRIGGER AS $$
DECLARE
  affected_seller_id UUID;
BEGIN
  -- Déterminer quel vendeur est affecté
  IF TG_OP = 'DELETE' THEN
    affected_seller_id := OLD.seller_id;
  ELSE
    affected_seller_id := NEW.seller_id;
  END IF;

  -- Mettre à jour le rating du vendeur
  UPDATE public.seller_profiles
  SET rating = public.calculate_seller_rating(affected_seller_id)
  WHERE user_id = affected_seller_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le rating automatiquement
DROP TRIGGER IF EXISTS update_seller_rating_on_review_change ON public.reviews;
CREATE TRIGGER update_seller_rating_on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_seller_rating();

-- Vérification
SELECT 'Migration reviews terminée avec succès!' AS status;

-- Compter les avis existants
SELECT COUNT(*) AS total_reviews FROM public.reviews;
