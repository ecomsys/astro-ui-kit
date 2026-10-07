// src/alpine/contextMenu.ts
import type { Alpine } from "alpinejs";

export default (Alpine: Alpine) => {
    Alpine.data("contextMenu", () => ({
        open: false,
        outsideClickListener: null as any,
        closeListener: null as any,

        init(this: any) {
            this.outsideClickListener = (e: MouseEvent) => {
                if (!this.open) return;
                const content = this.$refs.content;
                if (content && !content.contains(e.target)) {
                    this.hide();
                }
            };
            document.addEventListener("click", this.outsideClickListener);

            // МАГИЯ ЗАЩИТЫ ОТ ДУБЛЕЙ:
            // Слушаем сигнал от других меню. Если сигнал пришел не от нас — закрываемся!
            this.closeListener = (e: any) => {
                if (e.detail !== this) {
                    this.hide();
                }
            };
            window.addEventListener("close-all-context-menus", this.closeListener);
        },

        destroy(this: any) {
            document.removeEventListener("click", this.outsideClickListener);
            window.removeEventListener("close-all-context-menus", this.closeListener);
        },

        show(this: any, e: MouseEvent) {
            // Отправляем сигнал всем другим меню на странице закрыться
            window.dispatchEvent(new CustomEvent("close-all-context-menus", { detail: this }));

            this.open = true;
            this.$nextTick(() => this.positionContent(e.clientX, e.clientY));
        },

        hide(this: any) {
            this.open = false;
        },

        forceHide(this: any) {
            this.open = false;
            if (this.$refs.content) this.$refs.content.style.display = "none";
        },

        positionContent(this: any, mouseX: number, mouseY: number) {
            const content = this.$refs.content;
            if (!content) return;

            const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
            const contentWidth = content.offsetWidth;
            const contentHeight = content.offsetHeight;

            let leftPx = mouseX;
            let topPx = mouseY;

            if (mouseX + contentWidth > window.innerWidth) {
                leftPx = mouseX - contentWidth;
            }
            if (mouseY + contentHeight > window.innerHeight) {
                topPx = mouseY - contentHeight;
            }

            content.style.top = topPx / remInPx + "rem";
            content.style.left = leftPx / remInPx + "rem";
            content.style.display = "";
        },
    }));
};
