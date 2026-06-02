<template>
  <div class="theme-switcher">
    <label for="theme-select">Seleziona Stile:</label>
    <select id="theme-select" v-model="currentTheme" @change="changeTheme">
      <option value="theme-modern">Modern (Glassmorphism)</option>
      <option value="theme-winxp">Windows XP</option>
      <option value="theme-terminal">Terminal / Hacker</option>
      <option value="theme-web20">Web 2.0 (Bootstrap style)</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const currentTheme = ref('theme-modern')

const changeTheme = () => {
  if (import.meta.client) {
    document.documentElement.className = currentTheme.value
    localStorage.setItem('cv-theme', currentTheme.value)
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('cv-theme')
  if (savedTheme) {
    currentTheme.value = savedTheme
  }
  changeTheme()
})
</script>

<style scoped>
.theme-switcher {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: sans-serif;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}

.theme-switcher select {
  background: white;
  color: black;
  border: none;
  padding: 0.25rem;
  border-radius: 4px;
  cursor: pointer;
}
</style>
