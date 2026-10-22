import {defineConfig} from 'astro/config';import vue from '@astrojs/vue';
const noExternal=['@kav-ui/astro','@kav-ui/vue','@kav-ui/core','@astrojs/vue'];
export default defineConfig({integrations:[vue()],vite:{environments:{ssr:{resolve:{noExternal}},prerender:{resolve:{noExternal}}}}});
