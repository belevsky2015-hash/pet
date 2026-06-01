import { defineConfig } from 'astro/config';

// Статическая генерация: Astro собирает чистый HTML/CSS/JS в dist/.
// Cloudflare Pages раздаёт dist/ как статику, а серверную логику (API, админка)
// подхватывает из каталога /functions автоматически — без отдельного адаптера.
export default defineConfig({
  output: 'static',
  site: 'https://chognaridogs.pages.dev',
  build: { format: 'directory' }
});
