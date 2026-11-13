/**
 * Tiny event bus so any page can trigger the global "Add entry" / "Transfer"
 * dialogs that live in Layout, without prop drilling through the router.
 */
const ADD_EVENT = "fm:open-add-entry";
const TRANSFER_EVENT = "fm:open-transfer";

export function openAddEntry() {
  window.dispatchEvent(new CustomEvent(ADD_EVENT));
}

export function openTransfer() {
  window.dispatchEvent(new CustomEvent(TRANSFER_EVENT));
}

export function onQuickActions({ add, transfer }) {
  const addHandler = () => add?.();
  const transferHandler = () => transfer?.();
  window.addEventListener(ADD_EVENT, addHandler);
  window.addEventListener(TRANSFER_EVENT, transferHandler);
  return () => {
    window.removeEventListener(ADD_EVENT, addHandler);
    window.removeEventListener(TRANSFER_EVENT, transferHandler);
  };
}
