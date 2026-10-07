// src/alpine/sidebar.ts
import type { Alpine } from "alpinejs";
import { scrollLock } from "../../../lib/scrollLock";

export default (Alpine: Alpine) => {
    Alpine.data("sidebar", (defaultOpen = true) => ({
        ...scrollLock,

        open: false,
        collapsed: !defaultOpen,
        isMobile: false,

        init(this: any) {
            this.initScrollLock();

            const saved = localStorage.getItem("sidebar_state");
            if (saved !== null) this.collapsed = saved === "true";

            const checkMobile = () => {
                const wasMobile = this.isMobile;
                this.isMobile = window.innerWidth < 768;
                if (wasMobile && !this.isMobile && this.open) this.open = false;
            };
            checkMobile();
            window.addEventListener("resize", checkMobile);

            window.addEventListener("keydown", (e) => {
                if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    this.toggleSidebar();
                }
            });

            this.$watch("open", (val: boolean) => {
                if (this.isMobile) {
                    this.toggleScrollLock(val, 300);
                }
            });
        },

        // ИСПРАВЛЕНО: Обходим TS через as any
        get state() {
            return (this as any).collapsed ? "collapsed" : "expanded";
        },

        toggleSidebar(this: any) {
            if (this.isMobile) {
                this.open = !this.open;
            } else {
                this.collapsed = !this.collapsed;
                localStorage.setItem("sidebar_state", this.collapsed);
            }
        },
    }));
};
