// src/alpine/resizable.ts
import type { Alpine } from "alpinejs";

export default (Alpine: Alpine) => {
    Alpine.data("resizable", (orientation = "horizontal") => ({
        orientation: orientation,
        isDragging: false,
        handle: null as HTMLElement | null,
        prevPanel: null as HTMLElement | null,
        nextPanel: null as HTMLElement | null,
        startPos: 0,
        startPrevSize: 0,
        startNextSize: 0,

        startResize(this: any, e: PointerEvent) {
            this.isDragging = true;
            this.handle = e.currentTarget;
            this.prevPanel = this.handle.previousElementSibling;
            this.nextPanel = this.handle.nextElementSibling;

            if (!this.prevPanel || !this.nextPanel) return;

            // Берем правильные координаты в зависимости от ориентации
            if (this.orientation === "horizontal") {
                this.startPos = e.clientX;
                this.startPrevSize = this.prevPanel.offsetWidth;
                this.startNextSize = this.nextPanel.offsetWidth;
            } else {
                this.startPos = e.clientY;
                this.startPrevSize = this.prevPanel.offsetHeight;
                this.startNextSize = this.nextPanel.offsetHeight;
            }

            document.body.style.userSelect = "none";
            document.body.style.cursor = this.orientation === "horizontal" ? "col-resize" : "row-resize";
        },

        onResize(this: any, e: PointerEvent) {
            if (!this.isDragging || !this.prevPanel || !this.nextPanel) return;

            // Считаем дельту в правильной оси
            const currentPos = this.orientation === "horizontal" ? e.clientX : e.clientY;
            const delta = currentPos - this.startPos;

            let newPrevSize = this.startPrevSize + delta;
            let newNextSize = this.startNextSize - delta;

            const minSize = 50;
            if (newPrevSize < minSize || newNextSize < minSize) return;

            this.prevPanel.style.flex = `0 0 ${newPrevSize}px`;
            this.nextPanel.style.flex = `0 0 ${newNextSize}px`;
        },

        endResize(this: any) {
            if (!this.isDragging) return;
            this.isDragging = false;
            document.body.style.userSelect = "";
            document.body.style.cursor = "";
        },
    }));
};
