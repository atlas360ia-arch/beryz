-- Migration: Système de demandes de vérification
-- Semaine 16: Vérification & Notifications

-- Créer la table verification_requests
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Informations de vérification
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100), -- ex: "Entreprise", "Particulier", "Auto-entrepreneur"
  business_registration VARCHAR(100), -- Numéro d'enregistrement
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  city VARCHAR(100),

  -- Documents (URLs vers Supabase Storage)
  id_document_url TEXT, -- Carte d'identité / Passeport
  business_document_url TEXT, -- Registre de commerce / Patente
  proof_of_address_url TEXT, -- Justificatif de domicile

  -- Message du vendeur
  message TEXT,

  -- Statut
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),

  -- Métadonnées de traitement
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Un utilisateur ne peut avoir qu'une seule demande en attente
  CONSTRAINT unique_pending_request UNIQUE (user_id, status)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON public.verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON public.verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_created_at ON public.verification_requests(created_at DESC);

-- RLS Policies
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres demandes
CREATE POLICY "Users can view their own verification requests"
  ON public.verification_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer leurs propres demandes
CREATE POLICY "Users can create verification requests"
  ON public.verification_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leurs demandes en attente
CREATE POLICY "Users can update their pending requests"
  ON public.verification_requests
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all verification requests"
  ON public.verification_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.seller_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Les admins peuvent tout modifier
CREATE POLICY "Admins can update verification requests"
  ON public.verification_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.seller_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_verification_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_verification_requests_updated_at ON public.verification_requests;
CREATE TRIGGER update_verification_requests_updated_at
  BEFORE UPDATE ON public.verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_verification_requests_updated_at();

-- Fonction trigger pour mettre à jour le statut vérifié du vendeur
CREATE OR REPLACE FUNCTION public.update_seller_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la demande est approuvée, mettre à jour le profil vendeur
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE public.seller_profiles
    SET verified = true
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement le statut vérifié
DROP TRIGGER IF EXISTS update_seller_verification_on_approval ON public.verification_requests;
CREATE TRIGGER update_seller_verification_on_approval
  AFTER UPDATE ON public.verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_seller_verification();

-- Créer la table notification_preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Préférences email
  email_new_message BOOLEAN DEFAULT true,
  email_new_favorite BOOLEAN DEFAULT true,
  email_listing_approved BOOLEAN DEFAULT true,
  email_listing_rejected BOOLEAN DEFAULT true,
  email_new_review BOOLEAN DEFAULT true,
  email_verification_approved BOOLEAN DEFAULT true,
  email_marketing BOOLEAN DEFAULT false,

  -- Préférences in-app (pour futur)
  app_new_message BOOLEAN DEFAULT true,
  app_new_favorite BOOLEAN DEFAULT true,
  app_listing_update BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies pour notification_preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres préférences
CREATE POLICY "Users can view their own notification preferences"
  ON public.notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent modifier leurs propres préférences
CREATE POLICY "Users can update their own notification preferences"
  ON public.notification_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON public.notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notification_preferences_updated_at();

-- Créer les préférences par défaut pour les utilisateurs existants
INSERT INTO public.notification_preferences (user_id)
SELECT u.id
FROM auth.users u
LEFT JOIN public.notification_preferences np ON u.id = np.user_id
WHERE np.user_id IS NULL;

-- Fonction pour créer automatiquement les préférences lors de l'inscription
CREATE OR REPLACE FUNCTION public.create_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer les préférences automatiquement (utilise le trigger existant)
-- Note: Cela s'ajoute à la fonction handle_new_user existante
DROP TRIGGER IF EXISTS create_notification_preferences_on_signup ON auth.users;
CREATE TRIGGER create_notification_preferences_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_notification_preferences();

-- Vérification
SELECT 'Migration verification requests terminée avec succès!' AS status;

-- Statistiques
SELECT
  (SELECT COUNT(*) FROM public.verification_requests) AS total_requests,
  (SELECT COUNT(*) FROM public.verification_requests WHERE status = 'pending') AS pending_requests,
  (SELECT COUNT(*) FROM public.notification_preferences) AS users_with_preferences;
