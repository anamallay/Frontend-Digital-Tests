// src/auth/ResetPassword.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppDispatch, RootState } from "@/reducer/store/store";
import { resetPassword } from "@/reducer/action/usersSlice";
import AuthCard from "../authCard/AuthCard";

function ResetPassword() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const { isLoading, error } = useSelector((s: RootState) => s.users);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isSubmitted) return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          navigate("/login");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (newPassword !== confirmPassword) {
      setFormError(t("Auth.ResetPassword.password_mismatch"));
      return;
    }
    if (!token) {
      setFormError(t("Auth.ResetPassword.invalid_token"));
      return;
    }

    try {
      await dispatch(resetPassword({ token, password: newPassword })).unwrap();
      setIsSubmitted(true);
    } catch (err: unknown) {
      setFormError(
        (err as { message?: string })?.message ||
          t("Auth.ResetPassword.error_message")
      );
    }
  };

  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  if (isSubmitted) {
    return (
      <AuthCard title={t("Auth.ResetPassword.success_message")}>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <p className="mb-2 text-sm text-muted-foreground sm:text-base">
            {t("Auth.ResetPassword.success_description")}
          </p>
          <p className="mb-6 text-xs text-muted-foreground">
            {t("Auth.ResetPassword.redirecting_in", { count: countdown })}
          </p>
          <Button asChild className="w-full h-11">
            <Link to="/login">{t("Auth.ResetPassword.login_link")}</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  const displayError =
    formError ||
    (error && (typeof error === "string" ? error : error?.message));

  return (
    <AuthCard
      title={t("Auth.ResetPassword.submit_button")}
      subtitle={t("Auth.ResetPassword.success_description")}
      footer={
        <>
          <Link
            to="/login"
            className="text-sm font-medium text-muted-foreground hover:text-primary"
          >
            {t("Auth.ResetPassword.login_link")}
          </Link>
          <span className="mx-2 text-muted-foreground">·</span>
          <Link
            to="/register"
            className="text-sm font-medium text-muted-foreground hover:text-primary"
          >
            {t("Auth.ResetPassword.register_link")}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword">
            {t("Auth.ResetPassword.new_password")}
          </Label>
          <Input
            id="newPassword"
            type="password"
            placeholder={t("Auth.ResetPassword.new_password")}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            {t("Auth.ResetPassword.confirm_password")}
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder={t("Auth.ResetPassword.confirm_password")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            required
            className={
              passwordsMismatch
                ? "border-destructive focus-visible:ring-destructive"
                : passwordsMatch
                ? "border-green-500"
                : ""
            }
          />
          {passwordsMismatch && (
            <p className="text-xs text-destructive">
              {t("Auth.ResetPassword.password_mismatch")}
            </p>
          )}
        </div>

        {displayError && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {displayError}
          </div>
        )}

        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("Auth.ResetPassword.submit_button")}
        </Button>
      </form>
    </AuthCard>
  );
}

export default ResetPassword;