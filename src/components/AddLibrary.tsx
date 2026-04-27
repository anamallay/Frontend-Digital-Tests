import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { BookMarked, CheckCircle2, CircleAlert, ArrowRight } from "lucide-react";

import { AppDispatch } from "../reducer/store/store";
import {
  addPublicQuizToLibrary,
  addQuizToLibraryUsingToken,
} from "../reducer/action/librariesSlice";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Status = "loading" | "success" | "error";

const AddLibrary: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  // One of these will be set depending on which route matched:
  //   /dashboard/add-quiz-to-library/:id      → params.id    (public quiz id)
  //   /dashboard/add-quiz-via-token/:token    → params.token (share token)
  const { id, token } = useParams<{ id?: string; token?: string }>();

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string>(
    t("AddLibrary.addingQuizToLibrary")
  );

  useEffect(() => {
    const addQuizToLibrary = async () => {
      if (!id && !token) {
        setStatus("error");
        setMessage(t("AddLibrary.invalidLink"));
        setTimeout(() => navigate("/dashboard/library"), 3000);
        return;
      }

      try {
        if (id) {
          await dispatch(addPublicQuizToLibrary(id)).unwrap();
          setMessage(t("AddLibrary.successPublicQuiz"));
        } else if (token) {
          await dispatch(addQuizToLibraryUsingToken(token)).unwrap();
          setMessage(t("AddLibrary.successPrivateQuiz"));
        }
        setStatus("success");
      } catch (err: unknown) {
        setStatus("error");
        const errorMessage =
          typeof err === "string"
            ? err
            : (err as { message?: string })?.message ??
              t("AddLibrary.errorAddingQuiz");
        setMessage(`${t("AddLibrary.errorPrefix")} ${errorMessage}`);
      } finally {
        setTimeout(() => navigate("/dashboard/library"), 3000);
      }
    };

    addQuizToLibrary();
  }, [dispatch, id, token, navigate, t]);

  // Visual config per status
  const config = {
    loading: {
      ringClass: "bg-primary/10",
      iconClass: "text-primary",
      Icon: BookMarked,
      pulse: true,
    },
    success: {
      ringClass: "bg-emerald-500/10",
      iconClass: "text-emerald-600",
      Icon: CheckCircle2,
      pulse: false,
    },
    error: {
      ringClass: "bg-destructive/10",
      iconClass: "text-destructive",
      Icon: CircleAlert,
      pulse: false,
    },
  }[status];

  const { Icon } = config;

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="border-border">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            {/* Icon circle */}
            <div className="relative flex h-16 w-16 items-center justify-center">
              {config.pulse && (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-primary/10 animate-ping"
                />
              )}
              <div
                className={`relative flex h-16 w-16 items-center justify-center rounded-full ${config.ringClass}`}
              >
                <Icon className={`h-7 w-7 ${config.iconClass}`} />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {message}
            </h1>

            {/* Secondary line */}
            {status !== "error" && (
              <p className="text-sm text-muted-foreground">
                {t(
                  "AddLibrary.redirectHint",
                  "You will be redirected to your library shortly."
                )}
              </p>
            )}

            {/* Manual skip link */}
            <Button
              asChild
              variant={status === "error" ? "default" : "outline"}
              size="sm"
              className="mt-2"
            >
              <Link to="/dashboard/library">
                {t("Header.my_library")}
                <ArrowRight
                  className={`h-4 w-4 ${isRTL ? "mr-2 rotate-180" : "ml-2"}`}
                />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
};

export default AddLibrary;