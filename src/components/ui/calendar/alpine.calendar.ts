// src/alpine/calendar.ts
import type { Alpine } from "alpinejs";

export default (Alpine: Alpine) => {
    Alpine.data("calendar", (mode = "single") => ({
        mode: mode,
        viewDate: new Date(),
        selectedDate: null as Date | null,
        rangeStart: null as Date | null,
        rangeEnd: null as Date | null,
        hoverDate: null as Date | null,

        init(this: any) {
            // Если передали начальную дату (в будущем можно расширить)
        },

        get monthTitle() {
            const months = [
                "Январь",
                "Февраль",
                "Март",
                "Апрель",
                "Май",
                "Июнь",
                "Июль",
                "Август",
                "Сентябрь",
                "Октябрь",
                "Ноябрь",
                "Декабрь",
            ];
            return `${months[this.viewDate.getMonth()]} ${this.viewDate.getFullYear()}`;
        },

        get daysGrid() {
            const year = this.viewDate.getFullYear();
            const month = this.viewDate.getMonth();
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);

            // Понедельник - 0, Воскресенье - 6
            let startDayOfWeek = firstDay.getDay() - 1;
            if (startDayOfWeek === -1) startDayOfWeek = 6;

            const days = [];
            // Дни предыдущего месяца
            for (let i = startDayOfWeek; i > 0; i--) {
                const date = new Date(year, month, 1 - i);
                days.push({ date, isOutside: true });
            }
            // Дни текущего месяца
            for (let i = 1; i <= lastDay.getDate(); i++) {
                const date = new Date(year, month, i);
                days.push({ date, isOutside: false });
            }
            // Заполняем до 42 дней (6 недель)
            let nextDay = 1;
            while (days.length < 42) {
                const date = new Date(year, month + 1, nextDay++);
                days.push({ date, isOutside: true });
            }
            return days;
        },

        isToday(date: Date) {
            const today = new Date();
            return date.toDateString() === today.toDateString();
        },

        isSelected(date: Date) {
            if (this.mode === "single") {
                return this.selectedDate && date.toDateString() === this.selectedDate.toDateString();
            }
            return false;
        },

        isInRange(date: Date) {
            if (this.mode !== "range" || !this.rangeStart) return false;
            const end = this.rangeEnd || this.hoverDate;
            if (!end) return false;

            const start = this.rangeStart;
            const min = start < end ? start : end;
            const max = start < end ? end : start;

            return date > min && date < max;
        },

        isRangeStart(date: Date) {
            return this.rangeStart && date.toDateString() === this.rangeStart.toDateString();
        },

        isRangeEnd(date: Date) {
            return this.rangeEnd && date.toDateString() === this.rangeEnd.toDateString();
        },

        selectDate(this: any, date: Date) {
            if (this.mode === "single") {
                this.selectedDate = date;
                this.$dispatch("date-select", date);
            } else if (this.mode === "range") {
                if (!this.rangeStart || (this.rangeStart && this.rangeEnd)) {
                    this.rangeStart = date;
                    this.rangeEnd = null;
                    // Отправляем событие сразу при выборе первой даты!
                    this.$dispatch("range-select", { start: this.rangeStart, end: null });
                } else {
                    if (date < this.rangeStart) {
                        this.rangeEnd = this.rangeStart;
                        this.rangeStart = date;
                    } else {
                        this.rangeEnd = date;
                    }
                    this.$dispatch("range-select", { start: this.rangeStart, end: this.rangeEnd });
                }
            }
        },

        prevMonth() {
            this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
        },

        nextMonth() {
            this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
        },
    }));
};
