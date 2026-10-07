// src/alpine/drawer.ts
import type { Alpine } from "alpinejs";

export default (Alpine: Alpine) => {
    Alpine.data("drawer", (direction = "down") => ({
        open: false,
        direction: direction,
        isDragging: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        swipeProgress: 0,
        closeTimeout: undefined as ReturnType<typeof setTimeout> | undefined, // <--- Для скролл-лока

        init() {
            this.$watch("open", (val: boolean) => {
                // МАГИКА ТУТ: Используем твой toggleScrollLock!
                this.toggleScrollLock();

                if (!val) {
                    this.startX = 0;
                    this.startY = 0;
                    this.currentX = 0;
                    this.currentY = 0;
                    this.swipeProgress = 0;
                }
            });
        },

        // Твой фирменный метод блокировки скролла!
        toggleScrollLock(this: any) {
            clearTimeout(this.closeTimeout);
            const el = document.documentElement;

            if (this.open) {
                const scrollbarWidth = window.innerWidth - el.clientWidth;
                el.style.overflow = "hidden";
                if (scrollbarWidth > 0) {
                    el.style.paddingRight = `${scrollbarWidth}px`;
                }
            } else {
                this.closeTimeout = setTimeout(() => {
                    el.style.overflow = "";
                    el.style.paddingRight = "";
                }, 75);
            }
        },

        get panelStyle() {
            if (!this.isDragging) return "";
            const dx = this.currentX - this.startX;
            const dy = this.currentY - this.startY;
            return `transform: translate(${dx}px, ${dy}px); transition: none;`;
        },

        startDrag(e: PointerEvent) {
            if (e.button !== 0 && e.pointerType === "mouse") return;
            this.isDragging = true;
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.currentX = e.clientX;
            this.currentY = e.clientY;
        },

        onDrag(e: PointerEvent) {
            if (!this.isDragging) return;
            this.currentX = e.clientX;
            this.currentY = e.clientY;

            const panel = this.$refs.panel as HTMLElement;
            if (!panel) return;

            if (this.direction === "down" || this.direction === "up") {
                this.currentX = this.startX; // Блокируем ось X
            } else {
                this.currentY = this.startY; // Блокируем ось Y
            }

            if (this.direction === "down" && this.currentY < this.startY) this.currentY = this.startY;
            if (this.direction === "up" && this.currentY > this.startY) this.currentY = this.startY;
            if (this.direction === "left" && this.currentX > this.startX) this.currentX = this.startX;
            if (this.direction === "right" && this.currentX < this.startX) this.currentX = this.startX;

            const dx = this.currentX - this.startX;
            const dy = this.currentY - this.startY;
            const size = this.direction === "down" || this.direction === "up" ? panel.offsetHeight : panel.offsetWidth;
            const delta = this.direction === "down" || this.direction === "up" ? dy : dx;
            this.swipeProgress = Math.min(1, Math.abs(delta) / size);
        },

        endDrag() {
            if (!this.isDragging) return;
            this.isDragging = false;

            const dx = this.currentX - this.startX;
            const dy = this.currentY - this.startY;
            const threshold = 50;

            let shouldClose = false;
            if (this.direction === "down" && dy > threshold) shouldClose = true;
            else if (this.direction === "up" && dy < -threshold) shouldClose = true;
            else if (this.direction === "left" && dx < -threshold) shouldClose = true;
            else if (this.direction === "right" && dx > threshold) shouldClose = true;

            if (shouldClose) {
                this.open = false;
            }
            this.swipeProgress = 0;
        },

        toggle() {
            this.open = !this.open;
        },
        show() {
            this.open = true;
        },
        hide() {
            this.open = false;
        },
    }));
};
