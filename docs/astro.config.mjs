// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'VibeDepot',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/thehorse2000/vibedepot' }],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', slug: 'getting-started/introduction' },
						{ label: 'Installation', slug: 'getting-started/installation' },
						{ label: 'Quick Start: Users', slug: 'getting-started/quick-start-user' },
						{ label: 'Quick Start: Developers', slug: 'getting-started/quick-start-developer' },
					],
				},
				{
					label: 'Guides',
					items: [
						{ label: 'Building Your First App', slug: 'guides/building-your-first-app' },
						{ label: 'Using AI Providers', slug: 'guides/using-ai-providers' },
						{ label: 'Working with Storage', slug: 'guides/storage' },
						{ label: 'Sideloading Apps', slug: 'guides/sideloading' },
						{ label: 'Publishing to the Registry', slug: 'guides/publishing' },
						{ label: 'Using the CLI', slug: 'guides/using-the-cli' },
						{ label: 'Configuring Permissions', slug: 'guides/permissions' },
						{ label: 'Handling Errors', slug: 'guides/error-handling' },
					],
				},
				{
					label: 'Concepts',
					items: [
						{ label: 'Architecture', slug: 'concepts/architecture' },
						{ label: 'Security Model', slug: 'concepts/security-model' },
						{ label: 'Permission System', slug: 'concepts/permission-system' },
						{ label: 'App Lifecycle', slug: 'concepts/app-lifecycle' },
						{ label: 'Bridge API Design', slug: 'concepts/bridge-api-overview' },
						{ label: 'The App Registry', slug: 'concepts/registry' },
					],
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
			],
		}),
	],
});
