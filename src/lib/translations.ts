// ──────────────────────────────────────────────────────────────────────────
// TRADUZIONI (EN) — CONTENUTI CV + STRINGHE UI DELLE ERE
// ──────────────────────────────────────────────────────────────────────────
// `cvDataEn` è lo specchio inglese, campo per campo, di `cv-data.ts` (che resta
// la fonte di verità italiana: ogni modifica lì va riportata qui).
// `ui` contiene le stringhe di chrome/interfaccia di ogni era in entrambe le
// lingue; i temi le leggono via `getUi()` in `i18n.ts`. I testi "d'epoca" già
// in inglese (QUEST COMPLETE, Under Construction…) restano nei componenti.
// ──────────────────────────────────────────────────────────────────────────

import type { cvData } from './cv-data';
import type { Theme } from './store';

const skillGroupsEn = [
  {
    label: 'Frontend Architecture',
    items: [
      'Monorepo strategy (Nx)',
      'Incremental legacy migrations',
      'Shared multi-app architectures',
      'Performance & bundle strategy',
      'REST & GraphQL'
    ]
  },
  {
    label: 'Design Systems',
    items: [
      'Reusable component libraries',
      'White-label & dynamic theming',
      'Design tokens',
      'Storybook',
      'Vanilla-extract / CSS-in-JS'
    ]
  },
  {
    label: 'Technical leadership',
    items: [
      'Tech lead & mentoring',
      'Code review & conventions',
      'Problem-driven stack choices',
      'Cross-functional collaboration'
    ]
  },
  {
    label: 'Stack',
    items: ['TypeScript', 'JavaScript (ES6+)', 'Vue 3', 'React', 'Svelte', 'Angular', 'Flutter', 'Node.js', 'Pinia', 'Redux']
  }
];

