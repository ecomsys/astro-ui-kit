// src/alpine/combobox.ts
import type { Alpine } from "alpinejs";

export default (Alpine: Alpine) => {
    Alpine.data("combobox", (items: any[], placeholder: string, multiple: boolean) => ({
        open: false,
        search: "",
        selected: (multiple ? [] : null) as any,
        items: items,
        placeholder: placeholder,
        multiple: multiple,
        highlightedIndex: -1,
        outsideClickListener: null as any,
        scrollListener: null as any,
        resizeListener: null as any,

        init(this: any) {
            this.outsideClickListener = (e: MouseEvent) => {
                if (!this.open) return;
                const root = this.$refs.root;
                const content = this.$refs.content;
                if (root && !root.contains(e.target) && content && !content.contains(e.target)) {
                    this.open = false;
                }
            };
            document.addEventListener("click", this.outsideClickListener);

            this.scrollListener = () => {
                if (!this.open) return;
                const input = this.$refs.input;
                if (!input) return;
                const rect = input.getBoundingClientRect();
                if (rect.bottom < 0 || rect.top > window.innerHeight) {
                    this.open = false;
                } else {
                    this.positionContent();
                }
            };
            window.addEventListener("scroll", this.scrollListener, { passive: true, capture: true });

            // Ресайз: Просто закрываем, чтобы не рвало вёрстку
            this.resizeListener = () => {
                this.$nextTick(() => this.positionContent());
                if (this.open) this.open = false;
            };
            window.addEventListener("resize", this.resizeListener);
        },

        destroy(this: any) {
            if (this.outsideClickListener) document.removeEventListener("click", this.outsideClickListener);
            if (this.scrollListener) window.removeEventListener("scroll", this.scrollListener, { capture: true });
            if (this.resizeListener) window.removeEventListener("resize", this.resizeListener);
        },

        isSelected(this: any, value: string) {
            if (this.multiple) return this.selected.some((s: any) => s.value === value);
            return this.selected && this.selected.value === value;
        },

        selectItem(this: any, item: any) {
            if (this.multiple) {
                if (this.isSelected(item.value)) {
                    this.selected = this.selected.filter((s: any) => s.value !== item.value);
                } else {
                    this.selected.push(item);
                }
                this.search = "";
                this.$nextTick(() => {
                    if (this.$refs.input) this.$refs.input.focus();
                });
            } else {
                this.selected = item;
                this.search = "";
                this.open = false;
            }
            this.emitChange();
        },

        removeChip(this: any, item: any) {
            this.selected = this.selected.filter((s: any) => s.value !== item.value);
            this.emitChange();
        },

        get filteredItems() {
            if (!this.search) return this.items;
            return this.items.filter((item: any) => item.label.toLowerCase().includes(this.search.toLowerCase()));
        },

        get displayValue() {
            if (this.multiple) {
                return this.selected.length === 0 ? "" : this.selected.map((s: any) => s.label).join(", ");
            }
            return this.selected ? this.selected.label : "";
        },

        get inputValue() {
            if (this.search) return this.search;
            if (!this.multiple && this.selected) return this.displayValue;
            return "";
        },

        get inputPlaceholder() {
            if (this.multiple) return this.selected.length === 0 ? this.placeholder : "";
            return this.search || this.selected ? "" : this.placeholder;
        },

        handleKeydown(this: any, e: KeyboardEvent) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                if (!this.open) this.open = true;
                if (this.highlightedIndex < this.filteredItems.length - 1) this.highlightedIndex++;
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                if (this.highlightedIndex > 0) this.highlightedIndex--;
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (this.highlightedIndex >= 0 && this.filteredItems[this.highlightedIndex]) {
                    this.selectItem(this.filteredItems[this.highlightedIndex]);
                }
            } else if (e.key === "Backspace" && this.multiple && this.search === "" && this.selected.length > 0) {
                this.selected.pop();
                this.emitChange();
            } else if (e.key === "Escape") {
                this.open = false;
                if (this.$refs.input) this.$refs.input.blur();
            } else if (e.key === "Tab") {
                this.open = false;
            }
        },

        clearSelection(this: any) {
            this.selected = this.multiple ? [] : null;
            this.search = "";
            this.emitChange();
        },

        emitChange(this: any) {
            const detail = this.multiple
                ? this.selected.map((s: any) => s.value)
                : this.selected
                  ? this.selected.value
                  : null;

            // МАГИКА: Стреляем от инпута! Он не телепортируется, событие всплывёт к корню.
            const input = this.$refs.input;
            if (input) {
                input.dispatchEvent(new CustomEvent("select-change", { detail, bubbles: true, composed: true }));
            }
        },

        onInputFocus(this: any) {
            this.open = true;
            this.$nextTick(() => this.positionContent());
        },

        toggleOpen(this: any) {
            this.open = !this.open;
            if (this.open) {
                this.$nextTick(() => {
                    this.positionContent();
                    if (this.$refs.input) this.$refs.input.focus();
                });
            }
        },

        positionContent(this: any) {
            const content = this.$refs.content;
            const root = this.$refs.root;
            if (!content || !root) return;

            const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
            const rootRect = root.getBoundingClientRect();

            content.style.width = rootRect.width / remInPx + "rem";
            content.style.left = rootRect.left / remInPx + "rem";

            const offset = 2;
            const contentHeight = content.offsetHeight;
            const spaceBelow = window.innerHeight - rootRect.bottom;

            if (contentHeight > 0 && spaceBelow < contentHeight + offset && rootRect.top > contentHeight + offset) {
                content.style.top = (rootRect.top - contentHeight - offset) / remInPx + "rem";
            } else {
                content.style.top = (rootRect.bottom + offset) / remInPx + "rem";
            }
        },
    }));
};
