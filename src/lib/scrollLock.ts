// src/lib/scrollLock.ts

export const scrollLock = {
    scrollbarWidth: 0,
    closeTimeout: undefined as ReturnType<typeof setTimeout> | undefined,

    initScrollLock(this: any) {
        this.scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    },

    // Теперь можно передавать isOpen напрямую или использовать this.open
    toggleScrollLock(this: any, isOpen: boolean = this.open, delay = 75) {
        clearTimeout(this.closeTimeout);
        if (isOpen) {
            document.body.style.overflow = "hidden";
            document.body.style.paddingRight = `${this.scrollbarWidth}px`;
        } else {
            this.closeTimeout = setTimeout(() => {
                document.body.style.overflow = "";
                document.body.style.paddingRight = "";
            }, delay);
        }
    },
};
