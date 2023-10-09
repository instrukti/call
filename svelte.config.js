import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: [vitePreprocess({})],
  vitePlugin: {
    inspector: {
      toggleKeyCombo: "meta-shift",
      holdMode: true,
      showToggleButton: "always",
      toggleButtonPos: "bottom-right",
    },
  },
};
