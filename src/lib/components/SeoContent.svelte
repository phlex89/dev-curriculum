<script lang="ts">
  /*
   * Canonical, prerender/SSR-safe semantic CV.
   *
   * The eras render entirely client-side inside `onMount` (behind the
   * `booted` gate in +page.svelte), so a crawler that doesn't run JS receives an
   * essentially empty <main>. This component mirrors the SAME data (single source
   * of truth: cv-data.ts) as real, indexable HTML that ships in the prerendered
   * markup — full heading hierarchy, landmarks, contact rel="me" links.
   *
   * It is visually hidden (.sr-only) in +page.svelte: present in the DOM/HTML for
   * search engines and screen readers, invisible on screen so the era overlay is
   * unaffected. Not cloaking — it is a faithful copy of what every era shows.
   */
  import { cvData } from '$lib/cv-data';

  const years = new Date().getFullYear() - cvData.keyFigures.startYear;
</script>

<article class="seo-cv">
  <header>
    <h1>{cvData.name} — {cvData.role}</h1>
    <p>
      {cvData.name} è un {cvData.role} basato a Torino, con {years} anni di esperienza in architetture frontend,
      design system e component library per piattaforme enterprise in fintech, IoT, banking e media.
    </p>
    <p>{cvData.tagline}</p>
  </header>

  <section aria-label="Profilo">
    <h2>Profilo</h2>
    <p>{cvData.summary}</p>
  </section>

  <section aria-label="Esperienza professionale">
    <h2>Esperienza professionale</h2>
    {#each cvData.experience as exp}
      <article>
        <h3>{exp.title} — {exp.company}</h3>
        <p>
          <time>{exp.period}</time> · {exp.location}{#if exp.sector} · {exp.sector}{/if}
        </p>
        <p>{exp.description}</p>
        <ul>
          {#each exp.highlights as hl}<li>{hl}</li>{/each}
        </ul>
        <p>Tecnologie: {exp.technologies.join(', ')}</p>
      </article>
    {/each}

    <article>
      <h3>{cvData.earlyCareer.title}</h3>
      <p><time>{cvData.earlyCareer.period}</time></p>
      <p>{cvData.earlyCareer.description}</p>
      <ul>
        {#each cvData.earlyCareer.highlights as hl}<li>{hl}</li>{/each}
      </ul>
      <p>Tecnologie: {cvData.earlyCareer.technologies.join(', ')}</p>
    </article>
  </section>

  <section aria-label="Competenze">
    <h2>Competenze</h2>
    {#each cvData.skillGroups as group}
      <h3>{group.label}</h3>
      <ul>
        {#each group.items as item}<li>{item}</li>{/each}
      </ul>
    {/each}
  </section>

  <section aria-label="Lingue">
    <h2>Lingue</h2>
    <ul>
      {#each cvData.languages as lang}
        <li>{lang.name}: {lang.level}{#if lang.note} ({lang.note}){/if}</li>
      {/each}
    </ul>
  </section>

  <section aria-label="Formazione">
    <h2>Formazione</h2>
    <ul>
      {#each cvData.education as edu}
        <li>{edu.title} — {edu.institute}, {edu.location} (<time>{edu.period}</time>)</li>
      {/each}
    </ul>
  </section>

  <section aria-label="Conferenze">
    <h2>Conferenze</h2>
    <ul>
      {#each cvData.conferences as conf}
        <li>{conf.name} — {conf.location} (<time>{conf.year}</time>)</li>
      {/each}
    </ul>
  </section>

  <section aria-label="Contatti">
    <h2>Contatti</h2>
    <ul>
      <li><a rel="me" href={`mailto:${cvData.contact.email}`}>{cvData.contact.email}</a></li>
      <li><a rel="me" href={cvData.contact.linkedin}>LinkedIn</a></li>
      <li><a href={`tel:${cvData.contact.phone.replace(/\s+/g, '')}`}>{cvData.contact.phone}</a></li>
      <li>{cvData.contact.location}</li>
    </ul>
  </section>
</article>
