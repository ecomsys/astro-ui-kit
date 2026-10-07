// src/alpine/scrollArea.ts
import type { Alpine } from "alpinejs";

export default (Alpine: Alpine) => {
    Alpine.data("scrollArea", () => ({
        thumbHeight: 0,
        thumbTop: 0,
        thumbWidth: 0,
        thumbLeft: 0,
        isDragging: false,
        isVerticalDrag: false,
        startX: 0,
        startY: 0,
        startScrollTop: 0,
        startScrollLeft: 0,
        observer: null as ResizeObserver | null,
        isHovered: false, // <--- ДОБАВИЛИ СОСТОЯНИЕ ХОВЕРА

        init(this: any) {
            this.updateThumb();
            this.observer = new ResizeObserver(() => this.updateThumb());
            this.observer.observe(this.$refs.viewport);
            if (this.$refs.viewport.firstElementChild) {
                this.observer.observe(this.$refs.viewport.firstElementChild);
            }
        },

        destroy(this: any) {
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }
            document.body.style.userSelect = "";
        },

        updateThumb(this: any) {
            const el = this.$refs.viewport;
            if (!el) return;

            const visibleRatioY = el.clientHeight / el.scrollHeight;
            if (visibleRatioY < 1) {
                this.thumbHeight = Math.max(visibleRatioY * 100, 10);
                const maxScrollTop = el.scrollHeight - el.clientHeight;
                this.thumbTop = maxScrollTop > 0 ? (el.scrollTop / maxScrollTop) * (100 - this.thumbHeight) : 0;
            } else {
                this.thumbHeight = 0;
            }

            const visibleRatioX = el.clientWidth / el.scrollWidth;
            if (visibleRatioX < 1) {
                this.thumbWidth = Math.max(visibleRatioX * 100, 10);
                const maxScrollLeft = el.scrollWidth - el.clientWidth;
                this.thumbLeft = maxScrollLeft > 0 ? (el.scrollLeft / maxScrollLeft) * (100 - this.thumbWidth) : 0;
            } else {
                this.thumbWidth = 0;
            }
        },

        onScroll(this: any) {
            if (!this.isDragging) this.updateThumb();
        },

        startDragV(this: any, e: any) {
            this.isDragging = true;
            this.isVerticalDrag = true;
            this.startY = e.clientY || (e.touches && e.touches[0].clientY);
            this.startScrollTop = this.$refs.viewport.scrollTop;
            document.body.style.userSelect = "none";
        },

        startDragH(this: any, e: any) {
            this.isDragging = true;
            this.isVerticalDrag = false;
            this.startX = e.clientX || (e.touches && e.touches[0].clientX);
            this.startScrollLeft = this.$refs.viewport.scrollLeft;
            document.body.style.userSelect = "none";
        },

        onDrag(this: any, e: any) {
            if (!this.isDragging) return;
            const el = this.$refs.viewport;

            if (this.isVerticalDrag) {
                const deltaY = (e.clientY || (e.touches && e.touches[0].clientY)) - this.startY;
                const thumbHeightPx = (this.thumbHeight / 100) * el.clientHeight;
                const scrollbarRange = el.clientHeight - thumbHeightPx;
                const scrollRange = el.scrollHeight - el.clientHeight;
                if (scrollbarRange > 0) {
                    el.scrollTop = this.startScrollTop + deltaY * (scrollRange / scrollbarRange);
                }
            } else {
                const deltaX = (e.clientX || (e.touches && e.touches[0].clientX)) - this.startX;
                const thumbWidthPx = (this.thumbWidth / 100) * el.clientWidth;
                const scrollbarRange = el.clientWidth - thumbWidthPx;
                const scrollRange = el.scrollWidth - el.clientWidth;
                if (scrollbarRange > 0) {
                    el.scrollLeft = this.startScrollLeft + deltaX * (scrollRange / scrollbarRange);
                }
            }
            this.updateThumb();
        },

        stopDrag(this: any) {
            this.isDragging = false;
            document.body.style.userSelect = "";
        },
    }));
};
