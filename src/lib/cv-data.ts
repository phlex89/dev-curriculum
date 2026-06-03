// ──────────────────────────────────────────────────────────────────────────
// FONTE DI VERITÀ DEI CONTENUTI DEL CURRICULUM
// ──────────────────────────────────────────────────────────────────────────
// Tutti i temi (Terminal, WinXP, BentoBox, ThreeD) pescano da questo file:
// nessun contenuto va "schiantato" dentro i componenti. Per aggiornare il CV
// basta modificare i dati qui sotto — il rendering si adatta di conseguenza.
//
// Convenzioni:
//  - `skillGroups` è la fonte di verità delle competenze; `skills` (lista piatta)
//    è derivata automaticamente per i temi che mostrano una nuvola di chip.
//  - Ogni esperienza ha `description` (sintesi di una riga) + `highlights`
//    (risultati/attività in forma di bullet, orientati all'impatto).
//  - `earlyCareer` riassume in un unico blocco gli anni 2011–2015 (web design,
//    grafica, freelance, co-founding) per dare profondità al percorso di crescita
//    senza appesantire la sezione "senior".
// ──────────────────────────────────────────────────────────────────────────

export interface ContactInfo {
  email: string;
  linkedin: string;
  location: string;
  phone: string;
  website: string;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface LanguageSkill {
  name: string;
  level: string;
  note?: string;
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  period: string;
  description: string;
  highlights: string[];
  technologies: string[];
  sector?: string;
}

export interface EarlyCareer {
  period: string;
  title: string;
  description: string;
  highlights: string[];
  technologies: string[];
}

export interface Education {
  title: string;
  institute: string;
  location: string;
  period: string;
}

export interface Certification {
  name: string;
  issuer: string;
}

export interface Conference {
  name: string;
  location: string;
  year: string;
}

// ── Competenze (fonte di verità, raggruppate per area) ─────────────────────
const skillGroups: SkillGroup[] = [
  {
    label: 'Linguaggi & Core',
    items: ['TypeScript', 'JavaScript (ES6+)', 'HTML5', 'CSS3']
  },
  {
    label: 'Framework & Librerie',
    items: ['Vue 3', 'React', 'Svelte', 'Angular', 'Flutter (BLoC)']
  },
  {
    label: 'State & Data',
    items: ['Pinia', 'Redux', 'Redux Saga', 'GraphQL', 'REST API']
  },
  {
    label: 'Styling & Design System',
    items: ['Vanilla-extract', 'CSS-in-JS', 'Storybook', 'Dynamic Theming']
  },
  {
    label: 'Tooling & Architettura',
    items: ['Nx Monorepo', 'Webpack', 'Lerna', 'Node.js', 'Git', 'Unit Testing']
  }
];

export const cvData = {
  name: 'Stefano Tedeschi',
  role: 'Senior Frontend Engineer',
  tagline: 'Progetto architetture frontend e design system scalabili — dal pixel al deploy.',
  summary:
    'Senior Frontend Engineer con oltre 10 anni di esperienza nello sviluppo di applicazioni web complesse e scalabili. ' +
    'Specializzato in architetture frontend, design system condivisi e component library riutilizzabili, con un percorso ' +
    'che parte dal web design e dalla grafica e arriva all’ownership tecnica di piattaforme core e tool di backoffice. ' +
    'Lavoro principalmente con Vue, React e TypeScript in contesti enterprise (fintech, IoT, banking), con forte attenzione ' +
    'a manutenibilità, scalabilità e developer experience.',

  contact: {
    email: 'stefano.tedeschi@protechstudio.it',
    linkedin: 'https://www.linkedin.com/in/stefano-tedeschi-developer/',
    location: 'Torino (Italy)',
    phone: '+39 3478736835',
    website: 'https://www.protechstudio.it'
  } as ContactInfo,

  // Competenze categorizzate + lista piatta derivata (back-compat con i temi a chip)
  skillGroups,
  skills: skillGroups.flatMap((group) => group.items),

  languages: [
    { name: 'Italiano', level: 'Madrelingua' },
    { name: 'Inglese', level: 'Professionale (C1)', note: 'Comprensione C1/C2 · Produzione scritta B2' }
  ] as LanguageSkill[],

  experience: [
    {
      title: 'Senior Frontend Engineer',
      company: 'Tundr Tech Corporation s.r.l.',
      location: 'Full remote, Italy',
      period: '01/2026 - Oggi',
      sector: 'Fintech & Insurance',
      description:
        'Ownership tecnica del frontend: riprogettazione e sviluppo di applicazioni moderne e scalabili, dalle piattaforme core ai tool di backoffice.',
      highlights: [
        'Definizione dell’architettura frontend e di un design system condiviso, con component library riutilizzabili e dynamic theming.',
        'Migrazione di web app legacy verso uno stack moderno (React), riducendo debito tecnico e tempi di sviluppo.',
        'Sviluppo dell’app mobile in Flutter (BLoC) e collaborazione con team cross-funzionali lungo l’intero product lifecycle.'
      ],
      technologies: ['Vue 3', 'TypeScript', 'Pinia', 'Nx Monorepo', 'Vanilla-extract', 'React', 'Flutter']
    },
    {
      title: 'Senior Front End Developer / Frontend Architect',
      company: 'SCM.it — c/o Topcon Agriculture',
      location: 'Roma, Italy',
      period: '12/2017 - 01/2022',
      sector: 'IoT & AgriTech',
      description:
        'Architetto frontend di una piattaforma web IoT: progettazione dell’architettura condivisa e dell’ecosistema di prodotti.',
      highlights: [
        'Progettazione dell’architettura frontend condivisa tra i diversi applicativi della piattaforma.',
        'Creazione di una component library condivisa con supporto alla brandizzazione white-label.',
        'Sviluppo del catalogo E-Commerce (Market), del backoffice e dei gestionali TMR (alimentazione bestiame) e Spotlight (analisi dei campi), oltre alla landing page TAP.'
      ],
      technologies: ['React', 'Redux', 'Redux Saga', 'TypeScript', 'GraphQL', 'Webpack 4', 'Lerna', 'Node.js', 'Storybook', 'GatsbyJS']
    },
    {
      title: 'Front End Developer',
      company: 'IrisCube Reply',
      location: 'Torino / Milano, Italy',
      period: '08/2016 - 11/2017',
      sector: 'Banking',
      description:
        'Sviluppo frontend di applicativi web per il settore bancario e dei pagamenti, su clienti enterprise.',
      highlights: [
        'Portale pubblico per la gestione delle carte di credito ICBPI/CartaSi (React, Redux, Redux Saga, metodologia BEM).',
        'Web app Agenda/Calendario per i gestori Intesa Sanpaolo “Filiale in linea” (Angular 2/4, TypeScript).',
        'Pannello di controllo per i gestori della Filiale Intesa Sanpaolo Online (AngularJS 1.6+, Node.js).'
      ],
      technologies: ['React', 'Redux', 'Angular', 'TypeScript', 'Node.js', 'Webpack']
    },
    {
      title: 'Front-end Developer',
      company: 'Pay Reply',
      location: 'Torino, Italy',
      period: '02/2016 - 08/2016',
      sector: 'Mobile & Payments',
      description:
        'Sviluppo dell’app mobile ibrida MONHEY per UNICREDIT con tecnologie web.',
      highlights: [
        'Implementazione delle interfacce mobile cross-platform con Ionic e AngularJS.'
      ],
      technologies: ['Ionic', 'AngularJS', 'HTML', 'CSS']
    },
    {
      title: 'Front-end Developer',
      company: 'Fincons Group',
      location: 'Bari, Italy',
      period: '02/2015 - 01/2016',
      sector: 'Media & Publishing',
      description:
        'Manutenzione evolutiva/correttiva e nuove funzionalità per i siti editoriali del gruppo Mondadori ed Edizioni Piemme.',
      highlights: [
        'Sviluppo e personalizzazione di temi e interfacce su WordPress (incluso un forum PHPbb) e Drupal.',
        'Ottimizzazione di funzionalità esistenti e realizzazione di nuove sezioni per Donna Moderna, Panorama, Starbene e Teasisters.'
      ],
      technologies: ['PHP', 'JavaScript', 'jQuery', 'WordPress', 'Drupal']
    }
  ] as Experience[],

  // Blocco riassuntivo del percorso 2011–2015 (livello 2): le radici da web
  // designer / grafico / imprenditore che hanno costruito le basi del profilo.
  earlyCareer: {
    period: '2011 - 2015',
    title: 'Le origini: Web Design, Grafica & Imprenditoria',
    description:
      'Prima della specializzazione frontend, ho costruito le basi del mestiere come web designer e grafico pubblicitario, anche da imprenditore.',
    highlights: [
      'Co-founder della web agency Protech Studio: progettazione e sviluppo di siti e gestionali web (CMS Joomla/WordPress, framework PHP proprietario), branding e identità visiva.',
      'Attività freelance e collaborazioni (I-Nova, Idromet Sider, Quinto Colore): siti WordPress/PrestaShop, e-commerce, SEO e campagne social/AdWords.',
      'Docenze di informatica e grafica (Adobe Photoshop, Illustrator, InDesign) presso enti di formazione.'
    ],
    technologies: ['WordPress', 'Joomla', 'PrestaShop', 'PHP', 'jQuery', 'SEO', 'Adobe Suite']
  } as EarlyCareer,

  education: [
    {
      title: 'Attestato di Tecnico Programmatore Web',
      institute: 'Mediagroup Service',
      location: 'Bari, Italy',
      period: '2010'
    },
    {
      title: 'Diploma di Perito Informatico',
      institute: 'Istituto Tecnico Tecnologico "Modesto Panetti"',
      location: 'Bari, Italy',
      period: '2003 - 2008'
    }
  ] as Education[],

  certifications: [
    { name: 'Adobe ACA — Photoshop CS4', issuer: 'Adobe' },
    { name: 'Adobe ACA — Dreamweaver CS4', issuer: 'Adobe' }
  ] as Certification[],

  conferences: [
    { name: 'JS World', location: 'Amsterdam', year: '2021' },
    { name: 'JS Kongress', location: 'Monaco di Baviera', year: '2019' },
    { name: 'WebAppConf', location: 'Torino', year: '2018' },
    { name: 'Angular Conf', location: 'Torino', year: '2016' }
  ] as Conference[]
};
