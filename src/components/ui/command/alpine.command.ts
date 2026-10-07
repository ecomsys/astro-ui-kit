// src/alpine/command/alpine.command.ts
import type { Alpine } from "alpinejs";
import { scrollLock } from "../../../lib/scrollLock"; // ИМПОРТИРУЕМ НАШУ УТИЛИТУ

export default (Alpine: Alpine) => {
    Alpine.store("command", {
        open: false,
        toggle(this: any) {
            this.open = !this.open;
        },
    });

    Alpine.data("commandPalette", () => ({
        // 1. ПОДКЛЮЧАЕМ ОБЩУЮ УТИЛИТУ БЛОКИРОВКИ СКРОЛЛА
        ...scrollLock,

        query: "",
        activeIndex: 0,
        visibleItems: [] as HTMLElement[],
        resetTimeout: undefined as ReturnType<typeof setTimeout> | undefined,

        init(this: any) {
            // 2. Инициализируем скролллок (вычисляем ширину бар'а при старте)
            this.initScrollLock();

            // 3. ПРИ РЕСАЙЗЕ ОКНА ПЕРЕСЧИТЫВАЕМ ШИРИНУ СКРОЛЛБАРА
            window.addEventListener("resize", () => {
                this.initScrollLock();
            });

            // Горячие клавиши
            window.addEventListener("keydown", (e) => {
                const target = e.target as HTMLElement;
                const isTyping = ["INPUT", "TEXTAREA"].includes(target.tagName) || target.isContentEditable;

                if ((e.metaKey || e.ctrlKey) && e.code === "KeyK") {
                    e.preventDefault();
                    (Alpine.store("command") as any).toggle();
                } else if (e.code === "Slash" && !isTyping) {
                    e.preventDefault();
                    (Alpine.store("command") as any).toggle();
                }
            });

            // Жестко контролируем открытие/закрытие
            this.$watch("$store.command.open", (val: boolean) => {
                // 4. ИСПОЛЬЗУЕМ НАШУ ФУНКЦИЮ ИЗ УТИЛИТЫ! (val = состояние, 100 = задержка)
                this.toggleScrollLock(val, 100);

                if (val) {
                    clearTimeout(this.resetTimeout);
                    this.$nextTick(() => setTimeout(() => this.$refs.input?.focus(), 50));
                } else {
                    // Сброс фильтров через 100мс (когда анимация закрытия доиграла)
                    this.resetTimeout = setTimeout(() => {
                        this.query = "";
                        this.activeIndex = 0;
                        this.filterList();
                    }, 100);
                }
            });
        },

        filterList(this: any) {
            const list = this.$refs.list;
            if (!list) return;

            const items = Array.from(list.querySelectorAll("[data-command-item]")) as HTMLElement[];
            const groups = Array.from(list.querySelectorAll("[data-command-group]")) as HTMLElement[];
            let visibleCount = 0;

            items.forEach((item) => {
                const text = (item.textContent || "").toLowerCase();
                if (text.includes(this.query.toLowerCase())) {
                    item.style.display = "";
                    visibleCount++;
                } else {
                    item.style.display = "none";
                }
            });

            groups.forEach((group) => {
                const visibleChildren = group.querySelectorAll('[data-command-item]:not([style*="display: none"])');
                group.style.display = visibleChildren.length === 0 ? "none" : "";
            });

            if (this.$refs.empty) {
                this.$refs.empty.style.display = visibleCount === 0 ? "block" : "none";
            }

            this.updateVisibleItems();
            this.activeIndex = 0;
            this.scrollActiveIntoView();
        },

        updateVisibleItems(this: any) {
            const list = this.$refs.list;
            if (!list) return;
            this.visibleItems = Array.from(
                list.querySelectorAll('[data-command-item]:not([style*="display: none"])'),
            ) as HTMLElement[];
        },

        navigate(this: any, direction: number) {
            if (this.visibleItems.length === 0) return;
            this.activeIndex += direction;
            if (this.activeIndex < 0) this.activeIndex = this.visibleItems.length - 1;
            if (this.activeIndex >= this.visibleItems.length) this.activeIndex = 0;
            this.scrollActiveIntoView();
        },

        scrollActiveIntoView(this: any) {
            const active = this.visibleItems[this.activeIndex];
            if (active) active.scrollIntoView({ block: "nearest" });
        },

        selectActive(this: any) {
            const active = this.visibleItems[this.activeIndex];
            if (active) active.click();
        },

        // ВНИМАНИЕ: Никаких собственных toggleScrollLock, lockBodyScroll и unlockBodyScroll больше тут нет!
        // Мы берем их из ...scrollLock.
    }));
};
