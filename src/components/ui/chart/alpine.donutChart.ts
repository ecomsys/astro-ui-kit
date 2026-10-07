// src/alpine/donutChart.ts
import type { Alpine } from "alpinejs";

export default (Alpine: Alpine) => {
    Alpine.data("donutChart", () => ({
        data: [] as any[],
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

            this.baseConfig = { size: parseInt(this.$el.dataset.size) || 180 };
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
                    // Исправлено: проверяем size, а не height
                    const oldSize = this.config.size;
                    this.updateConfig();
                    if (oldSize !== this.config.size) this.renderChart();
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

            const total = this.data.reduce((sum: number, item: any) => sum + (Number(item.value) || 0), 0);
            if (total === 0) return; // Защита от деления на ноль

            // Проверяем, десктоп ли это (нет смысла вешать слушатели, если мобилка)
            const isDesktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

            const svgNS = "http://www.w3.org/2000/svg";
            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
            const scaleFactor = rootFontSize / 16;

            const width = container.clientWidth || this.config.size;
            const height = container.clientHeight || this.config.size;
            const size = Math.min(width, height);

            const center = size / 2;
            const radius = Math.max(0, center - 20 * scaleFactor);
            const circumference = 2 * Math.PI * radius;
            const strokeWidth = 20 * scaleFactor;
            const strokeWidthActive = 24 * scaleFactor;
            const tooltipOffsetX = 15 * scaleFactor;
            const tooltipOffsetY = 45 * scaleFactor;

            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("width", "100%");
            svg.setAttribute("height", "100%");
            svg.style.overflow = "visible";

            svg.setAttribute("role", "img");
            svg.setAttribute("aria-label", "Кольцевой график");

            const sectorsData: any[] = [];
            let accumulatedDash = 0;

            this.data.forEach((item: any, i: number) => {
                const val = Number(item.value) || 0;
                const dash = (val / total) * circumference;
                const gap = circumference - dash;
                const offset = -accumulatedDash;

                const sector = document.createElementNS(svgNS, "circle");
                sector.setAttribute("class", "donut-sector");
                sector.setAttribute("data-index", i.toString());
                sector.setAttribute("cx", center.toString());
                sector.setAttribute("cy", center.toString());
                sector.setAttribute("r", radius.toString());
                sector.setAttribute("fill", "none");
                const color = item.color || `var(--chart-${i + 1})`;
                sector.setAttribute("stroke", color);
                sector.setAttribute("stroke-width", String(strokeWidth));
                sector.setAttribute("stroke-dasharray", `${dash} ${gap}`);
                sector.setAttribute("stroke-dashoffset", offset.toString());
                sector.setAttribute("transform", `rotate(-90 ${center} ${center})`);
                sector.style.cursor = "pointer";
                sector.style.transition = "opacity 0.2s, stroke-width 0.2s";
                svg.appendChild(sector);

                sectorsData.push({ item, val, color, startAngle: accumulatedDash, endAngle: accumulatedDash + dash });
                accumulatedDash += dash;
            });

            if (isDesktop) {
                const handleMove = (e: MouseEvent) => {
                    if (this.rafId) cancelAnimationFrame(this.rafId);
                    this.rafId = requestAnimationFrame(() => {
                        const rect = svg.getBoundingClientRect();
                        const mouseX = e.clientX - rect.left - center;
                        const mouseY = e.clientY - rect.top - center;

                        let angle = Math.atan2(mouseY, mouseX) + Math.PI / 2;
                        if (angle < 0) angle += 2 * Math.PI;
                        const mouseDash = (angle / (2 * Math.PI)) * circumference;

                        let index = -1;
                        for (let i = 0; i < sectorsData.length; i++) {
                            if (mouseDash >= sectorsData[i].startAngle && mouseDash <= sectorsData[i].endAngle) {
                                index = i;
                                break;
                            }
                        }

                        if (this.$refs.tooltip) {
                            this.$refs.tooltip.style.transform = `translate(${e.clientX + tooltipOffsetX}px, ${e.clientY - tooltipOffsetY}px)`;
                        }

                        if (index !== -1) {
                            if (index !== this.activeIndex) {
                                this.activeIndex = index;
                                const sectorInfo = sectorsData[index];
                                svg.querySelectorAll(".donut-sector").forEach((c: Element) => {
                                    (c as SVGCircleElement).style.opacity = "0.3";
                                    (c as SVGCircleElement).setAttribute("stroke-width", String(strokeWidth));
                                });
                                const activeSector = svg.querySelector(`.donut-sector[data-index="${index}"]`);
                                if (activeSector) {
                                    (activeSector as SVGCircleElement).style.opacity = "1";
                                    (activeSector as SVGCircleElement).setAttribute(
                                        "stroke-width",
                                        String(strokeWidthActive),
                                    );
                                }

                                this.ttLabel = sectorInfo.item.label;
                                this.ttValue = `${Math.round((sectorInfo.val / total) * 100)}% (${sectorInfo.val})`;
                                this.ttColor = sectorInfo.color;
                            }
                            this.ttVisible = true;
                        } else {
                            this.ttVisible = false;
                            this.activeIndex = -1;
                            svg.querySelectorAll(".donut-sector").forEach((c: Element) => {
                                (c as SVGCircleElement).style.opacity = "1";
                                (c as SVGCircleElement).setAttribute("stroke-width", String(strokeWidth));
                            });
                        }
                    });
                };

                const handleLeave = () => {
                    if (this.rafId) cancelAnimationFrame(this.rafId);
                    this.ttVisible = false;
                    this.activeIndex = -1;
                    svg.querySelectorAll(".donut-sector").forEach((c: Element) => {
                        (c as SVGCircleElement).style.opacity = "1";
                        (c as SVGCircleElement).setAttribute("stroke-width", String(strokeWidth));
                    });
                };

                svg.addEventListener("mousemove", handleMove);
                svg.addEventListener("mouseleave", handleLeave);
            }

            container.appendChild(svg);
        },
    }));
};
