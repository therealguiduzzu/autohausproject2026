/** True, wenn ein Köderfeld (siehe HoneypotField) befüllt wurde → Bot. */
export function isHoneypotFilled(): boolean {
  if (typeof document === "undefined") return false;
  return Array.from(document.querySelectorAll<HTMLInputElement>("input[data-lead-hp]")).some(
    (el) => el.value.trim() !== "",
  );
}
