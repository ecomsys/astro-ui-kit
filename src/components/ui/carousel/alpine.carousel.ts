// src/alpine/carousel.ts
import type { Alpine } from "alpinejs";
import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel";

export default (Alpine: Alpine) => {
    Alpine.data("carousel", (opts: Record<string, any> = {}) => ({
        embla: null as EmblaCarouselType | null,
        canScrollPrev: false,
        canScrollNext: false,
        currentIndex: 0,
        scrollSnapsList: [] as number[],
        loopActive: false, // <--- Флаг, какой метод отступов использовать
        opts: opts, // Сохраняем настройки

        init(this: any) {
            const viewport = this.$refs.viewport;
            const options = { loop: false, align: "start", ...opts } as const;

            this.embla = EmblaCarousel(viewport, options);
            this.updateState();

            this.embla.on("select", () => this.updateState());
            this.embla.on("reInit", () => this.updateState());
        },

        updateState(this: any) {
            if (!this.embla) return;
            this.canScrollPrev = this.embla.canScrollPrev();
            this.canScrollNext = this.embla.canScrollNext();
            this.currentIndex = this.embla.selectedScrollSnap();
            this.scrollSnapsList = this.embla.scrollSnapList();

            // ТОЧНАЯ ПРОВЕРКА:
            // Если мы просили loop, И количество слайдов равно количеству точек прокрутки
            // (Embla не отключила цикл) -> loopActive = true.
            if (this.opts.loop) {
                const slideCount = this.embla.slideNodes().length;
                this.loopActive = this.scrollSnapsList.length === slideCount;
            } else {
                this.loopActive = false;
            }
        },

        next(this: any) {
            this.embla?.scrollNext();
        },
        prev(this: any) {
            this.embla?.scrollPrev();
        },
        goTo(this: any, index: number) {
            this.embla?.scrollTo(index);
        },
    }));
};
