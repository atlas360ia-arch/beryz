-- =====================================================
-- SCRIPT: Créer un utilisateur admin
-- Exécuter dans l'éditeur SQL de Supabase
-- =====================================================

-- IMPORTANT: Remplacez ces valeurs avant d'exécuter
-- EMAIL: L'email de l'admin
-- PASSWORD: Le mot de passe (minimum 6 caractères)
-- BUSINESS_NAME: Le nom à afficher

-- Étape 1: Créer l'utilisateur dans auth.users
-- NOTE: Cette approche utilise la fonction admin de Supabase
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@beryz.com', -- CHANGEZ CET EMAIL
  crypt('Admin123!', gen_salt('bf')), -- CHANGEZ CE MOT DE PASSE
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Récupérer l'ID du user qu'on vient de créer
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Récupérer l'ID du dernier user créé
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = 'admin@beryz.com' -- UTILISEZ LE MÊME EMAIL QU'AU-DESSUS
  ORDER BY created_at DESC
  LIMIT 1;

  -- Créer le profil seller avec le rôle admin
  INSERT INTO public.seller_profiles (
    user_id,
    business_name,
    role,
    verified,
    rating,
    created_at
  ) VALUES (
    new_user_id,
    'Administrateur Beryz', -- CHANGEZ CE NOM SI VOUS VOULEZ
    'admin',
    true,
    5.0,
    NOW()
  );
END $$;

-- Vérifier que tout s'est bien passé
SELECT
  u.email,
  sp.business_name,
  sp.role,
  sp.verified
FROM auth.users u
JOIN public.seller_profiles sp ON u.id = sp.user_id
WHERE u.email = 'admin@beryz.com'; -- UTILISEZ LE MÊME EMAIL
