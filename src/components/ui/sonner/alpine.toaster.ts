// src/alpine/toaster.ts
import type { Alpine } from "alpinejs";

export default (Alpine: Alpine) => {
    Alpine.store("toasts", {
        items: [] as Array<{ id: number; message: string; type: string }>,
        soundEnabled: false, // Управляется из компонента Toaster

        playSound(this: any, type: string) {
            if (!this.soundEnabled) return;
            try {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);

                const now = ctx.currentTime;

                // Музыкальная математика для каждого типа
                if (type === "success") {
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(880, now); // Ля (A5)
                    osc.frequency.setValueAtTime(1320, now + 0.1); // Ми (E6)
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                    osc.start(now);
                    osc.stop(now + 0.2);
                } else if (type === "error") {
                    osc.type = "sawtooth";
                    osc.frequency.setValueAtTime(220, now); // Низкий бас (A3)
                    osc.frequency.exponentialRampToValueAtTime(110, now + 0.3); // Спуск вниз (A2)
                    gain.gain.setValueAtTime(0.15, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                    osc.start(now);
                    osc.stop(now + 0.3);
                } else if (type === "warning") {
                    osc.type = "triangle";
                    osc.frequency.setValueAtTime(440, now); // Среднее Ля (A4)
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                    osc.start(now);
                    osc.stop(now + 0.2);
                } else {
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(660, now); // Простое инфо (E5)
                    gain.gain.setValueAtTime(0.05, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                    osc.start(now);
                    osc.stop(now + 0.15);
                }

                // Чистим память после проигрывания
                osc.onended = () => ctx.close();
            } catch (e) {
                console.warn("Audio playback failed", e);
            }
        },

        show(this: any, message: string, type: string = "default") {
            const id = Date.now() + Math.random();
            this.items.push({ id, message, type });

            // Играем звук!
            this.playSound(type);

            if (type !== "loading") {
                setTimeout(() => this.remove(id), 4000);
            }
        },

        remove(this: any, id: number) {
            this.items = this.items.filter((t: any) => t.id !== id);
        },
    });
};
