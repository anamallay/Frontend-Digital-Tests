import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../reducer/store/store";
import { resetPassword } from "../reducer/action/usersSlice";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Loading from "../layout/Loading";
import { useTranslation } from "react-i18next";

function ResetPassword() {
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { isLoading, error } = useSelector((state: RootState) => state.users);
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted, navigate]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

    dispatch(resetPassword({ token, password: newPassword }))
      .unwrap()
      .then(() => {
        setIsSubmitted(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div
      className="relative flex-grow flex items-center justify-center p-4 w-[90%] mx-auto"
      style={{ minHeight: "90vh" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-20 z-50">
          <Loading />
        </div>
      )}
      {isSubmitted ? (
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg bg-backgroundInner p-6 sm:p-8 rounded-lg shadow-md z-10">
          <header>
            <h1 className="text-xl sm:text-2xl font-bold text-center text-primary">
              {t("Auth.ResetPassword.success_message")}
            </h1>
          </header>
          <p className="text-secondary text-center mt-4">
            {t("Auth.ResetPassword.success_description")}
          </p>
        </div>
      ) : (
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg bg-backgroundInner p-6 sm:p-8 shadow-md z-10 border border-primaryLighter rounded-lg">
          <header>
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-primary mb-2">
              {t("Auth.ResetPassword.submit_button")}
            </h1>
          </header>
          <form onSubmit={handleSubmit}>
            <div>
              <label
                className={`block mb-2 text-secondary text-sm sm:text-base ${
                  isRTL ? "text-right" : "text-left"
                }`}
                htmlFor="newPassword"
              >
                {t("Auth.ResetPassword.new_password")}
              </label>
              <input
                className="mb-4 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                type="password"
                name="newPassword"
                placeholder={t("Auth.ResetPassword.new_password")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label
                className={`block mb-2 text-secondary text-sm sm:text-base ${
                  isRTL ? "text-right" : "text-left"
                }`}
                htmlFor="confirmPassword"
              >
                {t("Auth.ResetPassword.confirm_password")}
              </label>

              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-6"
                type="password"
                name="confirmPassword"
                placeholder={t("Auth.ResetPassword.confirm_password")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {formError && (
              <p className="text-red-500 text-sm sm:text-base mb-4">
                {formError}
              </p>
            )}
            {error && (
              <p className="text-red-500 text-sm sm:text-base mb-4">
                {typeof error === "string"
                  ? error
                  : error?.message || t("Auth.ResetPassword.error_message")}
              </p>
            )}
            <div>
              <input
                className="w-full py-2 sm:py-3 px-4 bg-primary text-secondary font-medium rounded-full shadow-none hover:bg-primaryLighter focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 inline-flex items-center justify-center mb-2"
                type="submit"
                value={
                  isLoading
                    ? t("Auth.ResetPassword.loading")
                    : t("Auth.ResetPassword.submit_button")
                }
                disabled={isLoading}
              />
            </div>
          </form>
          <footer className="flex justify-between mt-4">
            <Link
              to="/login"
              className="text-secondary text-sm sm:text-base hover:text-primaryLighter transition duration-300"
            >
              {t("Auth.ResetPassword.login_link")}
            </Link>
            <Link
              to="/register"
              className="text-secondary text-sm sm:text-base hover:text-primaryLighter transition duration-300"
            >
              {t("Auth.ResetPassword.register_link")}
            </Link>
          </footer>
        </div>
      )}
    </div>
  );
}

export default ResetPassword;
