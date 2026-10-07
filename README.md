# Astro UI Kit 

Astro UI Kit — это open-source библиотека компонентов интерфейса, вдохновленная shadcn/ui, но созданная специально для экосистемы Astro.

Проект создан для разработчиков, которые хотят строить быстрые, SEO-оптимизированные сайты и веб-приложения, не утяжеляя их мегабайтами JavaScript-рантайма (как это делает React/Vue).

## В чем суть и для чего нужен этот проект?
Вместо того чтобы устанавливать тяжелую npm-библиотеку, вы просто скачиваете этот репозиторий как базовый шаблон для своего проекта.

Внутри уже настроены:

```bash
Astro — для молниеносной рендеринги HTML на сервере (SSG/SSR).
Tailwind CSS v4 — для утилитарной стилизации.
Alpine.js — легковесный фреймворк для интерактивности (вместо React).
Dark Mode — переключение светлой и темной темы из коробки.
Адаптивный Sidebar — навигация, которая превращается в Drawer на мобильных.
Встроенный поиск — мгновенный поиск по компонентам прямо в шапке.
```

## Какие компоненты входят в комплект?
Библиотека покрывает 90% потребностей современного веб-приложения:

Базовые: Button, Card, Badge, Avatar, Skeleton, Progress и др.
Формы: Input, Select, Combobox, Checkbox, Switch, Slider, Date Picker и др.
Навигация: Tabs, Accordion, Breadcrumb, Pagination, Menubar.
Оверлеи: Dialog, Alert Dialog, Sheet, Popover, Tooltip, Toasts (Sonner).
Отображение: Tables, Alerts, Empty states, Charts, Carousels.
Комплексные: Command Palette (Ctrl+K), WYSIWYG Editor.

## Как использовать (Установка)
Этот проект не распространяется через npm. Вы просто берете код из GitHub и делаете его основой своего проекта.

Скачайте репозиторий:Нажмите зеленую кнопку Code -> Download ZIP и распакуйте, либо склонируйте через терминал:
```bash
git clone https://github.com/ecomsys/astro-ui-kit
```
Установите зависимости:
Для работы проекта нужен установленный Node.js.

```bash
npm install
```
Запустите локальный сервер:
```bash
npm run dev
```
Откройте браузер по адресу localhost:4321 — вы увидите рабочий UI Kit!


## Структура проекта
Внутри репозитория вы найдете следующую структуру:

text

```bash
├── src/
│   ├── assets/              
│   │   └── css/                   # тут дизайн система и доп.стили для компонентов
│   ├── components/
│   │   ├── ui/                    # ВСЕ КОМПОНЕНТЫ UI КИТА (Button, Card, Input и т.д.)
│   │   ├── system/                # Системные скрипты (AutoRem, Viewport)
│   │   └── ComponentDoc.astro     # Обвертка для табов(страниц с примерами) 
│   ├── layouts/
│   │   ├── BaseLayout.astro       # Базовый лейаут 
│   │   └── DashboardLayout.astro  # Лейаут с сайдбаром, хедером и поиском
│   ├── lib/                       # для работы компонентов
│   ├── pages/
│   │   ├── index.astro         # Главная страница (каталог компонентов)
│   │   └── ui-kit/             # Страницы с примерами использования каждого компонента
│   ├───entrypoint-alpine.js    # Точка входа для альпины (работа компонентов)
│   └───env.d.ts                # Чтобы линтер не ругался
├── astro.config.mjs   
├── tsconfig.json   
└── package.json
```

## Команды
Все команды запускаются из корня проекта через терминал:

```bash
npm install	         # Установить зависимости
npm run dev	         # Запустить локальный сервер (разработка) на localhost:4321
npm run build        # Собрать готовую статику (продакшен) в папку ./dist/
npm run preview	     # Локально просмотреть собранный продакшен-билд перед деплоем
```

## Поддержка
Если вы нашли баг, хотите предложить новый компонент или у вас есть вопросы по использованию, пишите нам на почту: ecomsysru@gmail.com

## Лицензия
Проект распространяется под лицензией MIT. Используйте его свободно в личных и коммерческих проектах, меняйте код под себя и делайте свои продукты быстрее! 

