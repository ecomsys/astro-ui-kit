// src/alpine/slider.ts
import type { Alpine } from "alpinejs";

export default (Alpine: Alpine) => {
    Alpine.data("slider", (initialValues: number[], min = 0, max = 100, step = 1) => ({
        values: initialValues,
        min: min,
        max: max,
        step: step,
        activeThumb: null as number | null,
        trackEl: null as HTMLElement | null,

        init(this: any) {
            this.trackEl = this.$refs.track;
        },

        getPercent(this: any, value: number) {
            return ((value - this.min) / (this.max - this.min)) * 100;
        },

        getRangeStyle(this: any) {
            if (this.values.length === 1) {
                return `left: 0%; width: ${this.getPercent(this.values[0])}%;`;
            }
            const start = this.getPercent(Math.min(...this.values));
            const end = this.getPercent(Math.max(...this.values));
            return `left: ${start}%; width: ${end - start}%;`;
        },

        getThumbStyle(this: any, index: number) {
            return `left: ${this.getPercent(this.values[index])}%;`;
        },

        startDrag(this: any, index: number, event: PointerEvent) {
            this.activeThumb = index;
            event.preventDefault();
            event.stopPropagation();
        },

        drag(this: any, event: PointerEvent) {
            if (this.activeThumb === null || !this.trackEl) return;

            const rect = this.trackEl.getBoundingClientRect();
            let percent = (event.clientX - rect.left) / rect.width;
            percent = Math.max(0, Math.min(1, percent));

            let newValue = this.min + percent * (this.max - this.min);
            newValue = Math.round(newValue / this.step) * this.step;
            newValue = Math.max(this.min, Math.min(this.max, newValue));

            if (this.values.length > 1) {
                if (this.activeThumb === 0 && newValue > this.values[1]) newValue = this.values[1];
                if (this.activeThumb === 1 && newValue < this.values[0]) newValue = this.values[0];
            }

            this.values[this.activeThumb] = newValue;

            // МАГИЯ ОТПРАВКИ ДАННЫХ НАРУЖУ!
            // Кричим родителю, что значения изменились, и передаем их в $event.detail
            this.$dispatch("input", { values: [...this.values] });
        },

        endDrag(this: any) {
            this.activeThumb = null;
        },
    }));
};
