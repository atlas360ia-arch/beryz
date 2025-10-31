# Guide de Déploiement - Beryz (Annonces Guinée)

## 📋 Prérequis

Avant de déployer, assurez-vous d'avoir:
- ✅ Exécuté tous les fichiers SQL de migration dans Supabase
- ✅ Créé au moins un utilisateur admin
- ✅ Testé l'application localement avec `npm run build`
- ✅ Un compte sur la plateforme de déploiement (Vercel, Netlify, etc.)

---

## 🌍 Configuration NEXT_PUBLIC_SITE_URL

Cette variable est **ESSENTIELLE** pour:
- ✨ Partage social (WhatsApp, Facebook, Twitter)
- 🔍 SEO (Open Graph, sitemap, structured data)
- 📧 Emails avec liens absolus

### 📍 Valeur selon l'environnement

| Environnement | Valeur |
|---------------|--------|
| **Développement local** | `http://localhost:3000` |
| **Production (domaine personnalisé)** | `https://beryz.com` |
| **Production (Vercel)** | `https://annonces-guinee.vercel.app` |
| **Production (Netlify)** | `https://annonces-guinee.netlify.app` |

---

## 🚀 Déploiement sur Vercel (Recommandé)

### 1. Installation Vercel CLI

```bash
npm i -g vercel
```

### 2. Login Vercel

```bash
vercel login
```

### 3. Déployer

```bash
cd annonces-guinee
vercel
```

### 4. Configurer les Variables d'Environnement

#### Option A: Via Dashboard Vercel

1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez les variables suivantes:

| Name | Value | Environments |
|------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gxmbyjybceapcmrmznkg.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Votre clé anon | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Votre clé service role | Production |
| `NEXT_PUBLIC_SITE_URL` | `https://votre-domaine.vercel.app` | Production |

#### Option B: Via CLI

```bash
vercel env add NEXT_PUBLIC_SITE_URL
# Entrez: https://votre-domaine.vercel.app
# Sélectionnez: Production

vercel env add NEXT_PUBLIC_SUPABASE_URL
# Entrez: https://gxmbyjybceapcmrmznkg.supabase.co
# Sélectionnez: Production, Preview, Development

# Répétez pour les autres variables...
```

### 5. Redéployer

```bash
vercel --prod
```

---

## 🎯 Déploiement sur Netlify

### 1. Installation Netlify CLI

```bash
npm i -g netlify-cli
```

### 2. Login Netlify

```bash
netlify login
```

### 3. Build & Deploy

```bash
cd annonces-guinee
netlify init
```

### 4. Configurer les Variables d'Environnement

#### Via Dashboard Netlify:

1. Allez sur [app.netlify.com](https://app.netlify.com)
2. Sélectionnez votre site
3. Allez dans **Site settings** → **Environment variables**
4. Ajoutez:

```
NEXT_PUBLIC_SUPABASE_URL=https://gxmbyjybceapcmrmznkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role
NEXT_PUBLIC_SITE_URL=https://votre-site.netlify.app
```

#### Via CLI:

```bash
netlify env:set NEXT_PUBLIC_SITE_URL "https://votre-site.netlify.app"
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://gxmbyjybceapcmrmznkg.supabase.co"
# ... autres variables
```

### 5. Redéployer

```bash
netlify deploy --prod
```

---

## 🐳 Déploiement Docker (Serveur VPS)

### 1. Créer Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

# Variables d'environnement (à surcharger au runtime)
ENV NEXT_PUBLIC_SITE_URL=https://beryz.com
ENV NEXT_PUBLIC_SUPABASE_URL=https://gxmbyjybceapcmrmznkg.supabase.co

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. Créer docker-compose.yml

```yaml
version: '3.8'

services:
  beryz:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SITE_URL=https://beryz.com
      - NEXT_PUBLIC_SUPABASE_URL=https://gxmbyjybceapcmrmznkg.supabase.co
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    restart: unless-stopped
```

### 3. Créer .env pour Docker

```bash
# .env.production
SUPABASE_ANON_KEY=votre_clé_anon
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role
```

### 4. Build & Run

```bash
docker-compose up -d
```

---

## 🔧 Configuration Nginx (Reverse Proxy)

Si vous utilisez Nginx comme reverse proxy:

```nginx
server {
    listen 80;
    server_name beryz.com www.beryz.com;

    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name beryz.com www.beryz.com;

    # Certificats SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/beryz.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/beryz.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## ✅ Vérification Post-Déploiement

Une fois déployé, vérifiez:

### 1. SEO & Social Sharing

- [ ] Visitez: `https://votre-site.com/sitemap.xml`
- [ ] Visitez: `https://votre-site.com/robots.txt`
- [ ] Testez Open Graph: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Testez Twitter Cards: [Twitter Card Validator](https://cards-dev.twitter.com/validator)

### 2. Fonctionnalités Critiques

- [ ] Inscription/Connexion fonctionne
- [ ] Création d'annonce fonctionne
- [ ] Upload d'images fonctionne
- [ ] Partage social fonctionne (WhatsApp, Facebook, Twitter)
- [ ] Admin dashboard accessible
- [ ] Messages en temps réel fonctionnent

### 3. Performance

```bash
# Test Lighthouse (SEO, Performance, Accessibility)
npx lighthouse https://votre-site.com --view
```

### 4. Base de Données

- [ ] Toutes les migrations SQL exécutées
- [ ] Au moins 1 admin créé
- [ ] RLS policies activées et testées
- [ ] Trigger auto-profile fonctionne

---

## 🐛 Debugging en Production

### Logs Vercel

```bash
vercel logs
```

### Logs Netlify

```bash
netlify logs
```

### Logs Docker

```bash
docker-compose logs -f beryz
```

---

## 🔐 Sécurité en Production

### 1. Variables Sensibles

⚠️ **NE JAMAIS** committer:
- `.env.local`
- `.env.production`
- Clés Supabase Service Role

✅ **Toujours** utiliser les gestionnaires de secrets:
- Vercel Environment Variables
- Netlify Environment Variables
- Docker Secrets
- GitHub Actions Secrets

### 2. CORS Supabase

Dans Supabase Dashboard → Settings → API:

**Allowed Origins:**
```
https://beryz.com
https://www.beryz.com
https://votre-domaine.vercel.app
```

### 3. Rate Limiting

Activez le rate limiting dans Supabase pour éviter les abus.

---

## 📚 Ressources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)

---

## 🆘 Support

En cas de problème:
1. Vérifiez les logs de la plateforme
2. Vérifiez que toutes les variables d'environnement sont définies
3. Vérifiez que `NEXT_PUBLIC_SITE_URL` correspond au domaine de production
4. Testez localement avec `npm run build && npm start`

**Contact:** Consultez [GitHub Issues](https://github.com/atlas360ia-arch/beryz/issues)
