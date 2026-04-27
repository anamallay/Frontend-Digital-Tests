// src/auth/ForgotPassword.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppDispatch, RootState } from "@/reducer/store/store";
import { forgetPassword } from "@/reducer/action/usersSlice";
import AuthCard from "../authCard/AuthCard";

function ForgotPassword() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((s: RootState) => s.users);

  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;

    try {
      await dispatch(forgetPassword({ email })).unwrap();
      setIsSubmitted(true);
    } catch (err: unknown) {
      const message =
        typeof err === "string"
          ? err
          : (err as { message?: string })?.message ||
            t("Auth.ForgotPassword.error");
      toast.error(message);
    }
  };

  if (isSubmitted) {
    return (
      <AuthCard title={t("Auth.ForgotPassword.check_email")}>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <p className="mb-6 text-sm text-muted-foreground sm:text-base">
            {t("Auth.ForgotPassword.email_instructions")}
          </p>
          <Button asChild variant="outline" className="w-full h-11">
            <Link to="/login">
              <ArrowLeft
                className={`h-4 w-4 ${isRTL ? "ml-2 rotate-180" : "mr-2"}`}
              />
              {t("Auth.ForgotPassword.login_link")}
            </Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={t("Auth.ForgotPassword.title")}
      subtitle={t("Auth.ForgotPassword.email_instructions")}
      footer={
        <Link
          to="/login"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <ArrowLeft
            className={`h-4 w-4 ${isRTL ? "ml-1.5 rotate-180" : "mr-1.5"}`}
          />
          {t("Auth.ForgotPassword.login_link")}
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("Auth.ForgotPassword.email_label")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("Auth.ForgotPassword.email_placeholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("Auth.ForgotPassword.submit_button")}
        </Button>
      </form>
    </AuthCard>
  );
}

export default ForgotPassword;