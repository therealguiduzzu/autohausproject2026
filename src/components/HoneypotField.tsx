/**
 * Unsichtbares Köderfeld gegen Spam-Bots. Menschen sehen und erreichen es nicht
 * (aria-hidden, tabIndex -1, außerhalb des Viewports). Wird es befüllt,
 * verwirft `leadsStore.add` die Anfrage stillschweigend.
 */
export default function HoneypotField() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Website (bitte leer lassen)
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          data-lead-hp
          defaultValue=""
        />
      </label>
    </div>
  );
}
