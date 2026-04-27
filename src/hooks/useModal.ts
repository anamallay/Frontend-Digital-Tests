import { useEffect } from "react";

interface UseModalOptions {
  /**
   * Whether the modal is currently open. Defaults to `true` for modals
   * that are unmounted when closed (caller does `{open && <Modal />}`).
   * For modals that always render and self-gate on a prop, pass the
   * prop value here so the hook only attaches handlers while open.
   */
  isOpen?: boolean;

  /**
   * Called when the user presses Escape (unless `preventClose()` returns
   * true) or when the hook's caller wants to programmatically close.
   */
  onClose: () => void;

  /**
   * Called before Escape closes the modal. Return `true` to suppress the
   * close — used by Edit/Delete modals that block the close gesture
   * while an async submission is in flight.
   */
  preventClose?: () => boolean;
}

/**
 * Consolidates the three pieces of plumbing every modal needs:
 *   1. Close on Escape (gated by `preventClose` if provided)
 *   2. Lock body scroll while open
 *   3. (No-op for `aria-modal` itself — that goes on the panel JSX)
 *
 * Usage:
 *   useModal({ onClose });                          // simple modals
 *   useModal({ isOpen, onClose });                  // self-gated modals
 *   useModal({ onClose, preventClose: () => isSubmitting });  // edit/delete
 */
export function useModal({
  isOpen = true,
  onClose,
  preventClose,
}: UseModalOptions): void {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (preventClose?.()) return;
      onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, preventClose]);

  // Body scroll-lock
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);
}
