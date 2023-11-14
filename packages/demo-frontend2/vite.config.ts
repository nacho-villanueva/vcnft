import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import path from "path"

import fs from "fs"

export default defineConfig({
  cacheDir: '../../node_modules/.vite/demo-frontend2',

  server: {
    port: 4200,
    host: 'localhost',
//    https: {
//	key: fs.readFileSync("./ssl/key.pem"),
//	cert: fs.readFileSync("./ssl/cert.pem"),
//	}
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [react(), nxViteTsPaths()],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  resolve: {
    alias: {
      "@": path.resolve("packages/demo-frontend2/src"),
    },
  },

  test: {
    globals: true,
    cache: { dir: '../../node_modules/.vitest' },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