## --------------------------------------------------------------------------
# Как перенести к себе в проект?
Если у вас уже есть Astro-проект, вы можете просто скопировать нужные компоненты из папки src/components/ui/ и интегрировать их в свой код. Многие компоненты самодостаточны и используют только Tailwind и Alpine.js, но некоторые требуют подключения дополнительных скриптов которые подключаються в entrypoint-alpine.js

Код для подключения всех компонентов в точке доступа, тут :
```js
import type { Alpine } from "alpinejs";
import collapse from "@alpinejs/collapse";
import { initOverlayLocker } from "./lib/overlayLocker";

import tooltip from "./components/ui/tooltip/alpine.tooltip";
import dropdown from "./components/ui/dropdown-menu/alpine.dropdown";
import scrollArea from "./components/ui/scroll-area/alpine.scrollArea";
import hoverCard from "./components/ui/hover-card/alpine.hoverCard";
import popover from "./components/ui/popover/alpine.popover";
import contextMenu from "./components/ui/context-menu/alpine.contextMenu";
import select from "./components/ui/select/alpine.select";
import toaster from "./components/ui/sonner/alpine.toaster";
import slider from "./components/ui/slider/alpine.slider";
import carousel from "./components/ui/carousel/alpine.carousel";
import resizable from "./components/ui/resizable/alpine.resizable";
import navMenu from "./components/ui/navigation-menu/alpine.navMenu";
import sidebar from "./components/ui/sidebar/alpine.sidebar";
import menubar from "./components/ui/menubar/alpine.menubar";
import command from "./components/ui/command/alpine.command";
import inputOTP from "./components/ui/input-otp/alpine.inputOTP";
import calendar from "./components/ui/calendar/alpine.calendar";

import barChart from "./components/ui/chart/alpine.barChart";
import donutChart from "./components/ui/chart/alpine.donutChart";
import lineChart from "./components/ui/chart/alpine.lineChart";

import wysiwygEditor from "./components/ui/wysiwyg-editor/alpine.wysiwyg-editor";

import combobox from "./components/ui/combobox/alpine.combobox";
import drawer from "./components/ui/drawer/alpine.drawer";

export default (Alpine: Alpine) => {

    // Нужен для плавной работы аккордиона и т.д.
    Alpine.plugin(collapse);

    // компоненты
    tooltip(Alpine);
    dropdown(Alpine);
    scrollArea(Alpine);
    hoverCard(Alpine);
    popover(Alpine);
    contextMenu(Alpine);
    select(Alpine);
    toaster(Alpine);
    slider(Alpine);
    carousel(Alpine);
    resizable(Alpine);
    navMenu(Alpine);
    sidebar(Alpine);
    menubar(Alpine);
    command(Alpine);
    inputOTP(Alpine);
    calendar(Alpine);
    combobox(Alpine);
    drawer(Alpine);
    // графики
    barChart(Alpine);
    donutChart(Alpine);
    lineChart(Alpine);
    // редактор
    wysiwygEditor(Alpine);

    // Нужно для корректной работы блокировки скрола при открытии модалок и т.д.
    initOverlayLocker(Alpine);
};
```

Точка входа интегрируеться в astro.config.mjs

```js
import { defineConfig } from "astro/config";
import alpinejs from "@astrojs/alpinejs";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
    integrations: [alpinejs({ entrypoint: "/src/entrypoint-alpine" })],  //Вот интеграция точки входа
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

```
Также переносим себе в проект папки :
```bash
 /assets 
 /lib 
 /system 
 
файл env.d.ts(глобальная типизация модулей)
```
Еще не забываем добавить в хедер скрипт для переключения темы (светлая/темная) и компонеты для AutoRem и Viewport для автомасштабирования на еденицах rem:
```html
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <script is:inline>
            const theme =
                localStorage.getItem("theme") ||
                (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
            if (theme === "dark") document.documentElement.classList.add("dark");
        </script>      
        <!-- Скрытие элементов до загрузки Alpine -->
        <style is:inline>
            [x-cloak] {
                display: none !important;
            }
        </style>
        <AutoRem baseSiteWidth={1536} baseFontSize={16} />
        <Viewport breakpoint={1536} designWidth={1920} />
    </head>
```

Переключатель темы называеться <ThemeToogle/> и лежит в /components/ui 
Просто импортируем его и используем в хедере или где угодно.
