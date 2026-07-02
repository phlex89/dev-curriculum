# Product

## Register

brand

## Users

Due pubblici, pesati al 50%:

1. **Recruiter / HR** — arriva da LinkedIn o da un link condiviso ("guarda la versione Windows XP"), spesso da mobile, con pochi minuti. Deve trovare esperienze, competenze e contatti senza dover capire le metafore d'epoca. Non installa niente, non legge istruzioni.
2. **Peer developer / hiring manager tecnico** — valuta il craft: fedeltà storica delle ricostruzioni, qualità delle micro-interazioni, easter egg, performance, accessibilità. È il pubblico che decide se il sito è "impressionante" o "una demo".

## Product Purpose

"Time-Machine Resume": il CV di Stefano Tedeschi navigabile attraverso dodici ere della UI/UX (dal terminale CRT al 3D/WebGL), con una Timeline globale persistente. Ogni era è una ricostruzione storica completa e autonoma che pesca dagli stessi dati (`src/lib/cv-data.ts`). Successo = il recruiter trova le informazioni e ricorda il sito; il tecnico lo condivide come esempio di craft frontend.

## Brand Personality

**Sperimentale · massimalista · audace.** Un art project prima che un template: la fedeltà storica e lo spettacolo hanno priorità. Ogni era va fino in fondo alla propria estetica (niente mezze misure, niente "ispirato a"): Televideo ha il vero font SAA5050, il Web 1.0 ha il modem 56k, XP ha il BSOD. L'audacia però non è mai gratuita: è al servizio della narrazione "viaggio nel tempo" e i contenuti del CV restano sempre raggiungibili (doppio binario in ogni era).

## Anti-references

- **Template CV/portfolio generico** — hero + card grid + timeline verticale da Dribbble/Webflow. Se un'era potesse essere scambiata per un tema WordPress, ha fallito.
- **Demo tecnica fine a sé stessa** — showcase di effetti dove i contenuti del CV diventano pretestuosi o illeggibili. Lo spettacolo non deve mai costare la fruibilità dei dati.
- **Parodia/meme retrò low-effort** — nostalgia da meme (Comic Sans ironico, glitch gratuiti, pixel art approssimativa). Le ere sono ricostruzioni storicamente accurate e affettuose, non scenografie di cartone.

## Design Principles

1. **Fedeltà d'epoca totale** — ogni era usa i font, i colori, i suoni e le convenzioni di interazione autentici del suo periodo; quando un asset originale non è lecito, si ricostruisce (Bedstead, Clippy SVG, badge 88×31 in CSS).
2. **Doppio binario, nessun vicolo cieco** — ogni metafora interattiva (gioco, terminale, pagine Televideo) ha sempre una via diretta ai contenuti: click, "MOSTRA TUTTO", indice. Il recruiter frettoloso non deve mai giocare per leggere il CV.
3. **Una sola fonte di verità** — tutti i contenuti vivono in `cv-data.ts`; le ere sono lenti diverse sugli stessi dati, mai copie divergenti.
4. **Reduced-motion è un'era parallela, non un ripiego** — ogni animazione ha un'alternativa dignitosa e completa sotto `prefers-reduced-motion`.
5. **Il massimalismo si paga in performance budget** — webfont subsettati e self-hostati, Three.js e Lenis lazy, audio sintetizzato al volo: lo spettacolo non deve costare byte inutili al primo paint.

## Accessibility & Inclusion

- `prefers-reduced-motion` rispettato in ogni era con percorsi alternativi completi (directory statica per Pixel Art, lista skill per il marquee Parallax, ecc.).
- Controlli reali (`<button>`, link) dietro ogni metafora visiva; navigazione da tastiera nelle ere interattive (frecce/WASD, Invio/Esc, numeri Televideo, `R` SVELA).
- Contrasto: attenzione nota sul blu Televideo (alzato a `#5a6bff`); le ere scure (Terminal, Teletext, ThreeD) vanno verificate caso per caso.
- Audio opt-in, muto di default, preferenza persistita.
- Target WCAG AA come baseline pragmatica, con deroghe consapevoli dove la fedeltà d'epoca lo impone (da documentare, non da ignorare).
