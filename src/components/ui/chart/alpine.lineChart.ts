// src/alpine/lineChart.ts
import type { Alpine } from "alpinejs";

export default (Alpine: Alpine) => {
    Alpine.data("lineChart", () => ({
        data: [] as any[],
        indexKey: "",
        categoryKey: "",
        baseConfig: {} as any,
        breakpoints: {} as any,
        config: {} as any,

        resizeObserver: null as ResizeObserver | null,
        renderRaf: null as number | null,
        resizeTimeout: null as ReturnType<typeof setTimeout> | null,
        rafId: null as number | null,
        resizeHandler: null as (() => void) | null,

        ttVisible: false,
        ttLabel: "",
        ttValue: "",
        ttColor: "",
        activeIndex: -1,

        init(this: any) {
            this.data = JSON.parse(this.$el.dataset.chartData);
            this.indexKey = this.$el.dataset.index;
            this.categoryKey = this.$el.dataset.category;

            this.baseConfig = {
                height: parseInt(this.$el.dataset.height) || 200,
                padding: parseInt(this.$el.dataset.padding) || 40,
            };
            this.breakpoints = JSON.parse(this.$el.dataset.breakpoints || "{}");

            this.updateConfig();
            this.renderChart();

            this.resizeObserver = new ResizeObserver(() => {
                if (this.renderRaf) cancelAnimationFrame(this.renderRaf);
                this.renderRaf = requestAnimationFrame(() => this.renderChart());
            });
            this.resizeObserver.observe(this.$refs.container);

            this.resizeHandler = () => {
                if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    const oldHeight = this.config.height;
                    this.updateConfig();
                    if (oldHeight !== this.config.height) this.renderChart();
                }, 150);
            };
            window.addEventListener("resize", this.resizeHandler);
        },

        destroy(this: any) {
            if (this.resizeObserver) this.resizeObserver.disconnect();
            if (this.renderRaf) cancelAnimationFrame(this.renderRaf);
            if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
            if (this.rafId) cancelAnimationFrame(this.rafId);
            if (this.resizeHandler) window.removeEventListener("resize", this.resizeHandler);
        },

        updateConfig(this: any) {
            let newConfig = { ...this.baseConfig };
            const sortedBps = Object.keys(this.breakpoints)
                .map(Number)
                .sort((a, b) => a - b);
            for (const bp of sortedBps) {
                if (window.innerWidth >= bp) {
                    newConfig = { ...newConfig, ...this.breakpoints[bp] };
                }
            }
            this.config = newConfig;
        },

        renderChart(this: any) {
            const container = this.$refs.container;
            if (!container) return;
            container.innerHTML = "";

            // 1. Защита от пустых данных
            if (!this.data || this.data.length === 0) return;

            // 2. Проверка на десктоп
            const isDesktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

            const svgNS = "http://www.w3.org/2000/svg";
            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
            const scaleFactor = rootFontSize / 16;

            const width = container.clientWidth || 320;
            const height = container.clientHeight || this.config.height;

            const padding = this.config.padding * scaleFactor;
            const paddingBottom = 20 * scaleFactor;
            const tooltipOffsetX = 15 * scaleFactor;
            const tooltipOffsetY = 45 * scaleFactor;

            const chartWidth = Math.max(0, width - padding - 10 * scaleFactor);
            const chartHeight = Math.max(0, height - paddingBottom);

            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("width", "100%");
            svg.setAttribute("height", "100%");
            svg.style.overflow = "visible";

            svg.setAttribute("role", "img");
            svg.setAttribute("aria-label", `График: ${this.categoryKey || this.indexKey}`);

            const values = this.data.map((d: any) => Number(d[this.categoryKey]) || 0);
            const maxValue = Math.max(...values, 1);

            // 3. Защита от деления на ноль, если в массиве всего 1 элемент
            const stepX = this.data.length > 1 ? chartWidth / (this.data.length - 1) : 0;

            const points = this.data.map((item: any, i: number) => {
                const val = Number(item[this.categoryKey]) || 0;
                const x = padding + stepX * i;
                const y = height - paddingBottom - (val / maxValue) * chartHeight;
                return { x, y, item, val };
            });

            for (let i = 0; i <= 4; i++) {
                const yVal = (maxValue / 4) * (4 - i);
                const yPos = height - paddingBottom - (chartHeight / 4) * i;

                const line = document.createElementNS(svgNS, "line");
                line.setAttribute("x1", padding.toString());
                line.setAttribute("x2", width.toString()); // TS fix
                line.setAttribute("y1", yPos.toString());
                line.setAttribute("y2", yPos.toString());
                line.setAttribute("stroke", "currentColor");
                line.setAttribute("stroke-dasharray", "2 2");
                line.style.color = "var(--border)";
                svg.appendChild(line);

                const yText = document.createElementNS(svgNS, "text");
                yText.setAttribute("x", (padding - 5 * scaleFactor).toString());
                yText.setAttribute("y", (yPos + 4 * scaleFactor).toString());
                yText.setAttribute("text-anchor", "end");
                yText.style.fill = "var(--muted-foreground)";
                yText.style.fontSize = `${10 * scaleFactor}px`;
                yText.textContent = yVal >= 1000 ? `${yVal / 1000}K` : Math.round(yVal).toString();
                svg.appendChild(yText);
            }

            const pathD = points.map((p: any, i: number) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", pathD);
            path.setAttribute("fill", "none");
            path.setAttribute("stroke", `var(--color-${this.categoryKey})`);
            path.setAttribute("stroke-width", String(2 * scaleFactor));
            path.setAttribute("stroke-linecap", "round");
            path.setAttribute("stroke-linejoin", "round");
            svg.appendChild(path);

            points.forEach((p: any) => {
                const xText = document.createElementNS(svgNS, "text");
                xText.setAttribute("x", p.x.toString()); // TS fix
                xText.setAttribute("y", (height - 5 * scaleFactor).toString());
                xText.setAttribute("text-anchor", "middle");
                xText.style.fill = "var(--muted-foreground)";
                xText.style.fontSize = `${12 * scaleFactor}px`;
                xText.textContent = p.item[this.indexKey];
                svg.appendChild(xText);
            });

            points.forEach((p: any, i: number) => {
                const circle = document.createElementNS(svgNS, "circle");
                circle.setAttribute("class", "line-dot");
                circle.setAttribute("data-index", i.toString());
                circle.setAttribute("cx", p.x.toString()); // TS fix
                circle.setAttribute("cy", p.y.toString()); // TS fix
                circle.setAttribute("r", String(3 * scaleFactor));
                circle.setAttribute("fill", "var(--background)");
                circle.setAttribute("stroke", `var(--color-${this.categoryKey})`);
                circle.setAttribute("stroke-width", String(2 * scaleFactor));
                circle.style.pointerEvents = "none";
                circle.style.transition = "r 0.2s";
                svg.appendChild(circle);
            });

            if (isDesktop) {
                const handleMove = (e: MouseEvent) => {
                    if (this.rafId) cancelAnimationFrame(this.rafId);
                    this.rafId = requestAnimationFrame(() => {
                        const rect = svg.getBoundingClientRect();
                        const mouseX = e.clientX - rect.left;
                        let index = Math.round((mouseX - padding) / stepX);
                        if (index < 0) index = 0;
                        if (index >= this.data.length) index = this.data.length - 1;

                        if (this.$refs.tooltip) {
                            this.$refs.tooltip.style.transform = `translate(${e.clientX + tooltipOffsetX}px, ${e.clientY - tooltipOffsetY}px)`;
                        }

                        if (index !== this.activeIndex) {
                            this.activeIndex = index;
                            const p = points[index];
                            svg.querySelectorAll(".line-dot").forEach((c: Element) =>
                                c.setAttribute("r", String(3 * scaleFactor)),
                            );
                            const activeDot = svg.querySelector(`.line-dot[data-index="${index}"]`);
                            if (activeDot) activeDot.setAttribute("r", String(5 * scaleFactor));

                            this.ttLabel = p.item[this.indexKey];
                            this.ttValue = p.val.toLocaleString("ru-RU");
                            this.ttColor = p.item.color || `var(--color-${this.categoryKey})`;
                        }
                        this.ttVisible = true;
                    });
                };

                const handleLeave = () => {
                    if (this.rafId) cancelAnimationFrame(this.rafId);
                    this.ttVisible = false;
                    this.activeIndex = -1;
                    svg.querySelectorAll(".line-dot").forEach((c: Element) =>
                        c.setAttribute("r", String(3 * scaleFactor)),
                    );
                };

                svg.addEventListener("mousemove", handleMove);
                svg.addEventListener("mouseleave", handleLeave);
            }

            container.appendChild(svg);
        },
    }));
};
