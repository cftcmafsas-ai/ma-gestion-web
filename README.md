# Ma Gestion Web — Cloudflare Worker

Cette branche contient la vitrine et l’application statique, ainsi que les routes d’authentification pour Cloudflare Workers.

## Authentification et Neon

- `/login` affiche `login.html`.
- `POST /api/register` crée le premier et unique compte administrateur.
- `POST /api/login` vérifie l’adresse e-mail et le mot de passe.
- `GET /api/session` indique si le compte est initialisé et si une session est active.
- `POST /api/logout` révoque la session.
- Les comptes et sessions sont stockés dans Neon PostgreSQL (`mgw_admin`, `mgw_sessions`).
- Le mot de passe est dérivé avec PBKDF2-SHA-256 et le cookie de session est HttpOnly, Secure et SameSite=Strict.

Le premier compte est créé atomiquement avec l'identifiant fixe `1`. Une fois créé, l'inscription publique est fermée. Le mot de passe doit contenir au moins 12 caractères.

## Préparer le déploiement

1. Dans Cloudflare, sélectionnez le Worker `ma-gestion-web` et vérifiez que vous déployez bien cette branche et cette configuration.
2. Dans Neon, récupérez l'URL de connexion de la base PostgreSQL. Ne la placez jamais dans Git.
3. Configurez le secret sur le Worker :

```bash
npx wrangler secret put DATABASE_URL
```

Collez l'URL Neon lorsque Wrangler le demande. Les tables d'authentification sont créées automatiquement au premier appel API. Aucun secret n'est inclus dans le dépôt.

## Déployer depuis un poste local

```bash
npm install
npx wrangler login
npx wrangler deploy
```

Pour tester localement, configurez une variable locale dans un fichier `.dev.vars` (ne jamais committer ce fichier), puis lancez `npm run dev`.

## Déploiement automatique depuis GitHub

Dans Cloudflare Workers & Pages, ouvrez le Worker `ma-gestion-web`, configurez Workers Builds pour connecter le dépôt GitHub `cftcmafsas-ai/ma-gestion-web`, sélectionnez `preview/corrections-2026-11-18` comme branche de déploiement de ce Worker de test et utilisez `npm install` puis `npx wrangler deploy` comme commande de déploiement. Vérifiez que le secret `DATABASE_URL` est configuré dans les paramètres du Worker. Ne reliez pas la branche `main` et ne changez pas le Worker du site officiel.

## Important

Un commit GitHub seul ne met pas automatiquement le Worker à jour. Le code doit être déployé avec le secret Neon configuré. Le dépôt ne contient aucune valeur de connexion ou mot de passe.
