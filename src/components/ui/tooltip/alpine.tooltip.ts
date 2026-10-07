// src/alpine/tooltip.ts
import type { Alpine } from "alpinejs";

export default (Alpine: Alpine) => {
    // Принимаем sideOffset в пикселях (например, 4)
    Alpine.data("tooltip", (delay = 100, side = "top", sideOffset = 4) => ({
        visible: false,
        delay: delay,
        side: side,
        sideOffset: sideOffset,
        actualSide: side,
        timeout: undefined as ReturnType<typeof setTimeout> | undefined,
        scrollHandler: null as (() => void) | null,

        init(this: any) {
            // Скрываем тултип при скролле страницы
            this.scrollHandler = () => {
                if (this.visible) {
                    this.instantHide(); // Мгновенно без анимаций!
                }
            };
            window.addEventListener("scroll", this.scrollHandler, { passive: true, capture: true });
        },

        destroy(this: any) {
            if (this.timeout) clearTimeout(this.timeout);
            if (this.scrollHandler) {
                window.removeEventListener("scroll", this.scrollHandler, { capture: true } as EventListenerOptions);
            }
        },

        show(this: any) {
            // Отключаем на мобилках
            const isDesktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
            if (!isDesktop) return;

            clearTimeout(this.timeout);

            const tooltip = this.$refs.tooltip;
            if (tooltip) {
                // Сбрасываем инлайн-стили от instantHide, чтобы анимация открытия снова работала
                tooltip.style.transition = "";
                tooltip.style.opacity = "";
                tooltip.style.transform = "";
            }

            this.timeout = setTimeout(() => {
                this.visible = true;
                this.$nextTick(() => this.positionTooltip());
            }, this.delay);
        },

        hide(this: any, instant = false) {
            clearTimeout(this.timeout);
            if (instant) {
                this.visible = false;
            } else {
                this.timeout = setTimeout(() => (this.visible = false), 50);
            }
        },

        // Метод для мгновенного скрытия (срубает анимацию под ноль)
        instantHide(this: any) {
            clearTimeout(this.timeout);
            const tooltip = this.$refs.tooltip;
            if (tooltip) {
                // Убиваем анимацию и моментально делаем невидимым
                tooltip.style.transition = "none";
                tooltip.style.opacity = "0";
                tooltip.style.transform = "scale(0.95)";
            }
            this.visible = false;
        },

        positionTooltip(this: any) {
            const trigger = this.$refs.trigger;
            const tooltip = this.$refs.tooltip;
            if (!trigger || !tooltip) return;

            const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
            const offsetPx = this.sideOffset;

            const triggerRect = trigger.getBoundingClientRect();
            const triggerWidth = trigger.offsetWidth;
            const triggerHeight = trigger.offsetHeight;
            const tooltipWidth = tooltip.offsetWidth;
            const tooltipHeight = tooltip.offsetHeight;

            let actualSide = this.side;

            // Логика переворота
            if (this.side === "top" && triggerRect.top < tooltipHeight + offsetPx) {
                actualSide = "bottom";
            } else if (this.side === "bottom" && window.innerHeight - triggerRect.bottom < tooltipHeight + offsetPx) {
                actualSide = "top";
            } else if (this.side === "left" && triggerRect.left < tooltipWidth + offsetPx) {
                actualSide = "right";
            } else if (this.side === "right" && window.innerWidth - triggerRect.right < tooltipWidth + offsetPx) {
                actualSide = "left";
            }

            this.actualSide = actualSide;

            let topPx = 0,
                leftPx = 0;
            if (actualSide === "top") {
                topPx = triggerRect.top - tooltipHeight - offsetPx;
                leftPx = triggerRect.left + triggerWidth / 2 - tooltipWidth / 2;
            } else if (actualSide === "bottom") {
                topPx = triggerRect.top + triggerHeight + offsetPx;
                leftPx = triggerRect.left + triggerWidth / 2 - tooltipWidth / 2;
            } else if (actualSide === "left") {
                topPx = triggerRect.top + triggerHeight / 2 - tooltipHeight / 2;
                leftPx = triggerRect.left - tooltipWidth - offsetPx;
            } else if (actualSide === "right") {
                topPx = triggerRect.top + triggerHeight / 2 - tooltipHeight / 2;
                leftPx = triggerRect.left + triggerWidth + offsetPx;
            }

            // Переводим финальные пиксели в REM
            tooltip.style.top = topPx / remInPx + "rem";
            tooltip.style.left = leftPx / remInPx + "rem";
        },
    }));
};
