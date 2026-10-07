import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Функция cn принимает любое количество классов, склеивает их и удаляет дубликаты
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
