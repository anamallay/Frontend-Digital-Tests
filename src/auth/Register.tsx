import { useState, ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../reducer/action/usersSlice";
import { AppDispatch, RootState } from "../reducer/store/store";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../layout/Loading";
import { useTranslation } from "react-i18next";

interface FormData {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function Register() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { isLoading, error } = useSelector((state: RootState) => state.users);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.username && !formData.email) {
      setFormError(t("Auth.Register.enter_username_or_email"));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError(t("Auth.Register.password_mismatch"));
      return;
    }

    const { name, username, email, password } = formData;
    dispatch(registerUser({ name, username, email, password }))
      .unwrap()
      .then(() => {
        setIsSubmitted(true);
      })
      .catch((err) => {
        console.error("Registration failed:", err);
        setFormError(err.message || t("Auth.Register.registration_error"));
      });
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
      {isSubmitted ? (
        <div className="w-full max-w-md p-8 space-y-6 bg-backgroundInner rounded-lg shadow-md z-10">
          <h2 className="text-2xl font-bold text-center text-primary">
            {t("Auth.Register.registration_successful")}
          </h2>
          {formData.email ? (
            <p className="text-sm text-center text-secondary">
              {t("Auth.Register.check_email")}
            </p>
          ) : (
            <p className="text-sm text-center text-secondary">
              {t("Auth.Register.account_created_no_email")}
            </p>
          )}
        </div>
      ) : (
        <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-backgroundInner shadow-md z-10 border border-primaryLighter rounded-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-primary">
            {t("Auth.Register.create_account")}
          </h2>
          <p className="text-lg text-center text-secondary">
            {t("Auth.Register.welcome_message")}
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/2">
                <label
                  htmlFor="name"
                  className={`block text-sm sm:text-base font-medium text-secondary mb-2 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("Auth.Register.name")}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={t("Auth.Register.name")}
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isLoading}
                />
              </div>
              <div className="w-full sm:w-1/2">
                <label
                  htmlFor="username"
                  className={`block text-sm sm:text-base font-medium text-secondary mb-2 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("Auth.Register.username")}{" "}
                  <span className="text-thirdColor text-xs sm:text-sm">
                    ({t("Auth.Register.optional")})
                  </span>
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder={t("Auth.Register.username")}
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className={`block text-sm sm:text-base font-medium text-secondary mb-2 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("Auth.Register.email")}{" "}
                <span className="text-thirdColor text-xs sm:text-sm">
                  ({t("Auth.Register.optional")})
                </span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder={t("Auth.Register.email")}
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className={`block text-sm sm:text-base font-medium text-secondary mb-2 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("Auth.Register.password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder={t("Auth.Register.password")}
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className={`block text-sm sm:text-base font-medium text-secondary mb-2 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("Auth.Register.confirm_password")}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder={t("Auth.Register.confirm_password")}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-2"
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
                  : error?.message || t("Auth.Register.registration_error")}
              </p>
            )}
            <button
              type="submit"
              className="w-full py-2 sm:py-3 px-4 bg-primary text-secondary font-medium rounded-full shadow-none hover:bg-primaryLighter focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 inline-flex items-center justify-center mb-2"
              disabled={isLoading}
            >
              {t("Auth.Register.submit")}
            </button>
          </form>
          <p className="text-sm sm:text-base text-center text-gray-600">
            {t("Auth.Register.already_have_account")}{" "}
            <Link to="/login">
              <span className="text-sm sm:text-base text-secondary hover:text-primaryLighter transition duration-300">
                {t("Auth.Register.login")}
              </span>
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

export default Register;
