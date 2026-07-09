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
  import { cvData as cvDataIt } from '$lib/cv-data';
  import { cvDataEn, ui } from '$lib/translations';
  import { lang } from '$lib/i18n';

  const cvData = $derived($lang === 'en' ? cvDataEn : cvDataIt);
  const t = $derived(ui[$lang].shared);
  const years = new Date().getFullYear() - cvDataIt.keyFigures.startYear;
</script>

<article class="seo-cv">
  <header>
    <h1>{cvData.name} — {cvData.role}</h1>
    <p>{t.seoIntro(cvData.name, cvData.role, years)}</p>
    <p>{cvData.tagline}</p>
  </header>

  <section aria-label={t.sections.profile}>
    <h2>{t.sections.profile}</h2>
    <p>{cvData.summary}</p>
  </section>

  <section aria-label={t.sections.experience}>
    <h2>{t.sections.experience}</h2>
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
        <p>{t.technologies}: {exp.technologies.join(', ')}</p>
      </article>
    {/each}

    <article>
      <h3>{cvData.earlyCareer.title}</h3>
      <p><time>{cvData.earlyCareer.period}</time></p>
      <p>{cvData.earlyCareer.description}</p>
      <ul>
        {#each cvData.earlyCareer.highlights as hl}<li>{hl}</li>{/each}
      </ul>
      <p>{t.technologies}: {cvData.earlyCareer.technologies.join(', ')}</p>
    </article>
  </section>

  <section aria-label={t.sections.skills}>
    <h2>{t.sections.skills}</h2>
    {#each cvData.skillGroups as group}
      <h3>{group.label}</h3>
      <ul>
        {#each group.items as item}<li>{item}</li>{/each}
      </ul>
    {/each}
  </section>

  <section aria-label={t.sections.languages}>
    <h2>{t.sections.languages}</h2>
    <ul>
      {#each cvData.languages as spoken}
        <li>{spoken.name}: {spoken.level}{#if spoken.note} ({spoken.note}){/if}</li>
      {/each}
    </ul>
  </section>

  <section aria-label={t.sections.education}>
    <h2>{t.sections.education}</h2>
    <ul>
      {#each cvData.education as edu}
        <li>{edu.title} — {edu.institute}, {edu.location} (<time>{edu.period}</time>)</li>
      {/each}
    </ul>
  </section>

  <section aria-label={t.sections.conferences}>
    <h2>{t.sections.conferences}</h2>
    <ul>
      {#each cvData.conferences as conf}
        <li>{conf.name} — {conf.location} (<time>{conf.year}</time>)</li>
      {/each}
    </ul>
  </section>

  <section aria-label={t.sections.contacts}>
    <h2>{t.sections.contacts}</h2>
    <ul>
      <li><a rel="me" href={`mailto:${cvData.contact.email}`}>{cvData.contact.email}</a></li>
      <li><a rel="me" href={cvData.contact.linkedin}>LinkedIn</a></li>
      <li><a href={`tel:${cvData.contact.phone.replace(/\s+/g, '')}`}>{cvData.contact.phone}</a></li>
      <li>{cvData.contact.location}</li>
    </ul>
  </section>
</article>
