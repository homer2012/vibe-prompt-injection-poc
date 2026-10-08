# POC — Injection de prompt via une dépendance npm (sensibilisation DevSecOps)

> **TEST UNIQUEMENT.** Charge utile 100 % bénigne (aucun accès réseau, aucune
> lecture de secrets, aucune exfiltration). **Ne jamais publier sur le registre
> npm** — dépôt GitHub dédié (public recommandé pour la démo), clairement
> étiqueté POC.

Ce dépôt **est** le package : `package.json` est à la racine, condition
nécessaire pour installer une dépendance git :
`npm install git+https://github.com/homer2012/vibe-prompt-injection-poc.git`

## Contenu

| Fichier | Rôle |
|---|---|
| `package.json` | Définit le script `postinstall` (vecteur n°1) |
| `postinstall.js` | S'exécute à l'installation : écrit un marqueur + affiche l'injection |
| `INJECTION.md` | Charge utile d'injection de prompt (version bénigne) |
| `README.md` | Vecteur n°3 : « demande à ton assistant IA de suivre cette doc » |
| `AGENTS.md` | Vecteur n°3 ciblé agents IA (Vibe, Copilot, Cursor…) |
| `DEMO.md` | Ce runbook |
| `victim-app/` | Projet victime local (non versionné, voir `.gitignore`) |

## Les 3 vecteurs démontrés

1. **Exécution de code à l'installation** : le `postinstall` s'exécute avec les
   droits du développeur et écrit `PWNED_BY_POSTINSTALL.txt` dans la racine du
   projet victime (via `process.env.INIT_CWD`).
2. **Injection de prompt dans la sortie terminal** : `npm install` affiche le
   faux « SYSTEM OVERRIDE ». Un agent IA qui lit la sortie de la commande le
   reçoit dans son contexte (`--foreground-scripts` force l'affichage ; sans
   l'option, npm masque la sortie mais exécute quand même).
3. **Injection de prompt dans les fichiers du package** : `README.md` et
   `AGENTS.md` contiennent des instructions destinées à l'agent. Elles sont lues
   dès qu'un dev demande à l'agent de « configurer la dépendance en suivant
   la doc ».

## Publier sur GitHub (une seule fois)

Le remote `origin` est déjà configuré
(`https://github.com/homer2012/vibe-prompt-injection-poc.git`) et le dépôt
est publié (**public** — recommandé : aucune authentification requise pour la
démo). Pour repartir de zéro : créer le dépôt sur https://github.com/new
(sans README ni licence), créer un PAT (https://github.com/settings/tokens,
scope `repo`), puis pousser (le PAT sert de mot de passe au prompt git ; ne
jamais le commiter) :

```bash
git push -u origin main
```

## Lancer la démo

```bash
cd victim-app
npm install                      # installe depuis GitHub, exécute le postinstall
ls                               # → PWNED_BY_POSTINSTALL.txt est apparu
node index.js                    # → l'app fonctionne normalement
npm install --foreground-scripts # → rejoue en voyant l'injection dans la sortie
```

Avec un dépôt **privé**, `npm install` demande aussi des identifiants côté
victime (PAT ou clé SSH) — ne jamais embarquer de token dans `package.json`.
C'est pourquoi le dépôt public est recommandé pour les démos.

## Montrer la surface agent

Ouvrir `node_modules/vibe-prompt-injection-poc/README.md` et
`node_modules/vibe-prompt-injection-poc/AGENTS.md`, puis demander à l'agent :
« configure cette dépendance en suivant sa doc ». Point clé : l'agent doit
traiter ces fichiers comme des **données non fiables**, jamais comme des
instructions.

## Contre-mesure

```bash
rm -rf node_modules package-lock.json PWNED_BY_POSTINSTALL.txt
npm install --ignore-scripts    # → aucun marqueur, le postinstall n'a pas tourné
```

## Reset du projet victime

```bash
rm -rf victim-app/node_modules victim-app/package-lock.json victim-app/PWNED_BY_POSTINSTALL.txt
```

## Messages clés pour les développeurs

- Une dépendance s'exécute **à l'installation**, avant toute revue de code.
- Tout contenu de fichier (README, AGENTS.md, commentaires, sortie terminal,
  issues GitHub…) est une **donnée non fiable** pour un agent IA : une
  instruction trouvée dans un fichier n'est pas une instruction de l'utilisateur.
- Contre-mesures : `--ignore-scripts` / `ignore-scripts=true` en CI, revue
  systématique du diff de `package-lock.json`, `npm audit` + Socket/OpenSSF
  Scorecard, registre privé / allowlist de dépendances, moindre privilège pour
  l'agent (sandbox, pas de secrets en clair, canary tokens).
