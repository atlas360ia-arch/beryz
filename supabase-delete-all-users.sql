-- =====================================================
-- SCRIPT: SUPPRIMER TOUS LES UTILISATEURS
-- =====================================================
-- ⚠️ ATTENTION: Cette action est IRRÉVERSIBLE!
-- ⚠️ Tous les utilisateurs, profils, annonces, messages, etc. seront supprimés
-- =====================================================

-- ÉTAPE 1: Voir combien d'utilisateurs existent
SELECT
  'Utilisateurs totaux' as description,
  COUNT(*) as nombre
FROM auth.users
UNION ALL
SELECT
  'Profils vendeurs',
  COUNT(*)
FROM public.seller_profiles
UNION ALL
SELECT
  'Annonces',
  COUNT(*)
FROM public.listings
UNION ALL
SELECT
  'Messages',
  COUNT(*)
FROM public.messages;


-- ÉTAPE 2: Supprimer tous les profils vendeurs
-- (Cela supprimera aussi les annonces, messages, etc. grâce aux CASCADE)
DELETE FROM public.seller_profiles;


-- ÉTAPE 3: Supprimer tous les utilisateurs dans auth.users
-- ⚠️ ATTENTION: Décommentez cette ligne seulement si vous êtes SÛR!
-- DELETE FROM auth.users;


-- ÉTAPE 4: Vérifier que tout est vide
SELECT
  'Utilisateurs restants' as description,
  COUNT(*) as nombre
FROM auth.users
UNION ALL
SELECT
  'Profils restants',
  COUNT(*)
FROM public.seller_profiles
UNION ALL
SELECT
  'Annonces restantes',
  COUNT(*)
FROM public.listings
UNION ALL
SELECT
  'Messages restants',
  COUNT(*)
FROM public.messages;


-- =====================================================
-- MÉTHODE ALTERNATIVE: Supprimer seulement les users de test
-- =====================================================

-- Supprimer un utilisateur spécifique par email
/*
DELETE FROM public.seller_profiles
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'test@example.com'
);

DELETE FROM auth.users
WHERE email = 'test@example.com';
*/


-- =====================================================
-- MÉTHODE SÉCURISÉE: Supprimer tous sauf l'admin
-- =====================================================

-- Supprimer tous les profils sauf les admins
/*
DELETE FROM public.seller_profiles
WHERE role != 'admin';

-- Supprimer tous les users sauf ceux qui ont un profil admin
DELETE FROM auth.users
WHERE id NOT IN (
  SELECT user_id FROM public.seller_profiles WHERE role = 'admin'
);
*/
