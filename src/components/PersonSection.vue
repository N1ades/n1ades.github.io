<script setup lang="ts">
interface PersonSectionProps {
  label?: string
  title: string
  subtitle: string
  meta: string[]
}

const props = defineProps<PersonSectionProps>()
</script>

<template>
  <header class="person">
  <p v-if="props.label" class="person__eyebrow">{{ props.label }}</p>
    <h1 class="person__title">{{ props.title }}</h1>
    <ul class="person__meta">
      <li v-for="(item, index) in props.meta" :key="item" class="person__meta-item">
        <span>{{ item }}</span>
        <span v-if="index < props.meta.length - 1" aria-hidden="true" class="person__meta-separator">•</span>
      </li>
    </ul>
  </header>
</template>

<style scoped>
.person {
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
  align-items: center;
  text-align: center;
  padding: 2rem 0 3rem;
}

.person__eyebrow {
  font-size: 0.9rem;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: var(--tone-secondary);
  margin: 0;
}

.person__title {
  margin: 0;
  font-family: 'Nemesis', var(--font-display);
  font-size: clamp(1.8rem, 4.5vw, 3.2rem);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--tone-primary);
}

.person__subtitle {
  margin: 0;
  font-size: clamp(1.1rem, 2.2vw, 1.5rem);
  color: var(--tone-tertiary);
}

.person__meta {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
  font-size: 1.1rem;
  color: var(--tone-secondary);
}

.person__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.person__meta-separator {
  opacity: 0.5;
}
</style>
