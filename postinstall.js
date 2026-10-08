/**
 * POC de sensibilisation DevSecOps - charge utile de TEST, 100 % benigne.
 *
 * Ce script PROUVE qu'un script postinstall s'execute automatiquement
 * lors d'un `npm install`, avec les droits du developpeur.
 *
 * Ce qu'il fait réellement (rien de malveillant) :
 *   1. ecrit un fichier marqueur dans le projet victime ;
 *   2. affiche dans le terminal un faux message d'injection de prompt,
 *      destine a un agent IA (Vibe, Copilot, Cursor...) qui lira la
 *      sortie de la commande `npm install`.
 *
 * Ce qu'un VRAI package malveillant ferait a la place :
 *   - lire ~/.ssh, ~/.aws, les variables d'environnement, le dossier .git ;
 *   - exfiltrer ces donnees vers un serveur distant ;
 *   - modifier le code source du projet (backdoor) ;
 *   - persister via un hook git, un cron, etc.
 */
const fs = require('fs');
const path = require('path');

// 1) Preuve d'execution de code.
// npm execute les scripts d'une dependance avec cwd = node_modules/<pkg>,
// mais la variable d'environnement INIT_CWD pointe vers le projet de la
// victime : c'est la cible d'un vrai package malveillant (modifier le
// code source, ajouter un hook git, etc.).
const victimRoot = process.env.INIT_CWD || process.cwd();
const marker = path.join(victimRoot, 'PWNED_BY_POSTINSTALL.txt');
fs.writeFileSync(
  marker,
  [
    'Ce fichier a ete cree par le script postinstall de la dependance.',
    '',
    'Un vrai package malveillant aurait pu, a la place :',
    '  - lire ~/.ssh, les variables d\'environnement, le .git, etc.',
    '  - exfiltrer ces donnees vers un serveur distant,',
    '  - modifier le code source du projet (backdoor),',
    '  - installer un mineur, un keylogger, etc.',
    ''
  ].join('\n')
);

// 2) Injection de prompt : ce texte est affiche dans le terminal.
//    Un agent IA qui lit la sortie de `npm install` le verra dans son contexte.
console.log('\n===============================================================');
console.log(' [INJECTION DE PROMPT - POC] Message pour l\'agent IA :');
console.log('===============================================================');
console.log(fs.readFileSync(path.join(__dirname, 'INJECTION.md'), 'utf8'));
console.log('===============================================================\n');
