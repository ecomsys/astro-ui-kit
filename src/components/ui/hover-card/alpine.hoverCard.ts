// src/alpine/hoverCard.ts
import type { Alpine } from "alpinejs";

export default (Alpine: Alpine) => {
    Alpine.data("hoverCard", (side = "bottom", align = "center", sideOffset = 4, delay = 200) => ({
        visible: false,
        side: side,
        align: align,
        sideOffset: sideOffset,
        delay: delay,
        actualSide: side,
        timeout: undefined as ReturnType<typeof setTimeout> | undefined,

        show(this: any) {
            clearTimeout(this.timeout);
            // Сбрасываем жесткое скрытие, чтобы Альпина снова могла управлять анимацией
            if (this.$refs.card) this.$refs.card.style.display = "";
            this.visible = true;
            this.$nextTick(() => this.positionCard());
        },

        hide(this: any) {
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.visible = false;
            }, this.delay);
        },

        forceHide(this: any) {
            clearTimeout(this.timeout);
            this.visible = false;
            // МГНОВЕННОЕ СКРЫТИЕ: Перехватываем управление у x-transition!
            // Браузер моментально убирает элемент из DOM, без доигрывания анимации.
            if (this.$refs.card) this.$refs.card.style.display = "none";
        },

        positionCard(this: any) {
            const trigger = this.$refs.trigger;
            const card = this.$refs.card;
            if (!trigger || !card) return;

            const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
            const offsetPx = parseFloat(this.sideOffset) || 0;

            const triggerRect = trigger.getBoundingClientRect();
            const triggerWidth = trigger.offsetWidth;
            const triggerHeight = trigger.offsetHeight;
            const cardWidth = card.offsetWidth;
            const cardHeight = card.offsetHeight;

            let actualSide = this.side;

            if (this.side === "top" && triggerRect.top < cardHeight + offsetPx) {
                actualSide = "bottom";
            } else if (this.side === "bottom" && window.innerHeight - triggerRect.bottom < cardHeight + offsetPx) {
                actualSide = "top";
            } else if (this.side === "left" && triggerRect.left < cardWidth + offsetPx) {
                actualSide = "right";
            } else if (this.side === "right" && window.innerWidth - triggerRect.right < cardWidth + offsetPx) {
                actualSide = "left";
            }

            this.actualSide = actualSide;

            let topPx = 0,
                leftPx = 0;

            if (actualSide === "top") topPx = triggerRect.top - cardHeight - offsetPx;
            else if (actualSide === "bottom") topPx = triggerRect.top + triggerHeight + offsetPx;
            else if (actualSide === "left") leftPx = triggerRect.left - cardWidth - offsetPx;
            else if (actualSide === "right") leftPx = triggerRect.left + triggerWidth + offsetPx;

            if (actualSide === "top" || actualSide === "bottom") {
                if (this.align === "start") leftPx = triggerRect.left;
                else if (this.align === "center") leftPx = triggerRect.left + triggerWidth / 2 - cardWidth / 2;
                else if (this.align === "end") leftPx = triggerRect.right - cardWidth;
            } else {
                if (this.align === "start") topPx = triggerRect.top;
                else if (this.align === "center") topPx = triggerRect.top + triggerHeight / 2 - cardHeight / 2;
                else if (this.align === "end") topPx = triggerRect.bottom - cardHeight;
            }

            card.style.top = topPx / remInPx + "rem";
            card.style.left = leftPx / remInPx + "rem";
        },
    }));
};
