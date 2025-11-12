<script setup lang="ts">
import ProjectCard from './ProjectCard.vue'

interface ProjectInfo {
  id: string
  title: string
  subtitle?: string
  description?: string
  ctaLabel?: string
  href?: string
  statusLabel?: string
  accentColor?: string
  screenshot?: string
  screenshotAlt?: string
}

const props = defineProps<{
  projects: ProjectInfo[]
}>()
</script>

<template>
  <section class="projects-grid">
    <ProjectCard v-for="project in props.projects" :key="project.id" v-bind="project" />
  </section>
</template>

<style scoped>
.projects-grid {
  display: grid;
  gap: 5rem;
  width: 100%;
  margin: 3rem auto 0;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

@media (min-width: 1024px) {
  .projects-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
