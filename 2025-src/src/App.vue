<script setup lang="ts">
import PersonSection from './components/PersonSection.vue'
import ProjectsGrid from './components/ProjectsGrid.vue'
import previewCast from './assets/image/preview-cast.png'
import previewCdn from './assets/image/preview-cdn.png'
import previewShare from './assets/image/preview-share.png'
import previewSlowburn from './assets/image/preview-slowburn.png'
import headImage from './assets/image/head.png'

const person = {
	title: 'NYADES DEV',
	subtitle: 'Making world easier',
	meta: ['Rabitsa Staff', 'Full-Stack Web Developer', 'VR World & Avatar Creator']
}

const projects = [
	{
		id: 'vrc-cast',
		title: 'VRC CAST (Web)',
		titleHtml: 'VRC <span style="color: #AC1DFF">CAST</span> (Web)',
		description: 'Stream your screen to VRChat worlds.',
		href: 'https://cast.nyades.dev/',
		accentColor: '#7c5cff',
		screenshot: previewCast,
		screenshotAlt: 'VRC CAST preview'
	},
	{
		id: 'rabitsa-con',
		title: 'RABITSA CDN',
		titleHtml: '<span style="color: #FF00C8">RABITSA</span> CDN',
		description: 'Stream your video to VRChat worlds. Made with love for ours DJ community.',
		href: 'https://cdn.rabitsa.org/',
		accentColor: '#ff2bd4',
		screenshot: previewCdn,
		screenshotAlt: 'RABITSA CDN preview'
	},
	{
		id: 'disk-share',
		title: 'Disk Share (Web)',
		description: 'Realtime file sharing solution ready for squads and events.',
		ctaLabel: 'Share files',
		href: 'https://disk.nyades.dev/',
		accentColor: '#3ef0ff',
		screenshot: previewShare,
		screenshotAlt: 'Disk Share preview'
	},
	{
		id: 'slowburn-world',
		title: 'SLOWBURN World',
		titleHtml: '<span class="noise-text">SLOWBURN World</span>',
		description: 'Enlightened by our RABITSA community head.',
		descriptionHtml: `Enlightened by our RABITSA community <span class="head-word" style="--head-image: url(${headImage})">head</span>.`,
		ctaLabel: 'Enter world',
		href: 'https://vrchat.com/home/world/wrld_3e9afad0-e259-447b-87ff-50bdf5304d4b',
		accentColor: '#ffb03a',
		screenshot: previewSlowburn,
		screenshotAlt: 'SLOWBURN World preview'
	},
	{
		id: 'stay-connected',
		title: 'Stay connected',
		description: 'Contact me to get details and early access to Stay Connected service.',
		href: 'https://t.me/nyades',
		accentColor: '#9c6bff'
	}
]
</script>

<template>
	<svg class="svg-container" style="position: absolute;">
		<defs>
			<filter id="turbulence-filter" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
				<feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise1" seed="1" />
				<feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
					<animate attributeName="dy" values="700; 0" dur="6s" repeatCount="indefinite" calcMode="linear" />
				</feOffset>

				<feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise2" seed="1" />
				<feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
					<animate attributeName="dy" values="0; -700" dur="6s" repeatCount="indefinite" calcMode="linear" />
				</feOffset>

				<feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise1" seed="2" />
				<feOffset in="noise1" dx="0" dy="0" result="offsetNoise3">
					<animate attributeName="dx" values="490; 0" dur="6s" repeatCount="indefinite" calcMode="linear" />
				</feOffset>

				<feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise2" seed="2" />
				<feOffset in="noise2" dx="0" dy="0" result="offsetNoise4">
					<animate attributeName="dx" values="0; -490" dur="6s" repeatCount="indefinite" calcMode="linear" />
				</feOffset>

				<feComposite in="offsetNoise1" in2="offsetNoise2" result="part1" />
				<feComposite in="offsetNoise3" in2="offsetNoise4" result="part2" />
				<feBlend in="part1" in2="part2" mode="color-dodge" result="combinedNoise" />

				<feDisplacementMap in="SourceGraphic" in2="combinedNoise" scale="30" xChannelSelector="R" yChannelSelector="B" />
			</filter>
		</defs>
	</svg>
	<main class="page">
		<div class="page__content">
			<PersonSection v-bind="person" />
			<ProjectsGrid :projects="projects" />
		</div>
	</main>
</template>

<style scoped>
.page {
	min-height: 100vh;
	padding: clamp(3rem, 6vw, 5rem) 1.5rem 6rem;
	display: flex;
	justify-content: center;
}

.page__content {
	width: min(1500px, 100%);
	display: flex;
	flex-direction: column;
}
</style>