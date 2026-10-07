// src/alpine/barChart.ts
import type { Alpine } from "alpinejs";

export default (Alpine: Alpine) => {
    Alpine.data("barChart", () => ({
        data: [] as any[],
        indexKey: "",
        categoryKey: "",
        orientation: "vertical",
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
            this.orientation = this.$el.dataset.orientation || "vertical";

            this.baseConfig = {
                height: parseInt(this.$el.dataset.height) || 200,
                padding: parseInt(this.$el.dataset.padding) || 40,
                barGap: parseInt(this.$el.dataset.bargap) || 20,
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

            if (!this.data || this.data.length === 0) return;

            // Проверяем, десктоп ли это (есть ли мышь и ховер)
            const isDesktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

            const svgNS = "http://www.w3.org/2000/svg";
            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
            const scaleFactor = rootFontSize / 16;

            const baseWidth = container.clientWidth || 320;
            const baseHeight = container.clientHeight || this.config.height;

            const padding = this.config.padding * scaleFactor;
            const barGap = this.config.barGap * scaleFactor;
            const paddingBottom = 20 * scaleFactor;
            const tooltipOffsetX = 15 * scaleFactor;
            const tooltipOffsetY = 45 * scaleFactor;

            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("width", "100%");
            svg.setAttribute("height", "100%");
            svg.style.overflow = "visible";

            svg.setAttribute("role", "img");
            svg.setAttribute("aria-label", `График: ${this.categoryKey || this.indexKey}`);

            const values = this.data.map((d: any) => Number(d[this.categoryKey]) || 0);
            const maxValue = Math.max(...values, 1);

            if (this.orientation === "horizontal") {
                const paddingLeft = padding;
                const chartWidth = Math.max(0, baseWidth - paddingLeft - 10 * scaleFactor);
                const chartHeight = Math.max(0, baseHeight - paddingBottom);
                const barHeight = chartHeight / this.data.length;

                for (let i = 0; i <= 4; i++) {
                    const xVal = (maxValue / 4) * i;
                    const xPos = paddingLeft + (chartWidth / 4) * i;

                    const line = document.createElementNS(svgNS, "line");
                    line.setAttribute("x1", xPos.toString());
                    line.setAttribute("x2", xPos.toString());
                    line.setAttribute("y1", "0");
                    line.setAttribute("y2", chartHeight.toString());
                    line.setAttribute("stroke", "currentColor");
                    line.setAttribute("stroke-dasharray", "2 2");
                    line.style.color = "var(--border)";
                    svg.appendChild(line);

                    const xText = document.createElementNS(svgNS, "text");
                    xText.setAttribute("x", xPos.toString());
                    xText.setAttribute("y", (baseHeight - 5 * scaleFactor).toString());
                    xText.setAttribute("text-anchor", "middle");
                    xText.style.fill = "var(--muted-foreground)";
                    xText.style.fontSize = `${10 * scaleFactor}px`;
                    xText.textContent = xVal >= 1000 ? `${xVal / 1000}K` : Math.round(xVal).toString();
                    svg.appendChild(xText);
                }

                this.data.forEach((item: any, i: number) => {
                    const val = Number(item[this.categoryKey]) || 0;
                    const w = (val / maxValue) * chartWidth;
                    const y = i * barHeight + barGap / 2;
                    const x = paddingLeft;

                    const rect = document.createElementNS(svgNS, "rect");
                    rect.setAttribute("class", "bar-rect");
                    rect.setAttribute("data-index", i.toString());
                    rect.setAttribute("x", x.toString());
                    rect.setAttribute("y", y.toString());
                    rect.setAttribute("width", Math.max(0, w).toString());
                    rect.setAttribute("height", Math.max(0, barHeight - barGap).toString());
                    rect.setAttribute("fill", item.color || `var(--color-${this.categoryKey})`);
                    rect.setAttribute("rx", String(4 * scaleFactor));
                    rect.style.transition = "opacity 0.2s";
                    svg.appendChild(rect);

                    const yText = document.createElementNS(svgNS, "text");
                    yText.setAttribute("x", (paddingLeft - 5 * scaleFactor).toString());
                    yText.setAttribute("y", (y + (barHeight - barGap) / 2 + 4 * scaleFactor).toString());
                    yText.setAttribute("text-anchor", "end");
                    yText.style.fill = "var(--muted-foreground)";
                    yText.style.fontSize = `${12 * scaleFactor}px`;
                    yText.textContent = item[this.indexKey];
                    svg.appendChild(yText);
                });

                if (isDesktop) {
                    const handleMove = (e: MouseEvent) => {
                        if (this.rafId) cancelAnimationFrame(this.rafId);
                        this.rafId = requestAnimationFrame(() => {
                            const pt = svg.createSVGPoint();
                            pt.x = e.clientX;
                            pt.y = e.clientY;
                            const ctm = svg.getScreenCTM();
                            if (!ctm) return;
                            const cursorpt = pt.matrixTransform(ctm.inverse());
                            const mouseX = cursorpt.x;
                            const mouseY = cursorpt.y;

                            if (mouseX < paddingLeft || mouseX > baseWidth || mouseY < 0 || mouseY > chartHeight) {
                                if (this.ttVisible) {
                                    this.ttVisible = false;
                                    this.activeIndex = -1;
                                    svg.querySelectorAll(".bar-rect").forEach((r: Element) =>
                                        r.setAttribute("style", "opacity: 1;"),
                                    );
                                }
                                return;
                            }

                            let index = Math.floor(mouseY / barHeight);
                            if (index < 0) index = 0;
                            if (index >= this.data.length) index = this.data.length - 1;

                            if (this.$refs.tooltip) {
                                this.$refs.tooltip.style.transform = `translate(${e.clientX + tooltipOffsetX}px, ${e.clientY - tooltipOffsetY}px)`;
                            }

                            if (index !== this.activeIndex) {
                                this.activeIndex = index;
                                const item = this.data[index];
                                const val = Number(item[this.categoryKey]) || 0;
                                svg.querySelectorAll(".bar-rect").forEach((r: Element) =>
                                    r.setAttribute("style", "opacity: 1;"),
                                );
                                const activeRect = svg.querySelector(`.bar-rect[data-index="${index}"]`);
                                if (activeRect) (activeRect as SVGRectElement).style.opacity = "0.8";
                                this.ttLabel = item[this.indexKey];
                                this.ttValue = val.toLocaleString("ru-RU");
                                this.ttColor = item.color || `var(--color-${this.categoryKey})`;
                            }
                            this.ttVisible = true;
                        });
                    };

                    const handleLeave = () => {
                        if (this.rafId) cancelAnimationFrame(this.rafId);
                        this.ttVisible = false;
                        this.activeIndex = -1;
                        svg.querySelectorAll(".bar-rect").forEach((r: Element) =>
                            r.setAttribute("style", "opacity: 1;"),
                        );
                    };

                    svg.addEventListener("mousemove", handleMove);
                    svg.addEventListener("mouseleave", handleLeave);
                }
            } else {
                // ВЕРТИКАЛЬНАЯ ОРИЕНТАЦИЯ
                const chartWidth = Math.max(0, baseWidth - padding);
                const chartHeight = Math.max(0, baseHeight - paddingBottom);
                const barWidth = chartWidth / this.data.length;

                for (let i = 0; i <= 4; i++) {
                    const yVal = (maxValue / 4) * (4 - i);
                    const yPos = baseHeight - paddingBottom - (chartHeight / 4) * i;

                    const line = document.createElementNS(svgNS, "line");
                    line.setAttribute("x1", padding.toString());
                    line.setAttribute("x2", baseWidth.toString());
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

                this.data.forEach((item: any, i: number) => {
                    const val = Number(item[this.categoryKey]) || 0;
                    const barHeight = (val / maxValue) * chartHeight;
                    const y = baseHeight - paddingBottom - barHeight;
                    const x = padding + i * barWidth + barGap / 2;

                    const rect = document.createElementNS(svgNS, "rect");
                    rect.setAttribute("class", "bar-rect");
                    rect.setAttribute("data-index", i.toString());
                    rect.setAttribute("x", x.toString());
                    rect.setAttribute("y", y.toString());
                    rect.setAttribute("width", Math.max(0, barWidth - barGap).toString());
                    rect.setAttribute("height", Math.max(0, barHeight).toString());
                    rect.setAttribute("fill", item.color || `var(--color-${this.categoryKey})`);
                    rect.setAttribute("rx", String(4 * scaleFactor));
                    rect.style.transition = "opacity 0.2s";
                    svg.appendChild(rect);

                    const xText = document.createElementNS(svgNS, "text");
                    xText.setAttribute("x", (x + (barWidth - barGap) / 2).toString());
                    xText.setAttribute("y", (baseHeight - 5 * scaleFactor).toString());
                    xText.setAttribute("text-anchor", "middle");
                    xText.style.fill = "var(--muted-foreground)";
                    xText.style.fontSize = `${12 * scaleFactor}px`;
                    xText.textContent = item[this.indexKey];
                    svg.appendChild(xText);
                });

                if (isDesktop) {
                    const handleMove = (e: MouseEvent) => {
                        if (this.rafId) cancelAnimationFrame(this.rafId);
                        this.rafId = requestAnimationFrame(() => {
                            const pt = svg.createSVGPoint();
                            pt.x = e.clientX;
                            pt.y = e.clientY;
                            const ctm = svg.getScreenCTM();
                            if (!ctm) return;
                            const cursorpt = pt.matrixTransform(ctm.inverse());
                            const mouseX = cursorpt.x;
                            const mouseY = cursorpt.y;

                            if (
                                mouseX < padding ||
                                mouseX > baseWidth ||
                                mouseY < 0 ||
                                mouseY > baseHeight - paddingBottom
                            ) {
                                if (this.ttVisible) {
                                    this.ttVisible = false;
                                    this.activeIndex = -1;
                                    svg.querySelectorAll(".bar-rect").forEach((r: Element) =>
                                        r.setAttribute("style", "opacity: 1;"),
                                    );
                                }
                                return;
                            }

                            const chartX = mouseX - padding;
                            let index = Math.floor(chartX / barWidth);
                            if (index < 0) index = 0;
                            if (index >= this.data.length) index = this.data.length - 1;

                            if (this.$refs.tooltip) {
                                this.$refs.tooltip.style.transform = `translate(${e.clientX + tooltipOffsetX}px, ${e.clientY - tooltipOffsetY}px)`;
                            }

                            if (index !== this.activeIndex) {
                                this.activeIndex = index;
                                const item = this.data[index];
                                const val = Number(item[this.categoryKey]) || 0;
                                svg.querySelectorAll(".bar-rect").forEach((r: Element) =>
                                    r.setAttribute("style", "opacity: 1;"),
                                );
                                const activeRect = svg.querySelector(`.bar-rect[data-index="${index}"]`);
                                if (activeRect) (activeRect as SVGRectElement).style.opacity = "0.8";
                                this.ttLabel = item[this.indexKey];
                                this.ttValue = val.toLocaleString("ru-RU");
                                this.ttColor = item.color || `var(--color-${this.categoryKey})`;
                            }
                            this.ttVisible = true;
                        });
                    };

                    const handleLeave = () => {
                        if (this.rafId) cancelAnimationFrame(this.rafId);
                        this.ttVisible = false;
                        this.activeIndex = -1;
                        svg.querySelectorAll(".bar-rect").forEach((r: Element) =>
                            r.setAttribute("style", "opacity: 1;"),
                        );
                    };

                    svg.addEventListener("mousemove", handleMove);
                    svg.addEventListener("mouseleave", handleLeave);
                }
            }

            container.appendChild(svg);
        },

        hideTooltip(this: any) {
            this.ttVisible = false;
        },
    }));
};
