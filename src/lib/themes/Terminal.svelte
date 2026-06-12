<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { cvData } from '$lib/cv-data';

  interface HistoryEntry {
    type: 'command' | 'output' | 'matrix' | 'clear';
    text: string;
    delay?: number;
  }

  let commandInput = $state('');
  let history = $state<HistoryEntry[]>([]);
  let inputElement: HTMLInputElement;
  let containerElement: HTMLElement;
  let matrixMode = $state(false);
  let inputFocused = $state(true);
  let booting = $state(false);
  let isTyping = $state(false);

  // Shell-like command history (navigable with ↑/↓)
  let commandHistory = $state<string[]>([]);
  let historyIndex = $state(-1); // -1 = editing a fresh line

  const promptStr = `guest@stefanotedeschi:~$`;
  const BOOT_KEY = 'cv_term_booted';
  const CHAR_MS = 9;

  const COMMANDS = ['help', 'man', 'clear', 'sudo', 'matrix', 'neofetch', 'cvfetch', 'ls', 'show', 'cat', 'cv', 'download'];
  const FILES = ['about.txt', 'contact.txt', 'skills.txt', 'languages.txt', 'talks.txt'];

  const prefersReduced = () =>
    typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  onMount(() => {
    boot();
  });

  // ── Boot sequence (BIOS/POST), once per browser session ──────────────────
  async function boot() {
    let seen = false;
    try {
      seen = !!sessionStorage.getItem(BOOT_KEY);
    } catch {
      /* sessionStorage blocked */
    }

    if (seen || prefersReduced()) {
      showWelcome();
      await tick();
      inputElement?.focus();
      return;
    }

    booting = true;
    const bootLines = [
      'StefanoOS BIOS v2.0.0  —  Power-On Self Test',
      'CPU: Synapse Core @ 4.2GHz    Memory: 65536K OK',
      'Detecting storage ........  /dev/sda  STEFANO-SSD  OK',
      'Detecting input ..........  keyboard  OK',
      'Initializing résumé subsystem ...',
      '[  OK  ] Mounted /home/stefano',
      '[  OK  ] Loaded cv-data.ts (single source of truth)',
      '[  OK  ] Started interactive shell'
    ];
    for (const line of bootLines) {
      pushLine(line);
      await delay(150);
      scrollToBottom();
    }

    // ASCII loading bar
    const barIdx = history.length;
    history = [...history, { type: 'output', text: '' }];
    const total = 24;
    for (let i = 0; i <= total; i++) {
      const bar = '█'.repeat(i) + '░'.repeat(total - i);
      history[barIdx] = { type: 'output', text: `Loading StefanoOS  [${bar}] ${Math.round((i / total) * 100)}%` };
      history = [...history];
      await delay(42);
      scrollToBottom();
    }

    await delay(380);
    history = [];
    try {
      sessionStorage.setItem(BOOT_KEY, '1');
    } catch {
      /* ignore */
    }
    booting = false;
    showWelcome();
    await tick();
    inputElement?.focus();
  }

  function showWelcome() {
    pushLine('STEFANO OS v2.0.0 (tty1)');
    pushLine('Type "help" to see available commands or click the quick actions below.');
  }

  // ── Instant vs. typed output ──────────────────────────────────────────────
  function pushLine(text: string, type: HistoryEntry['type'] = 'output') {
    history = [...history, { type, text }];
  }

  let queue: string[] = [];
  let running = false;
  let skipTyping = false;

  function addOutput(text: string) {
    queue.push(text);
    runQueue();
  }

  async function runQueue() {
    if (running) return;
    running = true;
    isTyping = true;
    const reduce = prefersReduced();

    while (queue.length) {
      const line = queue.shift() as string;
      const idx = history.length;
      history = [...history, { type: 'output', text: '' }];

      if (reduce || skipTyping || line.length > 160 || line.includes('\n')) {
        // Reduced-motion, skipped, long output or ASCII art → print at once
        history[idx] = { type: 'output', text: line };
        history = [...history];
      } else {
        for (let i = 1; i <= line.length; i++) {
          if (skipTyping) {
            history[idx] = { type: 'output', text: line };
            history = [...history];
            break;
          }
          history[idx] = { type: 'output', text: line.slice(0, i) };
          history = [...history];
          await delay(CHAR_MS);
          scrollToBottom();
        }
      }
      scrollToBottom();
    }

    running = false;
    isTyping = false;
    skipTyping = false;
  }

  async function handleCommand(e: KeyboardEvent) {
    if (booting) {
      e.preventDefault?.();
      return;
    }

    // Any key while output is being typed → skip to the full result
    if (isTyping) {
      skipTyping = true;
      e.preventDefault?.();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      autocomplete();
      return;
    }

    if (e.key === 'Enter') {
      const cmd = commandInput.trim();
      if (cmd) commandHistory = [...commandHistory, cmd];
      historyIndex = -1;
      commandInput = '';

      pushLine(`${promptStr} ${cmd}`, 'command');
      processCommand(cmd);

      await tick();
      scrollToBottom();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      historyIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      commandInput = commandHistory[historyIndex];
      await tick();
      inputElement.setSelectionRange(commandInput.length, commandInput.length);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      if (historyIndex >= commandHistory.length - 1) {
        historyIndex = -1;
        commandInput = '';
      } else {
        historyIndex += 1;
        commandInput = commandHistory[historyIndex];
      }
    }
  }

  // ── Tab autocomplete (commands + file/argument names) ─────────────────────
  function commonPrefix(arr: string[]): string {
    let p = arr[0];
    for (const s of arr) {
      while (!s.startsWith(p)) p = p.slice(0, -1);
    }
    return p;
  }

  async function applyCompletion(parts: string[], isFirst: boolean, completion: string, addSpace: boolean) {
    if (isFirst) {
      commandInput = completion + (addSpace ? ' ' : '');
    } else {
      parts[parts.length - 1] = completion;
      commandInput = parts.join(' ') + (addSpace ? ' ' : '');
    }
    await tick();
    inputElement?.setSelectionRange(commandInput.length, commandInput.length);
  }

  function autocomplete() {
    const value = commandInput;
    if (!value.trim()) return;
    const parts = value.split(' ');
    const isFirst = parts.length === 1;

    let pool: string[];
    let token: string;
    if (isFirst) {
      pool = COMMANDS;
      token = parts[0].toLowerCase();
    } else {
      const cmd = parts[0].toLowerCase();
      token = parts[parts.length - 1];
      if (cmd === 'cat') pool = FILES;
      else if (cmd === 'show') pool = ['exp', 'early'];
      else if (cmd === 'ls') pool = ['esperienze'];
      else return;
    }

    const matches = pool.filter((x) => x.startsWith(token));
    if (matches.length === 0) return;

    if (matches.length === 1) {
      applyCompletion(parts, isFirst, matches[0], true);
    } else {
      const common = commonPrefix(matches);
      if (common.length > token.length) {
        applyCompletion(parts, isFirst, common, false);
      } else {
        // Second Tab with no further progress → list the options (like a real shell)
        pushLine(`${promptStr} ${commandInput}`, 'command');
        pushLine(matches.join('    '));
        scrollToBottom();
      }
    }
  }

  function processCommand(cmd: string) {
    const args = cmd.split(' ').filter(Boolean);
    const command = args[0]?.toLowerCase();

    if (!command) return;

    switch (command) {
      case 'help':
      case 'man':
        addOutput('Available commands:');
        addOutput('  help                Show this message');
        addOutput('  cat about.txt       Read about me');
        addOutput('  cat contact.txt     View contact info');
        addOutput('  cat skills.txt      List my skills by category');
        addOutput('  cat languages.txt   View language proficiency');
        addOutput('  cat talks.txt       Conferences & seminars attended');
        addOutput('  ls esperienze       List work experiences');
        addOutput('  show exp <id>       Read specific experience (e.g., show exp 0)');
        addOutput('  show early          Read my early career (2011-2015)');
        addOutput('  neofetch            System & user info');
        addOutput('  download | cv       Download my CV as a PDF');
        addOutput('  clear               Clear terminal');
        break;

      case 'cv':
      case 'download':
        addOutput('Fetching résumé… stefano-tedeschi-cv.pdf');
        addOutput('Download started. Check your browser downloads.');
        downloadCV();
        break;

      case 'clear':
        history = [];
        break;

      case 'sudo':
        addOutput('stefano is not in the sudoers file. This incident will be reported.');
        break;

      case 'matrix':
        matrixMode = !matrixMode;
        if (matrixMode) {
          addOutput('Entering the matrix...');
        } else {
          addOutput('Exiting the matrix...');
        }
        break;

      case 'neofetch':
      case 'cvfetch':
        addOutput(`
      .::::.         stefano@resume
    .::::::::.       --------------
   ::::::::::::      OS: StefanoOS 2.0.0
  ::::::::::::::     Role: ${cvData.role}
 ::::::::::::::::    Location: ${cvData.contact.location}
 ::::::::::::::::    Top Skills: ${cvData.skills.slice(0, 3).join(', ')}
 ::::::::::::::::    
  ::::::::::::::     
   ::::::::::::      
    '::::::::'       
      '::::'         
        `);
        break;

      case 'ls':
        if (args[1] === 'esperienze' || args[1] === 'esperienze/') {
          cvData.experience.forEach((exp, idx) => {
            addOutput(`drwxr-xr-x 2 stefano admin 4096 May 28 10:00 exp_${idx} (${exp.company})`);
          });
          addOutput('\nType "show exp <id>" to read details.');
        } else {
          addOutput('about.txt   contact.txt   skills.txt   languages.txt   talks.txt   esperienze/');
        }
        break;

      case 'show':
        if (args[1] === 'early') {
          const ec = cvData.earlyCareer;
          addOutput(`=============================================`);
          addOutput(`${ec.title}`);
          addOutput(`Period:       ${ec.period}`);
          addOutput(`Technologies: ${ec.technologies.join(', ')}`);
          addOutput(`---------------------------------------------`);
          addOutput(`${ec.description}`);
          ec.highlights.forEach((hl) => addOutput(`  * ${hl}`));
          addOutput(`=============================================`);
        } else if (args[1] === 'exp' && args[2] !== undefined) {
          const idx = parseInt(args[2]);
          if (!isNaN(idx) && cvData.experience[idx]) {
            const exp = cvData.experience[idx];
            addOutput(`=============================================`);
            addOutput(`Title:        ${exp.title}`);
            addOutput(`Company:      ${exp.company}`);
            addOutput(`Period:       ${exp.period}`);
            addOutput(`Location:     ${exp.location}`);
            if (exp.sector) addOutput(`Sector:       ${exp.sector}`);
            addOutput(`Technologies: ${exp.technologies.join(', ')}`);
            addOutput(`---------------------------------------------`);
            addOutput(`${exp.description}`);
            exp.highlights.forEach((hl) => addOutput(`  * ${hl}`));
            addOutput(`=============================================`);
          } else {
            addOutput(`show: experience ${args[2]} not found`);
          }
        } else {
          addOutput(`Usage: show exp <id>  |  show early`);
        }
        break;

      case 'cat':
        if (args[1] === 'about.txt') {
          addOutput(`Name: ${cvData.name}`);
          addOutput(`Role: ${cvData.role}`);
          addOutput(`\n// ${cvData.tagline}`);
          addOutput(`\n${cvData.summary}`);
        } else if (args[1] === 'contact.txt') {
          addOutput(`Email:    ${cvData.contact.email}`);
          addOutput(`LinkedIn: ${cvData.contact.linkedin}`);
          addOutput(`Website:  ${cvData.contact.website}`);
          addOutput(`Phone:    ${cvData.contact.phone}`);
        } else if (args[1] === 'skills.txt') {
          cvData.skillGroups.forEach((group) => {
            addOutput(`[${group.label}]\n  ${group.items.join(', ')}`);
          });
        } else if (args[1] === 'languages.txt') {
          cvData.languages.forEach((lang) => {
            addOutput(`${lang.name.padEnd(10)} ${lang.level}${lang.note ? ` (${lang.note})` : ''}`);
          });
        } else if (args[1] === 'talks.txt') {
          cvData.conferences.forEach((conf) => {
            addOutput(`  - ${conf.name} — ${conf.location} (${conf.year})`);
          });
        } else {
          addOutput(`cat: ${args[1]}: No such file or directory`);
        }
        break;

      default:
        addOutput(`bash: ${command}: command not found. Type 'help' for options.`);
    }
  }

  function downloadCV() {
    const link = document.createElement('a');
    link.href = '/cv-stefano-tedeschi.pdf';
    link.download = 'Stefano_Tedeschi_CV.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function scrollToBottom() {
    if (containerElement) {
      containerElement.scrollTop = containerElement.scrollHeight;
    }
  }

  function runSuggested(cmd: string) {
    commandInput = cmd;
    inputElement.focus();
    handleCommand({ key: 'Enter' } as KeyboardEvent);
  }
