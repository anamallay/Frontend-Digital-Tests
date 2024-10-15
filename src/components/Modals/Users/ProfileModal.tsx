import React, {
  useState,
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
} from "react";
import ReactDOM from "react-dom";
import { useDispatch } from "react-redux";
import {
  resendActivationEmail,
  updateUser,
  deleteAccount,
  getUserData,
} from "../../../reducer/action/usersSlice";
import { UserType } from "../../../types/UserType";
import { AppDispatch } from "../../../reducer/store/store";
import warningIcon from "../../../assets/Icons/warning.png";
import { useTranslation } from "react-i18next";
import DeleteAccountModal from "./DeleteAccountModal";
// import { useNavigate } from "react-router-dom";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserType | null;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userData,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const modalRef = useRef<HTMLDivElement>(null);
  // const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
  });
  console.log("userData", userData?.data.active);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (userData?.data) {
      setFormData({
        name: userData.data.name || "",
        email: userData.data.email || "",
        username: userData.data.username || "",
      });
    }
  }, [userData]);

  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      // onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // onClose();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updateUser(formData)).unwrap();
      await dispatch(getUserData()).unwrap();
      onClose();
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };

  const handleResendActivationEmail = async () => {
    if (userData?.data?.email) {
      try {
        await dispatch(
          resendActivationEmail({ email: userData.data.email })
        ).unwrap();
        await dispatch(getUserData()).unwrap();
      } catch (err) {
        console.error("Failed to resend activation email:", err);
      }
    }
  };

  const handleDeleteAccount = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleteModalOpen(false);
    try {
      await dispatch(deleteAccount()).unwrap();
      // navigate("/");
      onClose();
    } catch (err) {
      console.error("Failed to delete account:", err);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{ zIndex: 9999 }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-10 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-backgroundOuter opacity-75"></div>
        </div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div
          className="inline-block align-bottom bg-backgroundInner rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full border border-primaryLighter"
          dir={isRTL ? "rtl" : "ltr"}
          ref={modalRef}
        >
          <div className="bg-backgroundInner px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-right sm:mt-0 sm:mr-0 w-full">
                <h3
                  className={`text-2xl font-bold text-primary mb-6 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("ProfileModal.profile_title")}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label
                      htmlFor="name"
                      className={`block text-secondary mb-2 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {t("ProfileModal.name_label")}
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                      placeholder={t("ProfileModal.name_label")}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <div
                      className={`flex justify-between items-center ${
                        isRTL ? "" : "text-left"
                      }`}
                    >
                      <div className="flex items-center">
                        <label
                          htmlFor="email"
                          className={`block text-secondary mb-2 ${
                            isRTL ? "ml-1" : "mr-1"
                          }`}
                        >
                          {t("ProfileModal.email_label")}
                        </label>
                        {userData?.data?.email && !userData.data.active && (
                          <div className="relative group flex items-center">
                            <img
                              src={warningIcon}
                              alt="Warning"
                              className="w-5 h-5"
                            />
                            <div
                              className={`absolute ${
                                isRTL ? "right-full ml-3" : "left-full mr-3"
                              } mb-3 w-max invisible opacity-0 group-hover:visible group-hover:opacity-100 bg-[#F8C358] text-black text-xs rounded-lg px-2 py-1 transition-opacity duration-300`}
                            >
                              {t("ProfileModal.activation_warning")}
                            </div>
                          </div>
                        )}
                      </div>
                      {userData?.data?.email && !userData.data.active && (
                        <div
                          className={`relative group flex items-center ${
                            isRTL ? "mrl-2" : "mr-2"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={handleResendActivationEmail}
                            className="ml-4 text-secondary font-medium hover:text-thirdColor hover:font-semibold transition duration-300 ease-in-out"
                          >
                            {t("ProfileModal.resend_activation")}
                          </button>
                        </div>
                      )}
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                      placeholder={t("ProfileModal.email_label")}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="username"
                      className={`block text-secondary mb-2 ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {t("ProfileModal.username_label")}
                    </label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                      placeholder={t("ProfileModal.username_label")}
                      required
                    />
                  </div>
                  <div className="mb-6 flex flex-col space-y-2">
                    <div className="flex justify-between">
                      <label className="block text-secondary">
                        {t("ProfileModal.account_creation_date")}
                      </label>
                      <p className="text-thirdColorLighter">
                        {new Date(
                          userData?.data?.createdAt || ""
                        ).toLocaleDateString(
                          i18n.language === "ar" ? "ar" : "en"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <button
                      type="submit"
                      className="py-2 px-4 bg-primary text-secondary font-medium rounded-lg shadow-none hover:bg-primaryLighter focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                    >
                      {t("ProfileModal.save_changes")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        // dispatch(getUserData());
                      }}
                      className="py-2 px-4 bg-white text-black font-medium rounded-lg shadow-none hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-danger focus:ring-opacity-50"
                    >
                      {t("ProfileModal.cancel")}
                    </button>
                  </div>
                  <p
                    onClick={handleDeleteAccount}
                    className="mt-4 text-danger font-bold hover:text-white cursor-pointer transition duration-300 ease-in-out "
                  >
                    {t("ProfileModal.delete_account")}
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ProfileModal;
