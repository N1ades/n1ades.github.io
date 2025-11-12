<script setup lang="ts">
import { computed } from 'vue'

interface ProjectCardProps {
  id?: string
  title: string
  titleHtml?: string
  subtitle?: string
  description?: string
  descriptionHtml?: string
  ctaLabel?: string
  href?: string
  statusLabel?: string
  accentColor?: string
  screenshot?: string
  screenshotAlt?: string
}

const props = defineProps<ProjectCardProps>()

const accentStyle = computed(() => {
  if (!props.accentColor) {
    return undefined
  }

  return {
    '--card-accent': props.accentColor
  }
})
</script>

<template>
  <component 
    :is="props.href ? 'a' : 'div'"
    :href="props.href" 
    :target="props.href ? '_blank' : undefined"
    :rel="props.href ? 'noopener noreferrer' : undefined"
    class="card" 
    :style="accentStyle"
  >
    <div class="card__inner">
      <div class="card__body">
        <p v-if="props.subtitle" class="card__subtitle">{{ props.subtitle }}</p>
        <h3 v-if="props.titleHtml" class="card__title" v-html="props.titleHtml"></h3>
        <h3 v-else class="card__title">{{ props.title }}</h3>
        <p v-if="props.descriptionHtml" class="card__description" v-html="props.descriptionHtml"></p>
        <p v-else-if="props.description" class="card__description">{{ props.description }}</p>
        <footer class="card__footer">
          <span v-if="props.statusLabel" class="card__status">{{ props.statusLabel }}</span>
        </footer>
      </div>
      <div class="card__frame" :data-empty="!props.screenshot">
        <img
          v-if="props.screenshot"
          :src="props.screenshot"
          :alt="props.screenshotAlt || props.title"
          loading="lazy"
        />
        <span v-else class="card__placeholder">Preview coming soon</span>
      </div>
    </div>
    <div class="card__glow-1"></div>
    <div class="card__glow-2"></div>
    <div class="card__background-glow"></div>
  </component>
</template>

<style scoped>
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 18rem;
  --card-accent: var(--tone-accent);
  padding: 2px;
  border-radius: 1.5rem;
  background: linear-gradient(
      -30deg,
      rgba(255, 255, 255, 0.4),
      transparent,
      rgba(255, 255, 255, 0.4)
    ),
    linear-gradient(to bottom, #000000, #000000);
  text-decoration: none;
  color: inherit;
}

.card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 1.5rem;
  padding: 2px;
  background: linear-gradient(
    -30deg,
    rgba(255, 255, 255, 0.5),
    transparent,
    rgba(255, 255, 255, 0.5)
  );
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 1.5rem;
  border: 2px solid #ffffff;
  margin-top: -4px;
  margin-left: -4px;
  filter: url(#turbulence-filter);
  pointer-events: none;
}

.card:hover {
  transform: translateY(-6px);
}

.card__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  background: #000000;
  border-radius: 1.5rem;
  padding: 1.75rem;
  height: 100%;
}

/* .card__glow-1 {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-radius: 1.5rem;
  filter: blur(1px);
  pointer-events: none;
}

.card__glow-2 {
  position: absolute;
  inset: 0;
  border: 2px solid #ffffff;
  border-radius: 1.5rem;
  filter: blur(4px);
  pointer-events: none;
} */
/* 
.card__background-glow {
  position: absolute;
  inset: 0;
  border-radius: 1.5rem;
  filter: blur(32px);
  transform: scale(1.1);
  opacity: 0.3;
  z-index: -1;
  background: linear-gradient(
    -30deg,
    #ffffff,
    transparent,
    #ffffff
  );
  pointer-events: none;
} */

.card__body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  margin-bottom: 0.5rem;
}

.card__frame {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1.125rem;
  overflow: hidden;
  min-height: 9rem;
  background: rgba(255, 255, 255, 0.02);
}

.card__frame[data-empty='true'] {
  background: rgba(255, 255, 255, 0.02);
}

.card__frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card__placeholder {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}

.card__subtitle {
  margin: 0;
  font-size: 0.85rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--tone-secondary);
}

.card__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.5rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #ffffff;
}

.card__title :deep(.noise-text) {
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" /><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope="10" intercept="-2"/><feFuncG type="linear" slope="10" intercept="-2"/><feFuncB type="linear" slope="10" intercept="-2"/></feComponentTransfer></filter><rect width="200" height="200" filter="url(%23noise)" opacity="1"/></svg>');
  background-size: 200px 200px;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: noise 0.15s steps(6) infinite;
}

@keyframes noise {
  0% { background-position: 0 0; }
  10% { background-position: -5% -10%; }
  20% { background-position: -15% 5%; }
  30% { background-position: 7% -25%; }
  40% { background-position: 20% 25%; }
  50% { background-position: -25% 10%; }
  60% { background-position: 15% 5%; }
  70% { background-position: 0 15%; }
  80% { background-position: 25% 35%; }
  90% { background-position: -10% 10%; }
  100% { background-position: 0 0; }
}

.card__description {
  margin: 0;
  color: var(--tone-tertiary);
  font-size: 1.2rem;
  line-height: 1.6;
}

.card__description :deep(.head-word) {
  position: relative;
  color: #FF7979;
  text-decoration: underline;
  text-decoration-color: #FF7979;
  cursor: pointer;
}

.card__description :deep(.head-word::after) {
  content: '';
  position: absolute;
  top: 100%;
  left: -100px;
  margin-top: 5px;
  width: 350px;
  height: 350px;
  background-image: var(--head-image);
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center top;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 10;
}

.card__description :deep(.head-word:hover::after) {
  opacity: 1;
}

.card__footer {
  margin-top: auto;
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.95rem;
}

.card__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 1.4rem;
  border-radius: 999px;
  background: var(--card-accent);
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  transition: opacity 160ms ease;
}

.card__cta:hover {
  opacity: 0.85;
}

.card__status {
  color: var(--tone-secondary);
}
</style>
