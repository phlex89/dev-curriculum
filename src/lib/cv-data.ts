// ──────────────────────────────────────────────────────────────────────────
// FONTE DI VERITÀ DEI CONTENUTI DEL CURRICULUM
// ──────────────────────────────────────────────────────────────────────────
// Tutti i temi (Terminal, WinXP, BentoBox, ThreeD…) pescano da questo file:
// nessun contenuto va "schiantato" dentro i componenti. Per aggiornare il CV
// basta modificare i dati qui sotto — il rendering si adatta di conseguenza.
//
// Convenzioni:
//  - `skillGroups` è la fonte di verità delle competenze; `skills` (lista piatta)
//    è derivata automaticamente per i temi che mostrano una nuvola di chip.
//  - Ogni esperienza ha `description` (sintesi di una riga) + `highlights`
//    (bullet in forma problema → decisione → risultato).
//  - `earlyCareer` riassume in un unico blocco gli anni 2011–2015 (web design,
//    grafica, freelance, co-founding) per dare profondità al percorso di crescita
//    senza appesantire la sezione "senior".
//  - `principles` è il manifesto del metodo (per le ere editoriali);
//    `keyFigures` alimenta contatori e statistiche (niente conteggi di tecnologie).
// ──────────────────────────────────────────────────────────────────────────

