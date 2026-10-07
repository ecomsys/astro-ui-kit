import type { Alpine } from "alpinejs";
// Функция глобального управления скролом и оверлеем
export function initOverlayLocker(Alpine: Alpine) {
    Alpine.data("overlay", () => ({
        open: false,
        closeTimeout: undefined as ReturnType<typeof setTimeout> | undefined,

        toggleScrollLock(this: any) {
            clearTimeout(this.closeTimeout);
            const el = document.documentElement; // Работаем с <html>, так как скролл обычно на нем

            if (this.open) {
                // 1. Считаем ширину скроллбара РОВНО в момент открытия
                const scrollbarWidth = window.innerWidth - el.clientWidth;

                // 2. Блокируем скролл
                el.style.overflow = "hidden";

                // 3. Компенсируем исчезнувший скроллбар паддингом, чтобы контент не прыгнул
                if (scrollbarWidth > 0) {
                    el.style.paddingRight = `${scrollbarWidth}px`;
                }
            } else {
                // 4. При закрытии ждем 75мс (пока анимация доиграет) и снимаем блокировку
                this.closeTimeout = setTimeout(() => {
                    el.style.overflow = "";
                    el.style.paddingRight = "";
                }, 75);
            }
        },
    }));
}
