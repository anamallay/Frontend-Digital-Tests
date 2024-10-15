import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../reducer/store/store";
import { loginUser, loginWithUsername } from "../reducer/action/usersSlice";
import Loading from "../layout/Loading";
import { useTranslation } from "react-i18next";

function Login() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.users);
  const [formError, setFormError] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isEmail, setIsEmail] = useState(true);
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsEmail(!isEmail);
    setIdentifier("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!identifier || !password) {
      setFormError(
        t("Auth.Login.missing_credentials", {
          type: isEmail ? t("Auth.Login.email") : t("Auth.Login.username"),
        })
      );
      return;
    }

    try {
      if (isEmail) {
        await dispatch(loginUser({ email: identifier, password })).unwrap();
      } else {
        await dispatch(
          loginWithUsername({ username: identifier, password })
        ).unwrap();
      }

      navigate("/");
    } catch (err) {
      // Handle login error
    }
  };

  return (
    <div
      className="flex items-center justify-center p-4 mt-8 sm:mt-12 md:mt-16 lg:mt-1 w-[90%] mx-auto"
      style={{ minHeight: "90vh" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-20 z-50">
          <Loading />
        </div>
      )}
      <div className="bg-backgroundInner p-6 sm:p-8 shadow-md w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg z-10 border border-primaryLighter rounded-lg">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-primary">
          {t("Auth.Login.welcome_back")}
        </h1>
        <p className="text-center text-secondary mb-6 sm:mb-8">
          {t("Auth.Login.prompt", {
            type: isEmail ? t("Auth.Login.email") : t("Auth.Login.username"),
          })}
        </p>
        <form onSubmit={handleLogin}>
          <div className="mb-4" dir={isRTL ? "rtl" : "ltr"}>
            <label
              htmlFor="identifier"
              className={`block text-secondary mb-2 text-sm sm:text-base ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {isEmail ? t("Auth.Login.email") : t("Auth.Login.username")}
            </label>
            <input
              type={isEmail ? "email" : "text"}
              id="identifier"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
              placeholder={
                isEmail
                  ? t("Auth.Login.email_placeholder")
                  : t("Auth.Login.username_placeholder")
              }
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              dir={isRTL ? "rtl" : "ltr"}
              className="mt-2 text-sm text-secondary hover:text-primaryLighter transition duration-300 w-full text-left"
              onClick={handleToggle}
            >
              {isEmail
                ? t("Auth.Login.use_username")
                : t("Auth.Login.use_email")}
            </button>
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className={`block text-secondary mb-2 text-sm sm:text-base ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("Auth.Login.password")}
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
              placeholder={t("Auth.Login.password_placeholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            {(formError || error) && (
              <p className="text-red-500 text-sm sm:text-base mb-4">
                {formError
                  ? formError
                  : typeof error === "string"
                  ? error
                  : error?.message || t("Auth.Login.error")}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mb-4">
            <Link
              to="/forgotpassword"
              className="text-sm sm:text-base text-secondary hover:text-primaryLighter transition duration-300"
            >
              {t("Auth.Login.forgot_password")}
            </Link>
          </div>
          <button
            type="submit"
            className="w-full py-2 sm:py-3 px-4 bg-primary text-secondary font-medium rounded-full shadow-none hover:bg-primaryLighter focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 inline-flex items-center justify-center mb-2"
            disabled={isLoading}
          >
            {t("Auth.Login.login_button")}
          </button>
        </form>
        <p className="text-center text-secondaryDarker text-sm sm:text-base">
          {t("Auth.Login.no_account")}{" "}
          <Link
            to="/register"
            className="text-secondary hover:text-primaryLighter transition duration-300"
          >
            {t("Auth.Login.signup_now")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