export const cvDataEn: typeof cvData = {
  name: 'Stefano Tedeschi',
  role: 'Frontend Architect',
  tagline: 'I design frontend architectures that make products and teams scale — from pixel to deploy.',
  summary:
    'Frontend Architect with 15 years in the craft: I design architectures and design systems that make products and teams scale. ' +
    'My work starts before the code — understanding the problem, weighing the trade-offs, giving the team foundations and conventions ' +
    'to run on — and reaches all the way down to the pixel, thanks to web-designer roots. I have led the frontend transformation of ' +
    'enterprise platforms across fintech, IoT, banking and media; the stack (TypeScript, Vue, React, Svelte, Flutter) is a tool: ' +
    'I choose it for the context, never for fashion.',

  principles: [
    {
      title: 'The stack follows the problem',
      text: 'Frameworks and libraries are tools: you choose them for constraints and context, never for fashion.'
    },
    {
      title: 'Architecture is leverage for the team',
      text: 'Design systems, conventions and developer experience multiply everyone’s speed, not just mine.'
    },
    {
      title: 'From pixel to deploy',
      text: 'The designer background is part of the method: architecture serves the experience, not itself.'
    }
  ],

  keyFigures: {
    startYear: 2011,
    products: 10,
    sectors: 4,
    designSystems: 2
  },

  contact: {
    email: 'stefano.tedeschi@protechstudio.it',
    linkedin: 'https://www.linkedin.com/in/stefano-tedeschi-developer/',
    location: 'Turin (Italy)',
    phone: '+39 3478736835'
  },

  skillGroups: skillGroupsEn,
  skills: skillGroupsEn.flatMap((group) => group.items),

  languages: [
    { name: 'Italian', level: 'Native' },
    { name: 'English', level: 'Professional (C1)', note: 'C1/C2 comprehension · B2 written production' }
  ],

  experience: [
    {
      title: 'Frontend Architect',
      company: 'Tundr Tech Corporation s.r.l.',
      location: 'Full remote, Italy',
      period: '02/2023 - Present',
      sector: 'Fintech & Insurance',
      description:
        'The company’s first frontend hire: brought in to turn the legacy codebase around and give the product foundations to scale on.',
      highlights: [
        'Architecture set up from scratch: Nx monorepo, a design system with dynamic theming and a shared component library — today 3 products (core platform, back office, mobile app) live on the same foundations.',
        'Legacy-to-React migration strategy by incremental modules: technical debt reduced without stopping the product roadmap.',
        'Conventions, standards and reviews as daily practice: an aligned, autonomous frontend team; a Flutter mobile app followed across the entire product lifecycle.'
      ],
      technologies: ['Nx Monorepo', 'TypeScript', 'Vue 3', 'React', 'Pinia', 'Vanilla-extract', 'Flutter']
    },
    {
      title: 'Frontend Architect',
      company: 'SCM.it — c/o Topcon Agriculture',
      location: 'Rome, Italy',
      period: '12/2017 - 12/2022',
      sector: 'IoT & AgriTech',
      description:
        'Architect of an IoT platform’s frontend ecosystem: one shared foundation for more than five applications and multiple brands.',
      highlights: [
        'Problem: dealers and OEMs needed to offer the platform under their own brand without forking the code. Solution: a white-label component library with centralised theming — one codebase, N brands.',
        'The shared architecture cut the time-to-market of new applications — E-Commerce catalogue (Market), back office, the TMR and Spotlight management tools, the TAP landing page — with a consistent UX across the whole ecosystem.',
        'Technical reference for the team — reviews, onboarding, mentoring — and interface with PMs, design and the client on requirements and trade-offs.'
      ],
      technologies: ['React', 'Redux', 'Redux Saga', 'TypeScript', 'GraphQL', 'Webpack 4', 'Lerna', 'Node.js', 'Storybook', 'GatsbyJS']
    },
    {
      title: 'Front End Developer',
      company: 'IrisCube Reply',
      location: 'Turin / Milan, Italy',
      period: '08/2016 - 11/2017',
      sector: 'Banking',
      description:
        'The enterprise foundations: frontend for banking and payments, where security and regulatory constraints drive the choices.',
      highlights: [
        'Public portal for ICBPI/CartaSi credit-card management: React, Redux and the BEM methodology under banking security requirements.',
        'Agenda/Calendar web app for the Intesa Sanpaolo “Filiale in linea” advisors (Angular, TypeScript), in parallel with the React stack: two ecosystems, the same quality standards.',
        'Control panel for the advisors of the Intesa Sanpaolo Online branch (AngularJS, Node.js).'
      ],
      technologies: ['React', 'Redux', 'Angular', 'TypeScript', 'Node.js', 'Webpack']
    },
    {
      title: 'Front-end Developer',
      company: 'Pay Reply',
      location: 'Turin, Italy',
      period: '02/2016 - 08/2016',
      sector: 'Mobile & Payments',
      description:
        'MONHEY hybrid mobile app for UNICREDIT: a native-feeling experience built with web technologies.',
      highlights: [
        'Cross-platform mobile interfaces with Ionic and AngularJS: a single codebase for multiple platforms.'
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
        'Evolutionary maintenance and new features for the editorial websites of the Mondadori group and Edizioni Piemme.',
      highlights: [
        'Themes and interfaces on WordPress (including a PHPbb forum) and Drupal for high-traffic publications.',
        'Optimisation of existing features and new sections for Donna Moderna, Panorama, Starbene and Teasisters.'
      ],
      technologies: ['PHP', 'JavaScript', 'jQuery', 'WordPress', 'Drupal']
    }
  ],

  earlyCareer: {
    period: '2011 - 2015',
    title: 'The origins: Web Design, Graphics & Entrepreneurship',
    description:
      'It all starts with design: web designer, graphic designer and co-founder of Protech Studio — that is where I learned that an interface is a system, not a page.',
    highlights: [
      'Co-founder of the Protech Studio web agency: design and development of websites and web management tools (Joomla/WordPress CMS, an in-house PHP framework), branding and visual identity.',
      'Freelance work and collaborations (I-Nova, Idromet Sider, Quinto Colore): WordPress/PrestaShop websites, e-commerce, SEO and social/AdWords campaigns.',
      'IT and graphic-design teaching plus Adobe ACA certifications (Photoshop, Dreamweaver) at training institutes.'
    ],
    technologies: ['WordPress', 'Joomla', 'PrestaShop', 'PHP', 'jQuery', 'SEO', 'Adobe Suite']
  },

  education: [
    {
      title: 'Web Programmer Technician Certificate',
      institute: 'Mediagroup Service',
      location: 'Bari, Italy',
      period: '2010'
    },
    {
      title: 'Computer Science Diploma (Perito Informatico)',
      institute: 'Istituto Tecnico Tecnologico "Modesto Panetti"',
      location: 'Bari, Italy',
      period: '2003 - 2008'
    }
  ],

  conferences: [
    { name: 'JS World', location: 'Amsterdam', year: '2021' },
    { name: 'JS Kongress', location: 'Munich', year: '2019' },
    { name: 'WebAppConf', location: 'Turin', year: '2018' },
    { name: 'Angular Conf', location: 'Turin', year: '2016' }
  ]
};

// ── Stringhe UI (chrome delle ere + componenti condivisi) ───────────────────

const it = {
  shared: {
    seoIntro: (name: string, role: string, years: number) =>
      `${name} è un ${role} basato a Torino, con ${years} anni di esperienza in architetture frontend, design system e component library per piattaforme enterprise in fintech, IoT, banking e media.`,
    sections: {
      profile: 'Profilo',
      experience: 'Esperienza professionale',
      skills: 'Competenze',
      languages: 'Lingue',
      education: 'Formazione',
      conferences: 'Conferenze',
      contacts: 'Contatti'
    },
    technologies: 'Tecnologie',
    pageTitleNeutral: 'Stefano Tedeschi — Frontend Architect · CV interattivo',
    pageTitleSuffix: 'Time-Machine Resume',
    nowViewing: (label: string) => `Ora visualizzi l’era ${label}`,
    audioOn: 'Attiva i suoni d’epoca',
    audioOff: 'Disattiva i suoni d’epoca',
    audioTitleOn: 'Suoni: attivi',
    audioTitleOff: 'Suoni: muto',
    langSwitchLabel: 'Lingua del CV',
    langItalian: 'Passa all’italiano',
    langEnglish: 'Switch to English',
    eraTitles: {
      terminal: 'Terminale · 1980s',
      teletext: 'Televideo · 1984',
      pixel: 'Pixel Art · 1988',
      web1: 'Web 1.0 · 1996',
      winxp: 'Windows XP · 2001',
      skeuo: 'Skeuomorphism · 2010',
      material: 'Material Design · 2014',
      bento: 'Modern Flat · 2015',
      brutalism: 'Brutalism · 2017',
      parallax: 'Parallax · 2018',
      glass: 'Glassmorphism · 2020',
      threed: 'Future 3D · 2026'
    } as Record<Theme, string>,
    eraNames: {} as Partial<Record<Theme, string>>
  },
  timeline: {
    hintOneOf: 'una di',
    hintEras: (n: number) => `${n} ere`,
    hintCta: 'Viaggia nel tempo',
    navLabel: 'Linea del tempo: scegli l’era',
    prevEra: 'Era precedente',
    nextEra: 'Era successiva',
    currentEra: (label: string) => `Era attuale: ${label}. Tocca per scegliere un’altra era`,
    closeList: 'Chiudi l’elenco delle ere',
    chooseEra: 'Scegli l’era',
    close: 'Chiudi'
  },
  teletext: {
    service: 'TELEVIDEO',
    days: ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB'],
    months: ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'],
    profile: 'PROFILO',
    experience: 'ESPERIENZA',
    origins: 'LE ORIGINI',
    skills: 'COMPETENZE',
    languages: 'LINGUE',
    education: 'FORMAZIONE',
    conferences: 'CONFERENZE',
    contacts: 'CONTATTI',
    pageUnavailable: 'PAGINA NON DISPONIBILE',
    decoderMiss: 'Il decoder non trova questa pagina nel ciclo.',
    notFoundHintA: 'Digita ',
    notFoundHintB: " per l'indice, oppure scegli una voce qui sotto.",
    pageIndex: 'INDICE DELLE PAGINE',
    coverHintA: 'Digita un numero di pagina (es. ',
    coverHintB: ') o usa i tasti colorati in basso.',
    coverSecretA: '★ Curiosità: prova la pagina segreta ',
    coverSecretB: ' →',
    selectRole: (from: number, to: number) => `Seleziona un ruolo (pagine ${from}–${to}):`,
    expOriginsHintA: 'Le origini (2011–2015): pagina ',
    expOriginsHintB: '.',
    expDetailHintA: '◄ / ► per scorrere · ',
    expDetailHintB: " per l'elenco",
    email: 'EMAIL',
    tel: 'TEL',
    link: 'LINK',
    location: 'LUOGO',
    downloadCv: '▼ SCARICA CV (PDF)',
    secretPage: 'PAGINA SEGRETA',
    horoscopeTitle: 'OROSCOPO DEL FRONTEND ★',
    horoscopeA: 'Le stelle indicano refactoring in arrivo. Un design system condiviso porterà fortuna. Diffida dei ',
    horoscopeB: '. La tua giornata fortunata è il ',
    horoscopeFriday: 'deploy del venerdì',
    horoscopeC: ' (coraggioso).',
    secretJokeA: 'Premi ',
    secretJokeB: ' e hai trovato la battuta nascosta: «funziona sul mio computer». 😎',
    secretHintA: 'Premi ',
    secretHintB: ' per svelare/nascondere · ',
    secretHintC: " per tornare all'indice",
    fastextAria: 'Tasti rapidi colorati',
    keypadAria: 'Tastierino numerico pagine',
    digit: (d: string) => `Cifra ${d}`,
    deleteDigit: 'Cancella cifra',
    indexAria: 'Indice 100',
    prevPage: 'Pagina precedente',
    nextPage: 'Pagina successiva',
    statusIndex: '100 INDICE',
    statusPages: '◄ ► PAGINE',
    statusReveal: 'R = SVELA',
    reveal: 'SVELA'
  },
  pixel: {
    zones: {
      about: { name: 'CASA', sub: 'Profilo', intro: (name: string) => `Sono ${name}.` },
      experience: { name: 'CASTELLO', sub: 'Esperienze', intro: 'Le sale del castello: un piano per ogni avventura.' },
      skills: { name: 'BOTTEGA', sub: 'Competenze', intro: 'Benvenuto in bottega! Ecco il mio inventario.' },
      education: { name: 'BIBLIOTECA', sub: 'Formazione', intro: 'Tomi, diplomi e conferenze raccolti nel tempo.' },
      contact: { name: 'POSTA', sub: 'Contatti', intro: 'Manda un messaggio: scegli il canale.' },
      cv: { name: 'SCRIGNO', sub: 'Scarica CV', intro: 'Uno scrigno! Dentro: il mio curriculum.' }
    },
    secret: { name: 'PERGAMENA', sub: 'Scheda Eroe', intro: 'Una pergamena segreta! Ecco la scheda dell’eroe…' },
    pondSign: 'AL LAGHETTO SI PESCA! ↗',
    heroStats: {
      class: 'CLASSE',
      years: 'ANNI DI AVVENTURA',
      products: 'PRODOTTI COSTRUITI',
      guilds: 'GILDE (AZIENDE)',
      conferences: 'SALE DELLE CONFERENZE',
      languages: 'LINGUE PARLATE',
      eras: 'ERE ATTRAVERSATE'
    },
    fishCatches: [
      'Hai pescato un BUG! 🐛',
      'Una vecchia FLOPPY DISK… 💾',
      'Uno stivale logoro. 👢',
      'Un PESCE DORATO! ✨',
      'Niente… solo alghe. 🌿',
      'Una CARTUCCIA NES! 🎮',
      'Un commit perduto nel tempo. 🕓',
      'Una lattina arrugginita. 🥫'
    ],
    fishCasting: 'Lancio la lenza…',
    showAll: 'MOSTRA TUTTO',
    controlsHint: '↑ ↓ ← → / WASD · segui la strada da sinistra a destra',
    villageLead: 'VILLAGGIO DI STEFANO — scegli una zona da visitare:',
    visited: '✓ visitata',
    allZones: 'Tutte le zone',
    close: 'Chiudi',
    villageMap: 'MAPPA DEL VILLAGGIO',
    floor: (n: number) => `PIANO ${n}`,
    foundations: 'FONDAMENTA',
    languages: 'Lingue',
    education: 'Formazione',
    conferences: 'Conferenze',
    linkedin: 'in · LinkedIn (nuova scheda)',
    cvLead: 'Apri lo scrigno e porta via il tesoro: il curriculum completo in PDF.',
    questNote: '★ QUEST COMPLETE — hai esplorato tutto il villaggio!',
    downloadCv: '⬇ SCARICA IL CV (PDF)',
    secretFound: '★ Hai trovato la zona segreta! ★',
    secretQuote: '“Dal pixel al deploy”: ogni livello di questa mappa è una tappa vera del percorso.',
    questBanner: 'QUEST COMPLETE!',
    questBannerSub: 'Hai visitato tutte le zone',
    cheatTitle: '✦ CHEAT ATTIVATO ✦',
    nightOn: 'Modalità notte ON · +30 vite',
    nightOff: 'Modalità notte OFF',
    secretTitle: '✦ ZONA SEGRETA ✦',
    secretToastSub: 'Una pergamena è apparsa nel cuore del villaggio'
  },
  web1: {
    modemAria: 'Netscape — connetti al modem',
    visitorAria: 'visitatore numero 0013337'
  },
  winxp: {
    expLabel: 'Esperienze',
    eduLabel: 'Formazione',
    contactLabel: 'Contatti',
    errorTitle: 'Errore',
    cvResources: 'Risorse del CV',
    trash: 'Cestino',
    minimize: 'Minimizza',
    maximize: 'Ingrandisci',
    close: 'Chiudi',
    startingUp: 'Avvio in corso',
    languages: 'Lingue',
    conferences: 'Conferenze & Seminari',
    linkedinProfile: 'Profilo',
    errorMessage: 'Impossibile eliminare l’esperienza. È troppo preziosa.',
    mailSubject: 'Opportunità per un Frontend Architect',
    mailMe: 'Scrivimi una mail',
    clippyText: 'Sembra che tu stia cercando un Frontend Architect.',
    clippyCta: 'Clicca qui per scrivermi una mail!',
    myComputer: 'Il mio PC',
    recentDocs: 'Documenti recenti',
    controlPanel: 'Pannello di Controllo'
  },
  skeuo: {
    skills: 'Competenze',
    experience: 'Esperienza',
    education: 'Istruzione',
    languages: 'Lingue',
    conferences: 'Conferenze'
  },
  material: {
    tabProfile: 'Profilo',
    tabExperience: 'Esperienza',
    tabSkills: 'Competenze',
    tabStudies: 'Studi',
    tabContacts: 'Contatti',
    quickContacts: 'Contatti rapidi',
    resumeSections: 'Sezioni del curriculum',
    profile: 'Profilo',
    experience: 'Esperienza',
    origins: 'Le origini',
    skills: 'Competenze',
    studiesAndSoftSkills: 'Studi & competenze trasversali',
    education: 'Istruzione',
    languages: 'Lingue',
    conferences: 'Conferenze',
    contacts: 'Contatti',
    emailMe: 'Scrivimi una email',
    writeMe: 'Scrivimi'
  },
  glass: {
    switchToLight: 'Passa all’aspetto chiaro',
    switchToDark: 'Passa all’aspetto scuro',
    lightAppearance: 'Aspetto chiaro',
    darkAppearance: 'Aspetto scuro',
    profile: 'Profilo',
    experience: 'Esperienza',
    skills: 'Competenze',
    languages: 'Lingue',
    education: 'Formazione',
    conferences: 'Conferenze'
  },
  parallax: {
    heroKicker: (role: string) => `${role} · Portfolio`,
    highlightWords: ['15', 'anni', 'architetture', 'frontend', 'design', 'system', 'scalare', 'prodotti', 'team', 'pixel', 'problema'],
    sectionNames: ['Intro', 'Profilo', 'Percorso', 'In cifre', 'Competenze', 'Ritratto', 'Contatti'],
    sectionsNavLabel: 'Indice delle sezioni',
    fullCv: 'CV completo',
    pause: 'Pausa',
    play: 'Play',
    scrollHint: 'Scorri',
    profileKicker: 'Profilo',
    journeyKicker: 'Percorso',
    skillsKicker: 'Competenze',
    statYearsLabel: 'Anni di mestiere',
    statYearsSub: (year: number) => `dal ${year}`,
    statProductsLabel: 'Prodotti sulle mie fondamenta',
    statProductsSub: 'piattaforme · backoffice · mobile',
    statSectorsLabel: 'Settori enterprise',
    statSectorsSub: 'fintech · IoT · banking · media',
    ctaKicker: 'Lavoriamo insieme',
    ctaTitle: 'Parliamone.',
    ctaEmail: 'Scrivimi',
    ctaLinkedin: 'LinkedIn'
  },
  vote: {
    panelTitle: 'Le ere più amate',
    panelLabel: 'Classifica delle ere',
    empty: 'Classifica non disponibile in questo momento.',
    loading: 'Classifica in caricamento…',
    like: (label: string) => `Metti mi piace all’era ${label}`,
    unlike: (label: string) => `Togli il mi piace all’era ${label}`,
    likeTitle: 'Vota questa era',
    likedTitle: 'Ti piace questa era',
    showRanking: 'Vedi la classifica delle ere',
    rankingTitle: 'Classifica delle ere'
  }
};

const en: UiStrings = {
  shared: {
    seoIntro: (name: string, role: string, years: number) =>
      `${name} is a ${role} based in Turin, with ${years} years of experience in frontend architectures, design systems and component libraries for enterprise platforms across fintech, IoT, banking and media.`,
    sections: {
      profile: 'Profile',
      experience: 'Professional experience',
      skills: 'Skills',
      languages: 'Languages',
      education: 'Education',
      conferences: 'Conferences',
      contacts: 'Contacts'
    },
    technologies: 'Technologies',
    pageTitleNeutral: 'Stefano Tedeschi — Frontend Architect · Interactive CV',
    pageTitleSuffix: 'Time-Machine Resume',
    nowViewing: (label: string) => `Now viewing the ${label} era`,
    audioOn: 'Turn on era sounds',
    audioOff: 'Turn off era sounds',
    audioTitleOn: 'Sound: on',
    audioTitleOff: 'Sound: muted',
    langSwitchLabel: 'CV language',
    langItalian: 'Passa all’italiano',
    langEnglish: 'Switch to English',
    eraTitles: {
      terminal: 'Terminal · 1980s',
      teletext: 'Teletext · 1984',
      pixel: 'Pixel Art · 1988',
      web1: 'Web 1.0 · 1996',
      winxp: 'Windows XP · 2001',
      skeuo: 'Skeuomorphism · 2010',
      material: 'Material Design · 2014',
      bento: 'Modern Flat · 2015',
      brutalism: 'Brutalism · 2017',
      parallax: 'Parallax · 2018',
      glass: 'Glassmorphism · 2020',
      threed: 'Future 3D · 2026'
    },
    eraNames: { teletext: 'Teletext' }
  },
  timeline: {
    hintOneOf: 'one of',
    hintEras: (n: number) => `${n} eras`,
    hintCta: 'Travel through time',
    navLabel: 'Timeline: choose an era',
    prevEra: 'Previous era',
    nextEra: 'Next era',
    currentEra: (label: string) => `Current era: ${label}. Tap to choose another era`,
    closeList: 'Close the era list',
    chooseEra: 'Choose an era',
    close: 'Close'
  },
  teletext: {
    service: 'TELETEXT',
    days: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    months: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
    profile: 'PROFILE',
    experience: 'EXPERIENCE',
    origins: 'ORIGINS',
    skills: 'SKILLS',
    languages: 'LANGUAGES',
    education: 'EDUCATION',
    conferences: 'CONFERENCES',
    contacts: 'CONTACTS',
    pageUnavailable: 'PAGE UNAVAILABLE',
    decoderMiss: 'The decoder cannot find this page in the cycle.',
    notFoundHintA: 'Type ',
    notFoundHintB: ' for the index, or choose an entry below.',
    pageIndex: 'PAGE INDEX',
    coverHintA: 'Type a page number (e.g. ',
    coverHintB: ') or use the colour keys below.',
    coverSecretA: '★ Tip: try secret page ',
    coverSecretB: ' →',
    selectRole: (from: number, to: number) => `Select a role (pages ${from}–${to}):`,
    expOriginsHintA: 'Origins (2011–2015): page ',
    expOriginsHintB: '.',
    expDetailHintA: '◄ / ► to scroll · ',
    expDetailHintB: ' for the list',
    email: 'EMAIL',
    tel: 'TEL',
    link: 'LINK',
    location: 'LOCATION',
    downloadCv: '▼ DOWNLOAD CV (PDF)',
    secretPage: 'SECRET PAGE',
    horoscopeTitle: 'FRONTEND HOROSCOPE ★',
    horoscopeA: 'The stars foretell refactoring ahead. A shared design system will bring good fortune. Beware of ',
    horoscopeB: '. Your lucky day is the ',
    horoscopeFriday: 'Friday deploy',
    horoscopeC: ' (brave).',
    secretJokeA: 'Press ',
    secretJokeB: ' and you found the hidden joke: "works on my machine". 😎',
    secretHintA: 'Press ',
    secretHintB: ' to reveal/hide · ',
    secretHintC: ' to return to the index',
    fastextAria: 'Coloured fast keys',
    keypadAria: 'Numeric page keypad',
    digit: (d: string) => `Digit ${d}`,
    deleteDigit: 'Delete digit',
    indexAria: 'Index 100',
    prevPage: 'Previous page',
    nextPage: 'Next page',
    statusIndex: '100 INDEX',
    statusPages: '◄ ► PAGES',
    statusReveal: 'R = REVEAL',
    reveal: 'REVEAL'
  },
  pixel: {
    zones: {
      about: { name: 'HOME', sub: 'Profile', intro: (name: string) => `I'm ${name}.` },
      experience: { name: 'CASTLE', sub: 'Experience', intro: 'The castle halls: one floor for every adventure.' },
      skills: { name: 'SHOP', sub: 'Skills', intro: "Welcome to the shop! Here's my inventory." },
      education: { name: 'LIBRARY', sub: 'Education', intro: 'Tomes, diplomas and talks gathered over time.' },
      contact: { name: 'POST', sub: 'Contact', intro: 'Send a message: pick your channel.' },
      cv: { name: 'CHEST', sub: 'Download CV', intro: 'A chest! Inside: my résumé.' }
    },
    secret: { name: 'SCROLL', sub: 'Hero Sheet', intro: "A secret scroll! Here's the hero's sheet…" },
    pondSign: "GONE FISHIN' AT THE POND! ↗",
    heroStats: {
      class: 'CLASS',
      years: 'YEARS OF ADVENTURE',
      products: 'PRODUCTS BUILT',
      guilds: 'GUILDS (COMPANIES)',
      conferences: 'CONFERENCE HALLS',
      languages: 'LANGUAGES SPOKEN',
      eras: 'ERAS TRAVERSED'
    },
    fishCatches: [
      'You caught a BUG! 🐛',
      'An old FLOPPY DISK… 💾',
      'A worn-out boot. 👢',
      'A GOLDEN FISH! ✨',
      'Nothing… just seaweed. 🌿',
      'A NES CARTRIDGE! 🎮',
      'A commit lost in time. 🕓',
      'A rusty can. 🥫'
    ],
    fishCasting: 'Casting the line…',
    showAll: 'SHOW ALL',
    controlsHint: '↑ ↓ ← → / WASD · follow the road left to right',
    villageLead: "STEFANO'S VILLAGE — pick a zone to visit:",
    visited: '✓ visited',
    allZones: 'All zones',
    close: 'Close',
    villageMap: 'VILLAGE MAP',
    floor: (n: number) => `FLOOR ${n}`,
    foundations: 'FOUNDATIONS',
    languages: 'Languages',
    education: 'Education',
    conferences: 'Conferences',
    linkedin: 'in · LinkedIn (new tab)',
    cvLead: 'Open the chest and take the treasure: the full résumé as a PDF.',
    questNote: '★ QUEST COMPLETE — you explored the whole village!',
    downloadCv: '⬇ DOWNLOAD THE CV (PDF)',
    secretFound: '★ You found the secret zone! ★',
    secretQuote: '“From pixel to deploy”: every level of this map is a real step of the journey.',
    questBanner: 'QUEST COMPLETE!',
    questBannerSub: 'You visited every zone',
    cheatTitle: '✦ CHEAT ACTIVATED ✦',
    nightOn: 'Night mode ON · +30 lives',
    nightOff: 'Night mode OFF',
    secretTitle: '✦ SECRET ZONE ✦',
    secretToastSub: 'A scroll has appeared in the heart of the village'
  },
  web1: {
    modemAria: 'Netscape — dial the modem',
    visitorAria: 'visitor number 0013337'
  },
  winxp: {
    expLabel: 'Experience',
    eduLabel: 'Education',
    contactLabel: 'Contacts',
    errorTitle: 'Error',
    cvResources: 'My CV',
    trash: 'Recycle Bin',
    minimize: 'Minimize',
    maximize: 'Maximize',
    close: 'Close',
    startingUp: 'Starting up',
    languages: 'Languages',
    conferences: 'Conferences & Seminars',
    linkedinProfile: 'Profile',
    errorMessage: 'Cannot delete experience: it is too precious.',
    mailSubject: 'An opportunity for a Frontend Architect',
    mailMe: 'Send me an email',
    clippyText: 'It looks like you are looking for a Frontend Architect.',
    clippyCta: 'Click here to send me an email!',
    myComputer: 'My Computer',
    recentDocs: 'My Recent Documents',
    controlPanel: 'Control Panel'
  },
  skeuo: {
    skills: 'Skills',
    experience: 'Experience',
    education: 'Education',
    languages: 'Languages',
    conferences: 'Conferences'
  },
  material: {
    tabProfile: 'Profile',
    tabExperience: 'Experience',
    tabSkills: 'Skills',
    tabStudies: 'Studies',
    tabContacts: 'Contacts',
    quickContacts: 'Quick contacts',
    resumeSections: 'Resume sections',
    profile: 'Profile',
    experience: 'Experience',
    origins: 'The origins',
    skills: 'Skills',
    studiesAndSoftSkills: 'Studies & soft skills',
    education: 'Education',
    languages: 'Languages',
    conferences: 'Conferences',
    contacts: 'Contacts',
    emailMe: 'Email me',
    writeMe: 'Write me'
  },
  glass: {
    switchToLight: 'Switch to light appearance',
    switchToDark: 'Switch to dark appearance',
    lightAppearance: 'Light appearance',
    darkAppearance: 'Dark appearance',
    profile: 'Profile',
    experience: 'Experience',
    skills: 'Skills',
    languages: 'Languages',
    education: 'Education',
    conferences: 'Conferences'
  },
  parallax: {
    heroKicker: (role: string) => `${role} · Portfolio`,
    highlightWords: ['15', 'years', 'architectures', 'frontend', 'design', 'systems', 'products', 'teams', 'scale', 'pixel', 'problem'],
    sectionNames: ['Intro', 'Profile', 'Journey', 'In numbers', 'Skills', 'Portrait', 'Contact'],
    sectionsNavLabel: 'Section index',
    fullCv: 'Full CV',
    pause: 'Pause',
    play: 'Play',
    scrollHint: 'Scroll',
    profileKicker: 'Profile',
    journeyKicker: 'Journey',
    skillsKicker: 'Skills',
    statYearsLabel: 'Years in the craft',
    statYearsSub: (year: number) => `since ${year}`,
    statProductsLabel: 'Products built on my foundations',
    statProductsSub: 'platforms · back-office · mobile',
    statSectorsLabel: 'Enterprise sectors',
    statSectorsSub: 'fintech · IoT · banking · media',
    ctaKicker: "Let's work together",
    ctaTitle: "Let's talk.",
    ctaEmail: 'Email me',
    ctaLinkedin: 'LinkedIn'
  },
  vote: {
    panelTitle: 'The most loved eras',
    panelLabel: 'Era ranking',
    empty: 'Ranking not available right now.',
    loading: 'Loading the ranking…',
    like: (label: string) => `Like the ${label} era`,
    unlike: (label: string) => `Remove your like from the ${label} era`,
    likeTitle: 'Vote for this era',
    likedTitle: 'You like this era',
    showRanking: 'See the era ranking',
    rankingTitle: 'Era ranking'
  }
};

export type UiStrings = typeof it;

export const ui: Record<'it' | 'en', UiStrings> = { it, en };
