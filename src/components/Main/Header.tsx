import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { RootState, AppDispatch } from "../../reducer/store/store";
import { logoutUser } from "../../reducer/action/usersSlice";
import { Disclosure, DisclosurePanel } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import ProfileModal from "../Modals/Users/ProfileModal";
import LogoIcon from "../../assets/Icons/Logo.png";

const Header = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggedIn, userData } = useSelector(
    (state: RootState) => state.users
  );

  const navigate = useNavigate();
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser())
        .unwrap()
        .then(() => {
          navigate("/login");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to logout:", error.message);
      }
    }
  };

  const toggleProfileModal = () => {
    setProfileModalOpen(!isProfileModalOpen);
    navigate("/profile");
  };

  const closeProfileModal = () => {
    setProfileModalOpen(false);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
    document.body.dir = lng === "ar" ? "rtl" : "ltr";
  };

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedLanguage = event.target.value;
    changeLanguage(selectedLanguage);
  };

  return (
    <header
      className="fixed mt-2 top-0 left-0 w-full z-50"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-2 py-2 flex justify-between items-center bg-backgroundInner border border-primaryLighter rounded-lg">
        {/* Left Section */}
        <div className="flex items-center space-x-2 xs:space-x-2">
          <Link to="/">
            <img
              src={LogoIcon}
              alt="Logo"
              className={`h-6 w-auto cursor-pointer ${
                isRTL ? "ml-auto mr-2" : "ml-2"
              } xs:h-7 sm:h-10 lg:h-14`}
            />
          </Link>
          <div
            className={`text-secondary flex items-center ${
              isRTL ? "space-x-reverse" : "space-x-2"
            } xs:space-x-2 lg:space-x-4`}
          >
            <Link to="/">
              <h1 className="transition duration-150 ease-in-out hover:text-primary text-xs xs:text-sm lg:text-3xl">
                {t("Header.digital_exams")}
              </h1>
            </Link>
            <Link to="/public">
              <p
                className={`text-gray-300 transition duration-150 ease-in-out hover:text-thirdColor text-xs xs:text-xs lg:text-base mt-1 ${
                  isRTL ? "mr-2" : "ml-2"
                }`}
              >
                {t("Header.all_public_exams")}
              </p>
            </Link>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 xs:space-x-2 sm:space-x-4 lg:space-x-6">
          <nav className="flex items-center space-x-2 xs:space-x-2 lg:space-x-4">
            {isLoggedIn ? (
              <Disclosure as="div" className="relative">
                {({ open }) => (
                  <>
                    <Disclosure.Button className="text-secondary font-semibold p-1 sm:p-2 lg:p-4 flex items-center text-xs lg:text-lg">
                      <span>{t("Header.profile_user")}</span>
                      <ChevronDownIcon
                        className={`ml-1 h-4 w-4 sm:h-5 sm:w-5 transition-transform ${
                          open ? "transform rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </Disclosure.Button>
                    <DisclosurePanel
                      className={`absolute ${
                        isRTL ? "left-0 text-right" : "right-0 text-left"
                      } mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5`}
                    >
                      <ul>
                        <li>
                          <Link
                            to="/dashboard/scores"
                            className="block py-2 px-4 text-sm font-semibold hover:bg-gray-50 xs:text-xs sm:text-sm md:text-sm lg:text-sm xl:text-sm xxl:text-sm"
                          >
                            {t("Header.examiner_scores")}
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/dashboard/quizzes"
                            className="block py-2 px-4 text-sm font-semibold hover:bg-gray-50 xs:text-xs sm:text-sm md:text-sm lg:text-sm xl:text-sm xxl:text-sm"
                          >
                            {t("Header.my_quizzes")}
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/dashboard/library"
                            className="block py-2 px-4 text-sm font-semibold hover:bg-gray-50 xs:text-xs sm:text-sm md:text-sm lg:text-sm xl:text-sm xxl:text-sm"
                          >
                            {t("Header.my_library")}
                          </Link>
                        </li>
                        <li
                          className="block py-2 px-4 text-sm font-semibold hover:bg-gray-50 xs:text-xs sm:text-sm md:text-sm lg:text-sm xl:text-sm xxl:text-sm"
                          onClick={toggleProfileModal}
                        >
                          {t("Header.view_profile")}
                        </li>
                        <li className="block py-2 px-4 text-sm text-danger font-semibold hover:bg-gray-50 xs:text-xs sm:text-sm md:text-sm lg:text-sm xl:text-sm xxl:text-sm">
                          <button
                            onClick={handleLogout}
                            className={`w-full ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            {t("Header.logout")}
                          </button>
                        </li>
                      </ul>
                    </DisclosurePanel>
                  </>
                )}
              </Disclosure>
            ) : (
              <li className={`list-none ${isRTL ? "ml-2" : "mr-2"}`}>
                <Link
                  to="/login"
                  className="text-primary cursor-pointer text-xs sm:text-sm lg:text-base"
                >
                  {t("Header.login")}
                </Link>
              </li>
            )}
          </nav>

          {/* Language Switcher */}
          <div className="text-secondary">
            <select
              value={i18n.language}
              onChange={handleLanguageChange}
              className="border border-primary p-1 sm:p-2 rounded-lg bg-backgroundInner text-xs sm:text-sm lg:text-base"
            >
              <option value="en">English</option>
              <option value="ar">عربي</option>
            </select>
          </div>
        </div>
      </div>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
        userData={userData}
      />
    </header>
  );
};

export default Header;
