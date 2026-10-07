// src/alpine/inputOTP.ts
import type { Alpine } from "alpinejs";

export default (Alpine: Alpine) => {
    Alpine.data("inputOTP", (maxLength = 6) => ({
        maxLength: maxLength,
        value: "",
        activeIndex: 0,

        init(this: any) {
            this.activeIndex = 0;
        },

        // Убрали (this: any) из параметров геттера, используем хитрость внутри!
        get slots() {
            const self = this as any;
            return Array.from({ length: self.maxLength }, (_, i) => self.value[i] || "");
        },

        handleInput(this: any, e: InputEvent) {
            const input = e.target as HTMLInputElement;
            let val = input.value.replace(/[^a-zA-Z0-9]/g, "");
            if (val.length > this.maxLength) {
                val = val.slice(0, this.maxLength);
            }
            this.value = val;
            input.value = val;

            this.activeIndex = val.length < this.maxLength ? val.length : this.maxLength - 1;

            // Меняем событие на otp-change, чтобы не было рекурсии в Alpine
            this.$dispatch("otp-change", val);
        },

        handleKeydown(this: any, e: KeyboardEvent) {
            if (e.key === "ArrowLeft") {
                this.activeIndex = Math.max(0, this.activeIndex - 1);
            } else if (e.key === "ArrowRight") {
                this.activeIndex = Math.min(this.maxLength - 1, this.activeIndex + 1);
            } else if (e.key === "Backspace" && this.value.length > 0 && this.activeIndex === this.value.length - 1) {
                this.activeIndex = Math.max(0, this.activeIndex - 1);
            }
        },

        handlePaste(this: any, e: ClipboardEvent) {
            e.preventDefault();
            const pastedData = e.clipboardData?.getData("text") || "";
            let val = pastedData.replace(/[^a-zA-Z0-9]/g, "");
            val = val.slice(0, this.maxLength);
            this.value = val;
            if (this.$refs.input) this.$refs.input.value = val;
            this.activeIndex = val.length < this.maxLength ? val.length : this.maxLength - 1;
            this.$dispatch("otp-change", val);
        },

        focusInput(this: any) {
            this.$refs.input.focus();
            const len = this.value.length;
            this.$refs.input.setSelectionRange(len, len);
            this.activeIndex = len < this.maxLength ? len : this.maxLength - 1;
        },
    }));
};
