// src/alpine/popover.ts
import type { Alpine } from "alpinejs";

export default (Alpine: Alpine) => {
    Alpine.data("popover", (side = "bottom", align = "center", sideOffset = 4, matchWidth = false) => ({
        open: false,
        side: side,
        align: align,
        sideOffset: sideOffset,
        matchWidth: matchWidth,
        actualSide: side,
        outsideClickListener: null as any,
        scrollHandler: null as any, // <--- Добавили
        resizeListener: null as any, // <--- Добавили

        init(this: any) {
            this.outsideClickListener = (e: MouseEvent) => {
                if (!this.open) return;
                const trigger = this.$refs.trigger;
                const content = this.$refs.content;
                if (trigger && !trigger.contains(e.target) && content && !content.contains(e.target)) {
                    this.hide();
                }
            };
            document.addEventListener("click", this.outsideClickListener);

            // МАГИКА СКРОЛЛА: Едем следом за триггером
            this.scrollHandler = () => {
                if (!this.open) return;
                const trigger = this.$refs.trigger;
                if (!trigger) return;
                const rect = trigger.getBoundingClientRect();

                if (rect.bottom < 0 || rect.top > window.innerHeight) {
                    this.instantHide();
                } else {
                    this.positionContent();
                }
            };
            window.addEventListener("scroll", this.scrollHandler, { passive: true, capture: true });

            // МАГИКА РЕСАЙЗА: Сначала двигаем, потом закрываем (без рывков)
            this.resizeListener = () => {
                this.$nextTick(() => this.positionContent());
                if (this.open) {
                    this.open = false;
                }
            };
            window.addEventListener("resize", this.resizeListener);
        },

        destroy(this: any) {
            if (this.outsideClickListener) {
                document.removeEventListener("click", this.outsideClickListener);
            }
            if (this.scrollHandler) {
                window.removeEventListener("scroll", this.scrollHandler, { capture: true } as EventListenerOptions);
            }
            if (this.resizeListener) {
                window.removeEventListener("resize", this.resizeListener);
            }
        },

        toggle(this: any) {
            this.open ? this.hide() : this.show();
        },

        show(this: any) {
            this.open = true;
            this.$nextTick(() => this.positionContent());
        },

        hide(this: any) {
            this.open = false;
        },

        // НОВЫЙ МЕТОД: Мгновенно скрывает без поломки анимаций Alpine
        instantHide(this: any) {
            this.open = false;
            const content = this.$refs.content;
            if (content) {
                content.style.transition = "none";
                content.style.opacity = "0";
                content.style.transform = "scale(0.95)";
            }
        },

        forceHide(this: any) {
            this.instantHide();
        },

        positionContent(this: any) {
            const trigger = this.$refs.trigger;
            const content = this.$refs.content;
            if (!trigger || !content) return;

            // Сбрасываем стили от instantHide
            content.style.transition = "";
            content.style.opacity = "";
            content.style.transform = "";

            const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
            const offsetPx = parseFloat(this.sideOffset) || 0;

            const triggerRect = trigger.getBoundingClientRect();
            const triggerWidth = trigger.offsetWidth;
            const triggerHeight = trigger.offsetHeight;

            if (this.matchWidth) {
                content.style.width = triggerWidth / remInPx + "rem";
            } else {
                content.style.width = "";
            }

            const contentWidth = content.offsetWidth;
            const contentHeight = content.offsetHeight;

            let actualSide = this.side;

            if (this.side === "top" && triggerRect.top < contentHeight + offsetPx) {
                actualSide = "bottom";
            } else if (this.side === "bottom" && window.innerHeight - triggerRect.bottom < contentHeight + offsetPx) {
                actualSide = "top";
            } else if (this.side === "left" && triggerRect.left < contentWidth + offsetPx) {
                actualSide = "right";
            } else if (this.side === "right" && window.innerWidth - triggerRect.right < contentWidth + offsetPx) {
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

            content.style.top = topPx / remInPx + "rem";
            content.style.left = leftPx / remInPx + "rem";
        },
    }));
};
