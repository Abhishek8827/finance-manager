import { AnimatePresence } from "framer-motion";
import AddEntryModal from "./AddEntryModal";
import TransferModal from "./TransferModal";

export default function ModalHost({
  addOpen,
  transferOpen,
  onCloseAdd,
  onCloseTransfer,
}) {
  return (
    <AnimatePresence>
      {addOpen && (
        <AddEntryModal
          key="add-entry"
          isOpen={addOpen}
          onClose={onCloseAdd}
        />
      )}
      {transferOpen && (
        <TransferModal
          key="transfer"
          isOpen={transferOpen}
          onClose={onCloseTransfer}
        />
      )}
    </AnimatePresence>
  );
}
