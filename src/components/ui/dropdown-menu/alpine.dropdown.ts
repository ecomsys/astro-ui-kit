// src/alpine/dropdown.ts
import type { Alpine } from "alpinejs";

export default (Alpine: Alpine) => {
    Alpine.data("dropdown", (trigger = "click", side = "bottom", align = "start", sideOffset = 4) => ({
        open: false,
        trigger: trigger,
        side: side,
        align: align,
        sideOffset: sideOffset,
        actualSide: side,
        closeTimer: undefined as ReturnType<typeof setTimeout> | undefined,
        outsideClickListener: null as any,

        init(this: any) {
            this.outsideClickListener = (e: MouseEvent) => {
                if (!this.open) return;
                const triggerEl = this.$refs.trigger;
                const contentEl = this.$refs.content;
                if (triggerEl && !triggerEl.contains(e.target) && contentEl && !contentEl.contains(e.target)) {
                    this.hide();
                }
            };
            document.addEventListener("click", this.outsideClickListener);
        },

        destroy(this: any) {
            if (this.outsideClickListener) {
                document.removeEventListener("click", this.outsideClickListener);
            }
        },

        toggle(this: any) {
            this.open ? this.hide() : this.show();
        },

        show(this: any) {
            clearTimeout(this.closeTimer);
            this.open = true;
            this.$nextTick(() => this.positionContent());
        },

        hide(this: any) {
            clearTimeout(this.closeTimer);
            this.closeTimer = setTimeout(
                () => {
                    this.open = false;
                },
                this.trigger === "hover" ? 150 : 0,
            );
        },

        forceHide(this: any) {
            clearTimeout(this.closeTimer);
            this.open = false;
            if (this.$refs.content) this.$refs.content.style.display = "none";
        },

        openMenu(this: any) {
            if (this.trigger === "hover") {
                clearTimeout(this.closeTimer);
                this.open = true;
                this.$nextTick(() => this.positionContent());
            }
        },

        closeMenu(this: any) {
            if (this.trigger === "hover") {
                clearTimeout(this.closeTimer);
                this.closeTimer = setTimeout(() => {
                    this.open = false;
                }, 150);
            }
        },

        positionContent(this: any) {
            const triggerEl = this.$refs.trigger;
            const contentEl = this.$refs.content;
            if (!triggerEl || !contentEl) return;

            const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
            const offsetPx = parseFloat(this.sideOffset) || 0;

            const triggerRect = triggerEl.getBoundingClientRect();
            const triggerWidth = triggerEl.offsetWidth;
            const triggerHeight = triggerEl.offsetHeight;
            const contentWidth = contentEl.offsetWidth;
            const contentHeight = contentEl.offsetHeight;

            let actualSide = this.side;

            if (this.side === "top" && triggerRect.top < contentHeight + offsetPx) {
                actualSide = "bottom";
            } else if (this.side === "bottom" && window.innerHeight - triggerRect.bottom < contentHeight + offsetPx) {
                actualSide = "top";
            } else if (this.side === "left" && triggerRect.left < contentWidth + offsetPx) {
                actualSide = "right";
            } else if (this.side === "right" && window.innerWidth - triggerEl.right < contentWidth + offsetPx) {
                actualSide = "left";
            }

            this.actualSide = actualSide;

            let topPx = 0,
                leftPx = 0;

            if (actualSide === "top") topPx = triggerRect.top - contentHeight - offsetPx;
            else if (actualSide === "bottom") topPx = triggerRect.top + triggerHeight + offsetPx;
            else if (actualSide === "left") leftPx = triggerRect.left - contentWidth - offsetPx;
            else if (actualSide === "right") leftPx = triggerRect.left + triggerWidth + offsetPx;

            if (actualSide === "top" || actualSide === "bottom") {
                if (this.align === "start") leftPx = triggerRect.left;
                else if (this.align === "center") leftPx = triggerRect.left + triggerWidth / 2 - contentWidth / 2;
                else if (this.align === "end") leftPx = triggerRect.right - contentWidth;
            } else {
                if (this.align === "start") topPx = triggerRect.top;
                else if (this.align === "center") topPx = triggerRect.top + triggerHeight / 2 - contentHeight / 2;
                else if (this.align === "end") topPx = triggerRect.bottom - contentHeight;
            }

            contentEl.style.top = topPx / remInPx + "rem";
            contentEl.style.left = leftPx / remInPx + "rem";
            contentEl.style.display = "";
        },
    }));
};
