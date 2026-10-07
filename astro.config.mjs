import { defineConfig } from "astro/config";
import alpinejs from "@astrojs/alpinejs";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
    site: "https://ecomsys.github.io",
    // Название репозитория со слешами по краям
    base: import.meta.env.PROD ? "/astro-ui-kit/" : "/",
    integrations: [alpinejs({ entrypoint: "/src/entrypoint-alpine" })],
    vite: {
        plugins: [tailwindcss()],
        resolve: {
            alias: {
                // Говорим Астре, что знак @ — это папка src
                "@": fileURLToPath(new URL("./src", import.meta.url)),
            },
        },
    },
    server: {
        open: true,
    },
    compressHTML: false,
});