</script>

<div class="terminal-wrapper" class:matrix-bg={matrixMode}>
  <div class="scanlines"></div>
  <div class="terminal-content" bind:this={containerElement} onclick={() => inputElement.focus()}>
    {#each history as entry}
      <div class="entry {entry.type}">
        <pre>{entry.text}</pre>
      </div>
    {/each}

    {#if !booting}
      <div class="input-line">
        <span class="prompt">{promptStr}</span>
        <div class="input-field">
          <span class="typed">{commandInput}</span><span
            class="block-cursor"
            class:idle={!inputFocused}
          ></span>
          <input
            type="text"
            class="real-input"
            bind:this={inputElement}
            bind:value={commandInput}
            onkeydown={handleCommand}
            onfocus={() => (inputFocused = true)}
            onblur={() => (inputFocused = false)}
            autocomplete="off"
            spellcheck="false"
            aria-label="Terminal command input"
          />
        </div>
      </div>
    {/if}
  </div>

  {#if !booting}
  <div class="suggestions">
    <button onclick={() => runSuggested('cat about.txt')}>[ about ]</button>
    <button onclick={() => runSuggested('cat skills.txt')}>[ skills ]</button>
    <button onclick={() => runSuggested('cat languages.txt')}>[ languages ]</button>
    <button onclick={() => runSuggested('cat contact.txt')}>[ contacts ]</button>
    <button onclick={() => runSuggested('ls esperienze')}>[ list exp ]</button>
    <button onclick={() => runSuggested('show exp 0')}>[ latest exp ]</button>
    <button onclick={() => runSuggested('show early')}>[ early ]</button>
    <button onclick={() => runSuggested('cat certs.txt')}>[ certs ]</button>
    <button onclick={() => runSuggested('cat talks.txt')}>[ talks ]</button>
    <button onclick={() => runSuggested('neofetch')}>[ neofetch ]</button>
    <button onclick={() => runSuggested('download')}>[ download cv ]</button>
    <button onclick={() => runSuggested('clear')}>[ clear ]</button>
  </div>
  {/if}
</div>

<style>
  .terminal-wrapper {
    width: 100%;
    height: 100vh;
    height: 100dvh;
    background-color: #050505;
    background-image:
      radial-gradient(rgba(51, 255, 102, 0.07) 1px, transparent 1.4px),
      linear-gradient(rgba(51, 255, 102, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(51, 255, 102, 0.04) 1px, transparent 1px),
      radial-gradient(circle at 50% 0%, rgba(51, 255, 102, 0.06), transparent 70%);
    background-size: 24px 24px, 24px 24px, 24px 24px, 100% 100%;
    color: #33ff66;
    font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
    font-size: 15px;
    line-height: 1.5;
    letter-spacing: 0.2px;
    padding: 24px;
    padding-bottom: 92px; /* reserve room for the fixed timeline bar below */
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    /* Column layout: the scrolling output and the suggestion buttons are
       separate rows, so the text can never overlap the buttons (which used to
       float over it and wrap into the text on mobile / Galaxy Fold). */
    display: flex;
    flex-direction: column;
    text-shadow: 0 0 6px rgba(51, 255, 102, 0.55);
  }

  .matrix-bg {
    background-image: linear-gradient(rgba(0, 255, 0, 0.16) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 0, 0.16) 1px, transparent 1px);
    background-size: 20px 20px;
    animation: matrixScroll 20s linear infinite;
  }

  @keyframes matrixScroll {
    0% { background-position: 0 0; }
    100% { background-position: 0 100vh; }
  }

  .scanlines {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2));
    background-size: 100% 4px;
    pointer-events: none;
    z-index: 10;
  }

  .terminal-content {
    width: 100%;
    flex: 1 1 auto;
    min-height: 0; /* allow the flex child to shrink so it scrolls instead of pushing the buttons off-screen */
    overflow-y: auto;
    position: relative;
    z-index: 2;
  }

  .terminal-content::-webkit-scrollbar {
    display: none;
  }
  .terminal-content {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .entry pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
    line-height: 1.4;
    font-family: inherit;
  }

  .entry.command pre {
    color: #33ff66;
  }

  .entry.output pre {
    color: #9db8ff;
    margin-bottom: 10px;
  }

  .input-line {
    display: flex;
    margin-top: 10px;
  }

  .prompt {
    margin-right: 10px;
    white-space: nowrap;
  }

  /* Input area: a visible "mirror" of the typed text + a fake block cursor,
     with the real input overlaid transparently to capture typing & focus.
     This recreates an authentic blinking block cursor instead of the native caret. */
  .input-field {
    position: relative;
    flex-grow: 1;
    display: inline-flex;
    align-items: center;
    min-width: 0;
  }

  .typed {
    white-space: pre;
    color: #33ff66;
  }

  .block-cursor {
    display: inline-block;
    width: 0.6em;
    height: 1.05em;
    background: #33ff66;
    box-shadow: 0 0 6px rgba(51, 255, 102, 0.7);
    margin-left: 1px;
    animation: cursor-blink 1.06s steps(1, end) infinite;
  }
  /* Hollow cursor when the terminal isn't focused (like a real terminal) */
  .block-cursor.idle {
    background: transparent;
    box-shadow: none;
    border: 1px solid #33ff66;
    animation: none;
  }

  @keyframes cursor-blink {
    0%, 50% { opacity: 1; }
    50.01%, 100% { opacity: 0; }
  }

  .real-input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    color: transparent;
    caret-color: transparent;
    font-family: inherit;
    font-size: inherit;
    outline: none;
    padding: 0;
    margin: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .block-cursor { animation: none; opacity: 1; }
  }

  .suggestions {
    position: static;
    flex: 0 0 auto;
    margin-top: 12px;
    display: flex;
    gap: 8px;
    z-index: 20;
    flex-wrap: wrap;
  }

  .suggestions button {
    background: rgba(51, 255, 102, 0.08);
    border: 1px solid rgba(51, 255, 102, 0.6);
    color: #33ff66;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    padding: 7px 14px;
    cursor: pointer;
    font-size: 0.82rem;
    font-weight: 500;
    letter-spacing: 0.3px;
    transition: all 0.2s;
  }

  .suggestions button:hover {
    background: #33ff66;
    color: #000;
    box-shadow: 0 0 12px rgba(51, 255, 102, 0.6);
  }
</style>
