import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { forgetPassword } from "../reducer/action/usersSlice";
import { AppDispatch, RootState } from "../reducer/store/store";
import Loading from "../layout/Loading";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function ForgotPassword() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.users);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email) {
      dispatch(forgetPassword({ email })).then(() => {
        setIsSubmitted(true);
      });
    } else {
    }
  };

  return (
    <div
      className="flex items-center justify-center p-4 mt-8 sm:mt-12 md:mt-16 lg:mt-1 w-[90%] mx-auto"
      style={{ minHeight: "90vh" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-opacity-20 z-50"
          style={{ height: "95vh" }}
        >
          <Loading />
        </div>
      )}
      {isSubmitted ? (
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg p-8 rounded-lg shadow-md z-10 bg-backgroundInner">
          <header>
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-primary">
              {t("Auth.ForgotPassword.check_email")}
            </h1>
          </header>
          <p className="text-secondary text-center mt-4">
            {t("Auth.ForgotPassword.email_instructions")}
          </p>
        </div>
      ) : (
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg bg-backgroundInner p-8 shadow-md z-10 border border-primaryLighter rounded-lg">
          <header>
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-primary">
              {t("Auth.ForgotPassword.title")}
            </h1>
          </header>
          <form onSubmit={handleSubmit}>
            <div>
              <label
                className={`block mb-2 text-sm sm:text-base ${
                  isRTL ? "text-right" : "text-left"
                } text-secondary`}
                htmlFor="email"
              >
                {t("Auth.ForgotPassword.email_label")}
              </label>
              <input
                className="mb-4 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                type="email"
                name="email"
                placeholder={t("Auth.ForgotPassword.email_placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <input
                className="w-full py-2 px-4 bg-primary text-secondary font-medium rounded-full shadow-none hover:bg-primaryLighter focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 inline-flex items-center justify-center mb-2"
                type="submit"
                value={t("Auth.ForgotPassword.submit_button")}
                disabled={isLoading}
              />
            </div>
          </form>
          <footer className="flex justify-between mt-4">
            <Link
              to="/login"
              className="text-secondary text-sm sm:text-base hover:text-primaryLighter transition duration-300"
            >
              {t("Auth.ForgotPassword.login_link")}
            </Link>
            <Link
              to="/register"
              className="text-secondary text-sm sm:text-base hover:text-primaryLighter transition duration-300"
            >
              {t("Auth.ForgotPassword.register_link")}
            </Link>
          </footer>
        </div>
      )}
    </div>
  );
}

export default ForgotPassword;
