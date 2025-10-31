-- =====================================================
-- SCRIPT: Créer un trigger pour auto-créer les profils
-- =====================================================
-- Ce trigger créera automatiquement un seller_profile
-- chaque fois qu'un nouvel utilisateur s'inscrit
-- =====================================================

-- ÉTAPE 1: Vérifier si le trigger existe déjà
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';


-- ÉTAPE 2: Créer la fonction qui sera appelée par le trigger
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


-- ÉTAPE 3: Créer le trigger sur auth.users
-- Note: Ce trigger s'exécutera automatiquement après chaque INSERT dans auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ÉTAPE 4: Vérifier que le trigger a été créé
SELECT
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';


-- =====================================================
-- SCRIPT DE TEST
-- =====================================================

-- Après avoir créé le trigger, testez en créant un nouveau compte
-- via l'interface de signup du site. Le profil devrait être créé automatiquement.

-- Vérifier les nouveaux profils:
SELECT
  u.email,
  sp.business_name,
  sp.role,
  sp.created_at
FROM auth.users u
JOIN public.seller_profiles sp ON u.id = sp.user_id
ORDER BY sp.created_at DESC
LIMIT 5;
