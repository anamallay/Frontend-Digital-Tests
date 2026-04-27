// src/auth/ActivateAccount.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { CheckCircle2, AlertCircle, Loader2, Info } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { activateAccount } from "@/reducer/action/usersSlice";
import AuthCard from "../authCard/AuthCard";
import { AppDispatch } from "@/reducer/store/store";

type Status = "pending" | "success" | "already_active" | "failure";

const ActivateAccount = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>("pending");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!token) {
      setStatus("failure");
      return;
    }

    let cancelled = false;

    dispatch(activateAccount({ token }))
      .unwrap()
      .then(() => {
        if (!cancelled) setStatus("success");
      })
      .catch((err: { message?: string; status?: number } | undefined) => {
        if (cancelled) return;
        if (err?.status === 409) {
          setStatus("already_active");
        } else {
          setStatus("failure");
          toast.error(t("Auth.ActivateAccount.failure_message"));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, token, t]);

  useEffect(() => {
    if (status !== "success") return;
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
  }, [status, navigate]);

  const config = {
    pending: {
      Icon: Loader2,
      iconClass: "text-primary animate-spin",
      bg: "bg-primary/10",
      title: t("Auth.ActivateAccount.pending_title"),
      description: t("Auth.ActivateAccount.pending_description"),
      cta: null as React.ReactNode,
    },
    success: {
      Icon: CheckCircle2,
      iconClass: "text-primary",
      bg: "bg-primary/10",
      title: t("Auth.ActivateAccount.success_message"),
      description: `${t(
        "Auth.ActivateAccount.redirect_to_login"
      )} (${countdown}…)`,
      cta: (
        <Button asChild className="w-full h-11">
          <Link to="/login">{t("Auth.Login.login_button")}</Link>
        </Button>
      ) as React.ReactNode,
    },
    already_active: {
      Icon: Info,
      iconClass: "text-primary",
      bg: "bg-primary/10",
      title: t("Auth.ActivateAccount.account_already_active"),
      description: t("Auth.ActivateAccount.already_active_description"),
      cta: (
        <Button asChild className="w-full h-11">
          <Link to="/login">{t("Auth.Login.login_button")}</Link>
        </Button>
      ) as React.ReactNode,
    },
    failure: {
      Icon: AlertCircle,
      iconClass: "text-destructive",
      bg: "bg-destructive/10",
      title: t("Auth.ActivateAccount.failure_message"),
      description: t("Auth.ActivateAccount.failure_description"),
      cta: (
        <div className="flex w-full flex-col gap-2">
          <Button asChild className="w-full h-11">
            <Link to="/register">
              {t("Auth.ActivateAccount.retry_button")}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full h-11">
            <Link to="/login">{t("Auth.Login.login_button")}</Link>
          </Button>
        </div>
      ) as React.ReactNode,
    },
  }[status];

  return (
    <AuthCard title={config.title}>
      <div className="flex flex-col items-center text-center">
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${config.bg}`}
        >
          <config.Icon className={`h-6 w-6 ${config.iconClass}`} />
        </div>
        <p className="mb-6 text-sm text-muted-foreground sm:text-base">
          {config.description}
        </p>
        {config.cta}
      </div>
    </AuthCard>
  );
};

export default ActivateAccount;