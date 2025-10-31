-- =====================================================
-- SCRIPT 1: Voir les utilisateurs sans profil
-- =====================================================

-- Afficher tous les utilisateurs qui n'ont PAS de profil seller
SELECT
  u.id,
  u.email,
  u.created_at,
  'SANS PROFIL' as status
FROM auth.users u
LEFT JOIN public.seller_profiles sp ON u.id = sp.user_id
WHERE sp.user_id IS NULL
ORDER BY u.created_at DESC;


-- =====================================================
-- SCRIPT 2: Créer les profils manquants
-- =====================================================

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
-- SCRIPT 3: Vérifier que tout est OK maintenant
-- =====================================================

-- Afficher tous les utilisateurs AVEC leurs profils
SELECT
  u.email,
  sp.business_name,
  sp.role,
  sp.verified,
  sp.city,
  u.created_at
FROM auth.users u
JOIN public.seller_profiles sp ON u.id = sp.user_id
ORDER BY u.created_at DESC;
