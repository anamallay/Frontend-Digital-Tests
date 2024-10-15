import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { activateAccount } from "../reducer/action/usersSlice";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../reducer/store/store";
import Loading from "../layout/Loading";
import { toast } from "react-toastify";

const ActivateAccount: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [activationStatus, setActivationStatus] = useState<
    "pending" | "success" | "already_active" | "failure"
  >("pending");

  useEffect(() => {
    if (token) {
      dispatch(activateAccount({ token }))
        .unwrap()
        .then((response) => {
          if (response.active) {
            setActivationStatus("already_active");
          } else {
            setActivationStatus("success");
            setTimeout(() => {
              navigate("/login");
            }, 3000);
          }
        })
        .catch(() => {
          setActivationStatus("failure");
          toast.error(t("Auth.ActivateAccount.failure_message"));
        });
    }
  }, [dispatch, token, navigate, t]);

  return (
    <div
      className="flex items-center justify-center p-4 mt-8 sm:mt-12 md:mt-16 lg:mt-1 w-[90%] mx-auto"
      style={{ minHeight: "90vh" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg p-6 sm:p-8 space-y-6 bg-backgroundInner rounded-lg shadow-md">
        {activationStatus === "pending" && (
          <div className="absolute inset-0 flex items-center justify-center bg-opacity-20 z-50">
            <Loading />
          </div>
        )}
        {activationStatus === "success" && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-center text-primary">
              {t("Auth.ActivateAccount.success_message")}
            </h2>
            <p className="text-sm sm:text-base text-center text-secondary mt-4">
              {t("Auth.ActivateAccount.redirect_to_login")}
            </p>
          </>
        )}
        {activationStatus === "already_active" && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-center text-primary">
              {t("Auth.ActivateAccount.account_already_active")}
            </h2>
          </>
        )}
        {activationStatus === "failure" && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-center text-primary">
              {t("Auth.ActivateAccount.failure_message")}
            </h2>
            <p className="text-sm sm:text-base text-center text-secondary mt-4">
              {t("Auth.ActivateAccount.failure_description")}
            </p>
            <div className="flex justify-center">
              <button
                className="mt-4 py-2 px-4 bg-primary text-secondary font-medium rounded-full shadow-none hover:bg-primaryLighter focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 inline-flex items-center justify-center"
                onClick={() => navigate("/register")}
              >
                {t("Auth.ActivateAccount.retry_button")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ActivateAccount;
