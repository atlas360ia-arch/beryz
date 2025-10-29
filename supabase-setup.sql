-- =====================================================
-- SETUP SUPABASE - ANNONCES GUINÉE
-- À exécuter dans l'éditeur SQL de Supabase
-- =====================================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABLE: seller_profiles
-- =====================================================
CREATE TABLE IF NOT EXISTS public.seller_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name VARCHAR(255),
  description TEXT,
  avatar_url VARCHAR(500),
  phone VARCHAR(20),
  city VARCHAR(100),
  rating DECIMAL(3,2) DEFAULT 5.0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index pour améliorer les performances
CREATE INDEX idx_seller_profiles_user_id ON public.seller_profiles(user_id);
CREATE INDEX idx_seller_profiles_city ON public.seller_profiles(city);

-- =====================================================
-- 2. TABLE: categories
-- =====================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_categories_slug ON public.categories(slug);

-- Insertion des catégories par défaut
INSERT INTO public.categories (name, slug, icon, description) VALUES
('Emploi', 'emploi', '💼', 'Offres d''emploi et opportunités professionnelles'),
('Immobilier', 'immobilier', '🏠', 'Vente et location de biens immobiliers'),
('Services', 'services', '🔧', 'Services professionnels et prestations'),
('Objets', 'objets', '📦', 'Achat et vente d''objets divers')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 3. TABLE: listings
-- =====================================================
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) NOT NULL,
  price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'GNF',
  location_city VARCHAR(100) NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(20) DEFAULT 'draft',
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '60 days')
);

-- Index
CREATE INDEX idx_listings_user_id ON public.listings(user_id);
CREATE INDEX idx_listings_category_id ON public.listings(category_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX idx_listings_location_city ON public.listings(location_city);

-- =====================================================
-- 4. TABLE: messages
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX idx_messages_listing_id ON public.messages(listing_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- =====================================================
-- 5. TABLE: favorites
-- =====================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Index
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_listing_id ON public.favorites(listing_id);

-- =====================================================
-- 6. TABLE: reports
-- =====================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  reported_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_reports_listing_id ON public.reports(listing_id);
CREATE INDEX idx_reports_status ON public.reports(status);

-- =====================================================
-- 7. TABLE: admin_logs
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_id UUID,
  target_type VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_admin_logs_admin_id ON public.admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created_at ON public.admin_logs(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES: seller_profiles
-- =====================================================

-- Tout le monde peut voir les profils publics
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.seller_profiles FOR SELECT
  USING (true);

-- Les utilisateurs peuvent créer leur propre profil
CREATE POLICY "Users can create their own profile"
  ON public.seller_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update their own profile"
  ON public.seller_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES: categories
-- =====================================================

-- Tout le monde peut voir les catégories
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

-- =====================================================
-- POLICIES: listings
-- =====================================================

-- Tout le monde peut voir les listings publiés
CREATE POLICY "Published listings are viewable by everyone"
  ON public.listings FOR SELECT
  USING (status = 'published' OR auth.uid() = user_id);

-- Les utilisateurs authentifiés peuvent créer des listings
CREATE POLICY "Authenticated users can create listings"
  ON public.listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leurs propres listings
CREATE POLICY "Users can update their own listings"
  ON public.listings FOR UPDATE
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres listings
CREATE POLICY "Users can delete their own listings"
  ON public.listings FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES: messages
-- =====================================================

-- Les utilisateurs peuvent voir leurs propres messages
CREATE POLICY "Users can view their own messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Les utilisateurs peuvent envoyer des messages
CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Les utilisateurs peuvent marquer leurs messages comme lus
CREATE POLICY "Users can update their received messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- =====================================================
-- POLICIES: favorites
-- =====================================================

-- Les utilisateurs peuvent voir leurs propres favoris
CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent ajouter des favoris
CREATE POLICY "Users can add favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs favoris
CREATE POLICY "Users can delete their favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES: reports
-- =====================================================

-- Les utilisateurs peuvent voir leurs propres rapports
CREATE POLICY "Users can view their own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = reported_by);

-- Les utilisateurs peuvent créer des rapports
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

-- =====================================================
-- POLICIES: admin_logs
-- =====================================================

-- Seuls les admins peuvent voir les logs (à implémenter avec une fonction personnalisée)
CREATE POLICY "Admin logs are viewable by admins only"
  ON public.admin_logs FOR SELECT
  USING (false); -- À modifier plus tard avec une fonction is_admin()

-- =====================================================
-- FUNCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour créer automatiquement un seller_profile après inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.seller_profiles (user_id, created_at)
  VALUES (NEW.id, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil automatiquement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour listings
DROP TRIGGER IF EXISTS set_updated_at ON public.listings;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Créer le bucket pour les images de listings
INSERT INTO storage.buckets (id, name, public)
VALUES ('listings', 'listings', true)
ON CONFLICT (id) DO NOTHING;

-- Policy pour le bucket listings
CREATE POLICY "Anyone can view listing images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listings');

CREATE POLICY "Authenticated users can upload listing images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listings'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own listing images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'listings'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own listing images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'listings'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Créer le bucket pour les avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy pour le bucket avatars
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- FIN DU SETUP
-- =====================================================
-- Maintenant vous pouvez utiliser votre base de données !
