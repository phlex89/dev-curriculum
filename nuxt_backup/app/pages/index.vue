<template>
  <div class="container">
    <header class="glass-card">
      <h1>Stefano Tedeschi</h1>
      <p>Senior Frontend Engineer</p>
      <div class="contact-info">
        <span class="pill">Torino, Italy</span>
        <span class="pill">stefano.tedeschi@protechstudio.it</span>
        <span class="pill">+39 3478736835</span>
        <a class="pill" href="https://www.linkedin.com/in/stefano-tedeschi-developer/" target="_blank">LinkedIn</a>
      </div>
    </header>

    <main>
      <section class="glass-card">
        <h2>Work Experience</h2>
        
        <article class="job">
          <h3>Senior Frontend Engineer <span class="date">01/01/2026 - Current</span></h3>
          <p><strong>Tundr Tech Corporation s.r.l.</strong> | Full remote, Italy</p>
          <p>
            Responsabile della riprogettazione e dello sviluppo di applicazioni frontend moderne e scalabili,
            incluse piattaforme core e strumenti di backoffice. Ho contribuito alla definizione
            dell'architettura frontend, alla creazione di componenti riutilizzabili e di un design system
            condiviso, lavorando su applicazioni web complesse e manutenibili. Ho inoltre fornito supporto
            allo sviluppo mobile e collaborato con team cross-funzionali lungo l'intero ciclo di vita del
            prodotto.
          </p>
          <div class="tech-stack">
            <span class="pill">Vue 3</span>
            <span class="pill">TypeScript</span>
            <span class="pill">Pinia</span>
            <span class="pill">Nx Monorepo</span>
            <span class="pill">Vanilla-extract</span>
            <span class="pill">Flutter (BLoC)</span>
          </div>
        </article>

        <article class="job">
          <h3>Senior Front End Developer / Frontend Architect <span class="date">01/12/2017 - 01/01/2022</span></h3>
          <p><strong>SCM.it</strong> | Roma, Italy (Consulente presso Topcon Agriculture)</p>
          <p>Sviluppo piattaforma web IoT. Progettazione architettura front-end, creazione libreria componenti, sviluppo FE E-Commerce, Backoffice e gestione IoT.</p>
          <div class="tech-stack">
            <span class="pill">React</span>
            <span class="pill">Redux Saga</span>
            <span class="pill">GraphQL</span>
            <span class="pill">TypeScript</span>
          </div>
        </article>

        <article class="job">
          <h3>Front End Developer <span class="date">01/09/2017 - 30/11/2017</span></h3>
          <p><strong>IrisCube Reply</strong> | Torino / Milano, Italy</p>
          <p>Realizzazione di un portale pubblico per la gestione delle carte di credito ICBPI/CartaSi</p>
          <div class="tech-stack">
            <span class="pill">React</span>
            <span class="pill">Redux</span>
            <span class="pill">Webpack</span>
            <span class="pill">ES6</span>
          </div>
        </article>
      </section>

      <section class="glass-card">
        <h2>Education & Training</h2>
        <article>
          <h3>Diploma di Perito Informatico <span class="date">17/09/2003 - 01/07/2008</span></h3>
          <p><strong>Istituto Tecnico Tecnologico "Modesto Panetti"</strong> | Bari, Italy</p>
        </article>
      </section>

      <section class="glass-card">
        <h2>Language Skills</h2>
        <p><strong>Italian:</strong> Mother tongue</p>
        <p><strong>English:</strong> Listening C2, Reading C1, Spoken B1, Writing B2</p>
      </section>
    </main>

    <footer class="glass-card" style="text-align: center; font-size: 0.9em; opacity: 0.8;">
      <p>Realizzato come web application multi-tema con Nuxt 3.</p>
    </footer>
  </div>
</template>

<style scoped>
.container {
  padding-top: 4rem;
}
.date {
  float: right;
  font-size: 0.9rem;
  font-weight: normal;
  opacity: 0.8;
}
.job {
  margin-bottom: 2rem;
  border-bottom: 1px dashed rgba(128, 128, 128, 0.3);
  padding-bottom: 1rem;
}
.job:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
.tech-stack {
  margin-top: 1rem;
}
</style>
