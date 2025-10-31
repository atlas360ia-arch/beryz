-- =====================================================
-- MÉTHODE SIMPLE: Créer un admin
-- =====================================================

-- ÉTAPE 1: Inscrivez-vous normalement sur le site avec:
-- Email: admin@beryz.com
-- Password: Admin123!
-- (ou vos propres identifiants)

-- ÉTAPE 2: Exécutez ce SQL pour le transformer en admin:

UPDATE public.seller_profiles
SET role = 'admin', verified = true
WHERE user_id = (
  SELECT id FROM auth.users
  WHERE email = 'admin@beryz.com'  -- CHANGEZ CET EMAIL
);

-- Vérifier que ça a fonctionné:
SELECT
  u.email,
  sp.business_name,
  sp.role,
  sp.verified
FROM auth.users u
JOIN public.seller_profiles sp ON u.id = sp.user_id
WHERE sp.role = 'admin';
