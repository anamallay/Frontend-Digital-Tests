// src/auth/Register.tsx
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppDispatch, RootState } from "@/reducer/store/store";
import AuthCard from "../authCard/AuthCard";
import { clearError, registerUser } from "@/reducer/action/usersSlice";

interface FormData {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function Register() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((s: RootState) => s.users);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FormData, string>>
  >({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Mirror Login.tsx — clear any stale auth-slice error on mount so a
  // failed login that left state.users.error set doesn't bleed into the
  // register page's error banner.
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name as keyof FormData];
      return next;
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!formData.username.trim()) {
      errs.username = t("Auth.Register.username_required");
    }
    const trimmedEmail = formData.email.trim();
    if (trimmedEmail && !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      errs.email = t("Auth.Register.invalid_email");
    }
    if (formData.password.length < 6) {
      errs.password = t("Auth.Register.password_too_short");
    } else if (formData.password.length > 50) {
      errs.password = t("Auth.Register.password_too_long");
    }
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = t("Auth.Register.password_mismatch");
    }
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    const { name, username, password } = formData;
    dispatch(
      registerUser({
        name,
        username,
        password,
        ...(trimmedEmail ? { email: trimmedEmail } : {}),
      })
    )
      .unwrap()
      .then(() => setIsSubmitted(true))
      .catch(
        (
          err:
            | {
                message?: string;
                errors?: { field: string; message: string }[];
              }
            | string
            | undefined
        ) => {
          if (typeof err === "string") {
            setFormError(err || t("Auth.Register.registration_error"));
            return;
          }
          const fieldMap: Partial<Record<keyof FormData, string>> = {};
          for (const e of err?.errors ?? []) {
            if (e.field && e.message && e.field in formData) {
              fieldMap[e.field as keyof FormData] = e.message;
            }
          }
          if (Object.keys(fieldMap).length > 0) {
            setFieldErrors(fieldMap);
            return;
          }
          setFormError(err?.message || t("Auth.Register.registration_error"));
        }
      );
  };

  const passwordStrength = (() => {
    const p = formData.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/\d/.test(p) || /[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();

  const strengthColors = [
    "bg-muted",
    "bg-destructive",
    "bg-amber-500",
    "bg-green-500",
  ];

  if (isSubmitted) {
    return (
      <AuthCard title={t("Auth.Register.registration_successful")}>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <p className="mb-6 text-sm text-muted-foreground sm:text-base">
            {formData.email
              ? t("Auth.Register.check_email")
              : t("Auth.Register.account_created_no_email")}
          </p>
          <Button asChild className="w-full h-11">
            <Link to="/login">{t("Auth.Register.login")}</Link>
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
      title={t("Auth.Register.create_account")}
      subtitle={t("Auth.Register.welcome_message")}
      footer={
        <>
          {t("Auth.Register.already_have_account")}{" "}
          <Link
            to="/login"
            className="font-semibold text-primary hover:underline"
          >
            {t("Auth.Register.login")}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">{t("Auth.Register.name")}</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder={t("Auth.Register.name")}
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">
              {t("Auth.Register.username")}
              <span className="ml-0.5 text-destructive">*</span>
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder={t("Auth.Register.username")}
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
              required
              aria-invalid={Boolean(fieldErrors.username)}
              aria-describedby={
                fieldErrors.username ? "username-error" : undefined
              }
            />
            {fieldErrors.username && (
              <p id="username-error" className="text-xs text-destructive">
                {fieldErrors.username}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            {t("Auth.Register.email")}
            <span className="text-xs font-normal text-muted-foreground">
              ({t("Auth.Register.optional")})
            </span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={t("Auth.Register.email")}
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={
              fieldErrors.email ? "email-error" : "email-helper"
            }
          />
          {fieldErrors.email ? (
            <p id="email-error" className="text-xs text-destructive">
              {fieldErrors.email}
            </p>
          ) : (
            <p id="email-helper" className="text-xs text-muted-foreground">
              {t("Auth.Register.email_helper_text")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t("Auth.Register.password")}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder={t("Auth.Register.password")}
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            required
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? "password-error" : undefined
            }
          />
          {fieldErrors.password && (
            <p id="password-error" className="text-xs text-destructive">
              {fieldErrors.password}
            </p>
          )}
          {formData.password && !fieldErrors.password && (
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    passwordStrength >= i
                      ? strengthColors[passwordStrength]
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            {t("Auth.Register.confirm_password")}
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder={t("Auth.Register.confirm_password")}
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
            required
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            aria-describedby={
              fieldErrors.confirmPassword ? "confirmPassword-error" : undefined
            }
          />
          {fieldErrors.confirmPassword && (
            <p id="confirmPassword-error" className="text-xs text-destructive">
              {fieldErrors.confirmPassword}
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
          {t("Auth.Register.submit")}
        </Button>
      </form>
    </AuthCard>
  );
}

export default Register;