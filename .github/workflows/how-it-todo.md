# GitHub Pages — это бесплатный и идеальный способ захостить твой UI-кит, чтобы любой мог зайти и посмотреть его вживую.

В Astro для этого есть официальная интеграция. Делаем в 3 простых шага:

## Шаг 1: Настраиваем astro.config.mjs
По умолчанию Astro думает, что твой сайт лежит в корне домена (yoursite.com). Но GitHub Pages для репозиториев дает ссылку формата твой-логин.github.io/astro-ui-kit/. Нам нужно сказать Астре про этот путь (base).

Открой свой файл astro.config.mjs (или .ts / .mts) в корне проекта и добавь туда site и base:

```javascript
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Замени ТВОЙ_ЛОГИН на свой ник на Гитхабе
  site: 'https://ТВОЙ_ЛОГИН.github.io',
  // Название репозитория со слешами по краям
  base: '/astro-ui-kit/',
});
```

## Шаг 2: Создаем файл для автодеплоя
Нам нужно сказать Гитхабу, чтобы он сам собирал билд при каждом пуше. Для этого создаем в корне проекта папку .github, в ней папку workflows, а в ней файл deploy.yml.

Путь должен быть строго такой: .github/workflows/deploy.yml.

Вставь в этот файл следующий код (это официальный рабочий шаблон от разработчиков Astro):

```yaml

name: Deploy to GitHub Pages

on:
  # Запускается при пуше в ветку main
  push:
    branches: [ main ]
  # Позволяет запустить деплой вручную из вкладки Actions
  workflow_dispatch:

# Даем права GitHub Pages записывать данные
permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Install dependencies
        run: npm ci
      - name: Build with Astro
        run: npx astro build
        env:
          # Передаем переменные окружения в Astro
          SITE: ${{ vars.SITE }}
          BASE: ${{ vars.BASE }}
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## Шаг 3: Включаем Pages в настройках Гитхаба
Залей эти изменения на Гитхаб (git add ., git commit -m "Added GitHub Pages deploy", git push).
Зайди на страницу своего репозитория на GitHub.
Нажми вкладку Settings (Настройки) -> слева в меню выбери Pages.
В разделе Build and deployment -> Source выбери GitHub Actions (а не Deploy from a branch).
Всё

Теперь Гитхаб сам развернет тебе виртуальную машину, установит зависимости, соберет билд и положит его в GitHub Pages. Это займет около 1-2 минут.