import {defineConfig} from 'astro/config';import vue from '@astrojs/vue';
const noExternal=['@kai17-a/kav-ui-astro','@kai17-a/kav-ui-vue','@kai17-a/kav-ui-core','@astrojs/vue'];
export default defineConfig({integrations:[vue()],vite:{environments:{ssr:{resolve:{noExternal}},prerender:{resolve:{noExternal}}}}});
