import React from "react";
import ReactDOM from "react-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

import { useModal } from "../../../hooks/useModal";
import { AppDispatch } from "../../../reducer/store/store";
import { removeQuizFromLibrary } from "../../../reducer/action/librariesSlice";

import { Button } from "@/components/ui/button";

interface DeleteModalProps {
  quizId: string;
  onClose: () => void;
}

const DeleteLibraryModal: React.FC<DeleteModalProps> = ({
  quizId,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = () => {
    dispatch(removeQuizFromLibrary(quizId)).then(() => onClose());
  };

  useModal({ onClose });

  const content = (
    <AnimatePresence>
      <div
        dir={isRTL ? "rtl" : "ltr"}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-library-title"
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        />

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
              </div>
              <h2
                id="delete-library-title"
                className="text-lg font-semibold tracking-tight text-foreground"
              >
                {t("Modals.DeleteLibraryModal.title")}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label={t("Common.close")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 pb-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("Modals.DeleteLibraryModal.confirmationMessage")}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="min-w-[96px]"
            >
              {t("Modals.DeleteLibraryModal.cancelButton")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="min-w-[120px]"
            >
              {t("Modals.DeleteLibraryModal.confirmButton")}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return ReactDOM.createPortal(content, document.body);
};

export default DeleteLibraryModal;