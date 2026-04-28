// src/components/Users/ProfilePage.tsx
//
// Logged-in user's own editable profile. Routed at /profile (inside
// <ProtectedRoute>), replaces the former ProfileModal-used-as-a-route
// pattern. Renders as a normal page — no backdrop, no portal, no
// scroll-lock, no Escape-to-close — because modals and pages have
// different semantics and pressing one into service as the other
// produced real UX bugs (bookmarks rendering a floating panel on an
// empty page, Cancel being a no-op when history is empty, etc.).
//
// The DeleteAccountModal IS still a legitimate modal (confirmation
// dialog), and is opened from this page when the user clicks "Delete
// Account" in the danger zone.

import React, {
  useState,
  ChangeEvent,
  FormEvent,
  useEffect,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { AlertCircle, Mail, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
// import DeleteAccountModal from "../Modals/Users/DeleteAccountModal";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DeleteAccountModal from "./DeleteAccountModal";
import { AppDispatch, RootState } from "@/reducer/store/store";
import { deleteAccount, getUserData, resendActivationEmail, updateUser } from "@/reducer/action/usersSlice";

const ProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const userData = useSelector((s: RootState) => s.users.userData);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Sync form whenever userData arrives or changes (e.g. after a save
  // that refetches userData from the server).
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        username: userData.username || "",
      });
    }
  }, [userData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await dispatch(updateUser(formData)).unwrap();
      await dispatch(getUserData()).unwrap();
      toast.success(t("ProfilePage.save_changes"));
    } catch {
      // Error is surfaced via state.users.error — we stay on the page
      // so the user can retry.
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendActivationEmail = async () => {
    if (!userData?.email) return;
    try {
      await dispatch(
        resendActivationEmail({ email: userData.email })
      ).unwrap();
      await dispatch(getUserData()).unwrap();
      toast.success(t("ProfilePage.resend_activation"));
    } catch {
      // Error surfaced via state.users.error.
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleteModalOpen(false);
    try {
      await dispatch(deleteAccount()).unwrap();
      // Explicit navigation on success. ProtectedRoute would also bounce
      // the now-anonymous user to /login, but doing it explicitly here
      // is clearer and doesn't depend on implicit side effects.
      navigate("/");
    } catch {
      // Account deletion failed — user stays logged in, error in state.
    }
  };

  const needsActivation = Boolean(
    userData?.email && userData.active === false
  );

  const createdAt = userData?.createdAt
    ? new Date(userData.createdAt).toLocaleDateString(
        i18n.language === "ar" ? "ar" : "en"
      )
    : "—";

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-auto w-[92%] max-w-2xl px-4 pb-20 pt-28 sm:pt-32"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("ProfilePage.profile_title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            @{userData?.username ?? "—"}
          </p>
        </div>

        {/* Main form card */}
        <Card className="border-border">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit}>
              {/* Activation banner */}
              {needsActivation && (
                <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                  <AlertCircle className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-foreground">
                      {t("ProfilePage.activation_warning")}
                    </p>
                    <button
                      type="button"
                      onClick={handleResendActivationEmail}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <Mail className="h-3 w-3" aria-hidden="true" />
                      {t("ProfilePage.resend_activation")}
                    </button>
                  </div>
                </div>
              )}

              {/* Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("ProfilePage.name_label")}</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t("ProfilePage.name_label")}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    {t("ProfilePage.email_label")}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t("ProfilePage.email_label")}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">
                    {t("ProfilePage.username_label")}
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder={t("ProfilePage.username_label")}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                {/* Meta row */}
                <div className="flex items-center justify-between pt-1 text-sm">
                  <span className="text-muted-foreground">
                    {t("ProfilePage.account_creation_date")}
                  </span>
                  <span className="font-medium text-foreground">
                    {createdAt}
                  </span>
                </div>
              </div>

              {/* Primary actions */}
              <div className="mt-6 flex items-center justify-end gap-2 border-t border-border pt-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                  className="min-w-[96px]"
                >
                  {t("ProfilePage.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[140px]"
                >
                  {isSubmitting && (
                    <Loader2
                      className={`h-4 w-4 animate-spin ${
                        isRTL ? "ml-2" : "mr-2"
                      }`}
                      aria-hidden="true"
                    />
                  )}
                  {t("ProfilePage.save_changes")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="mt-6 border-border">
          <CardContent className="p-6">
            <TooltipProvider delayDuration={200}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t("ProfilePage.delete_account")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("ProfilePage.delete_account_short_warning")}
                  </p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2
                        className={`h-4 w-4 ${isRTL ? "ml-1.5" : "mr-1.5"}`}
                        aria-hidden="true"
                      />
                      {t("ProfilePage.delete_account")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {t("Modals.DeleteAccountModal.title")}
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account deletion confirmation — this IS a legitimate modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
};

export default ProfilePage;