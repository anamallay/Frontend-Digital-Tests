// src/auth/Login.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppDispatch, RootState } from "@/reducer/store/store";
import { clearError, loginUser } from "@/reducer/action/usersSlice";
import AuthCard from "../authCard/AuthCard";

function Login() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((s: RootState) => s.users);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmed = identifier.trim();
    if (!trimmed || !password) {
      setFormError(t("Auth.Login.missing_credentials"));
      return;
    }

    try {
      // A `@` in the identifier is the heuristic for "this is an email,"
      // matching Gmail/Slack/etc. The backend accepts either field, so a
      // username that happens to contain `@` would be rejected on the
      // server side as an unknown email — acceptable, since usernames
      // don't allow `@` per Validation.RegisterValidation.username_format.
      const credentials = trimmed.includes("@")
        ? { email: trimmed, password }
        : { username: trimmed, password };
      await dispatch(loginUser(credentials)).unwrap();
      toast.success(t("Auth.Login.welcome_back"));
      navigate("/");
    } catch (err: unknown) {
      const message =
        typeof err === "string"
          ? err
          : (err as { message?: string })?.message || t("Auth.Login.error");
      toast.error(message);
    }
  };

  const displayError =
    formError ||
    (error && (typeof error === "string" ? error : error?.message));

  return (
    <AuthCard
      title={t("Auth.Login.welcome_back")}
      subtitle={t("Auth.Login.prompt")}
      footer={
        <>
          {t("Auth.Login.no_account")}{" "}
          <Link
            to="/register"
            className="font-semibold text-primary hover:underline"
          >
            {t("Auth.Login.signup_now")}
          </Link>
        </>
      }
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="identifier">{t("Auth.Login.identifier")}</Label>
          <Input
            id="identifier"
            type="text"
            placeholder={t("Auth.Login.identifier_placeholder")}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            disabled={isLoading}
            required
            autoComplete="username"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t("Auth.Login.password")}</Label>
            <Link
              to="/forgotpassword"
              className="text-xs font-medium text-muted-foreground hover:text-primary hover:underline"
            >
              {t("Auth.Login.forgot_password")}
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("Auth.Login.password_placeholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
              aria-label={
                showPassword
                  ? t("Auth.Login.hide_password")
                  : t("Auth.Login.show_password")
              }
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {displayError && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {displayError}
          </div>
        )}

        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("Auth.Login.login_button")}
        </Button>
      </form>
    </AuthCard>
  );
}

export default Login;