export interface ContactInfo {
  email: string;
  linkedin: string;
  location: string;
  phone: string;
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

export interface Conference {
  name: string;
  location: string;
  year: string;
}

export interface Principle {
  title: string;
  text: string;
}

export interface KeyFigures {
  startYear: number;
  products: number;
  sectors: number;
  designSystems: number;
}

// ── Competenze (fonte di verità, raggruppate per capacità) ─────────────────
const skillGroups: SkillGroup[] = [
  {
    label: 'Architettura Frontend',
    items: [
      'Monorepo strategy (Nx)',
      'Migrazioni legacy incrementali',
      'Architetture multi-app condivise',
      'Performance & bundle strategy',
      'REST & GraphQL'
    ]
  },
  {
    label: 'Design System',
    items: [
      'Component library riutilizzabili',
      'White-label & dynamic theming',
      'Design token',
      'Storybook',
      'Vanilla-extract / CSS-in-JS'
    ]
  },
  {
    label: 'Leadership tecnica',
    items: [
      'Tech lead & mentoring',
      'Code review & convenzioni',
      'Scelte di stack guidate dal problema',
      'Collaborazione cross-funzionale'
    ]
  },
  {
    label: 'Stack',
    items: ['TypeScript', 'JavaScript (ES6+)', 'Vue 3', 'React', 'Svelte', 'Angular', 'Flutter', 'Node.js', 'Pinia', 'Redux']
  }
];

export const cvData = {
  name: 'Stefano Tedeschi',
  role: 'Frontend Architect',
  tagline: 'Progetto architetture frontend che fanno scalare prodotti e team — dal pixel al deploy.',
  summary:
    'Frontend Architect con 15 anni di mestiere: progetto architetture e design system che fanno scalare prodotti e team. ' +
    'Il mio lavoro comincia prima del codice — capire il problema, scegliere i trade-off, dare al team fondamenta e convenzioni ' +
    'su cui correre — e arriva fino al pixel, grazie a radici da web designer. Ho guidato la trasformazione frontend di piattaforme ' +
    'enterprise in fintech, IoT, banking e media; lo stack (TypeScript, Vue, React, Svelte, Flutter) è uno strumento: lo scelgo per ' +
    'il contesto, mai per moda.',

  principles: [
    {
      title: 'Lo stack segue il problema',
      text: 'Framework e librerie sono strumenti: si scelgono per vincoli e contesto, mai per moda.'
    },
    {
      title: 'L’architettura è una leva per il team',
      text: 'Design system, convenzioni e developer experience moltiplicano la velocità di tutti, non solo la mia.'
    },
    {
      title: 'Dal pixel al deploy',
      text: 'Il background da designer è parte del metodo: l’architettura serve l’esperienza, non se stessa.'
    }
  ] as Principle[],

  keyFigures: {
    startYear: 2011,
    products: 10,
    sectors: 4,
    designSystems: 2
  } as KeyFigures,

  contact: {
    email: 'stefano.tedeschi@protechstudio.it',
    linkedin: 'https://www.linkedin.com/in/stefano-tedeschi-developer/',
    location: 'Torino (Italy)',
    phone: '+39 3478736835'
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
      title: 'Frontend Architect',
      company: 'Tundr Tech Corporation s.r.l.',
      location: 'Full remote, Italy',
      period: '02/2023 - Oggi',
      sector: 'Fintech & Insurance',
      description:
        'Prima figura frontend dell’azienda: chiamato a risanare il legacy e dare al prodotto fondamenta su cui scalare.',
      highlights: [
        'Architettura impostata da zero: monorepo Nx, design system con dynamic theming e component library condivisa — oggi 3 prodotti (piattaforma core, backoffice, app mobile) vivono sulle stesse fondamenta.',
        'Strategia di migrazione del legacy verso React per moduli incrementali: debito tecnico ridotto senza fermare la roadmap di prodotto.',
        'Convenzioni, standard e review come pratica quotidiana: un team frontend allineato e autonomo; app mobile in Flutter seguita lungo l’intero product lifecycle.'
      ],
      technologies: ['Nx Monorepo', 'TypeScript', 'Vue 3', 'React', 'Pinia', 'Vanilla-extract', 'Flutter']
    },
    {
      title: 'Frontend Architect',
      company: 'SCM.it — c/o Topcon Agriculture',
      location: 'Roma, Italy',
      period: '12/2017 - 12/2022',
      sector: 'IoT & AgriTech',
      description:
        'Architetto dell’ecosistema frontend di una piattaforma IoT: una sola fondamenta condivisa per oltre cinque applicativi e più brand.',
      highlights: [
        'Problema: rivenditori e OEM dovevano offrire la piattaforma col proprio marchio senza fork del codice. Soluzione: component library white-label con theming centralizzato — una codebase, N brand.',
        'L’architettura condivisa ha abbattuto il time-to-market dei nuovi applicativi — catalogo E-Commerce (Market), backoffice, gestionali TMR e Spotlight, landing TAP — con UX coerente su tutto l’ecosistema.',
        'Riferimento tecnico del team — review, onboarding, mentoring — e interfaccia con PM, design e cliente su requisiti e trade-off.'
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
        'Le fondamenta enterprise: frontend per banking e pagamenti, dove sicurezza e vincoli normativi dettano le scelte.',
      highlights: [
        'Portale pubblico per la gestione delle carte di credito ICBPI/CartaSi: React, Redux e metodologia BEM su requisiti di sicurezza bancari.',
        'Web app Agenda/Calendario per i gestori Intesa Sanpaolo “Filiale in linea” (Angular, TypeScript), in parallelo allo stack React: due ecosistemi, stessi standard di qualità.',
        'Pannello di controllo per i gestori della Filiale Intesa Sanpaolo Online (AngularJS, Node.js).'
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
        'App mobile ibrida MONHEY per UNICREDIT: esperienza nativa costruita con tecnologie web.',
      highlights: [
        'Interfacce mobile cross-platform con Ionic e AngularJS: un’unica codebase per più piattaforme.'
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
        'Manutenzione evolutiva e nuove funzionalità per i siti editoriali del gruppo Mondadori ed Edizioni Piemme.',
      highlights: [
        'Temi e interfacce su WordPress (incluso un forum PHPbb) e Drupal per testate ad alto traffico.',
        'Ottimizzazione di funzionalità esistenti e nuove sezioni per Donna Moderna, Panorama, Starbene e Teasisters.'
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
      'Tutto parte dal design: web designer, grafico e co-founder di Protech Studio — è qui che ho imparato che un’interfaccia è un sistema, non una pagina.',
    highlights: [
      'Co-founder della web agency Protech Studio: progettazione e sviluppo di siti e gestionali web (CMS Joomla/WordPress, framework PHP proprietario), branding e identità visiva.',
      'Attività freelance e collaborazioni (I-Nova, Idromet Sider, Quinto Colore): siti WordPress/PrestaShop, e-commerce, SEO e campagne social/AdWords.',
      'Docenze di informatica e grafica e certificazioni Adobe ACA (Photoshop, Dreamweaver) presso enti di formazione.'
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

  conferences: [
    { name: 'JS World', location: 'Amsterdam', year: '2021' },
    { name: 'JS Kongress', location: 'Monaco di Baviera', year: '2019' },
    { name: 'WebAppConf', location: 'Torino', year: '2018' },
    { name: 'Angular Conf', location: 'Torino', year: '2016' }
  ] as Conference[]
};
