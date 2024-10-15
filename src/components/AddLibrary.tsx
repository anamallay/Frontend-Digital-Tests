import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { AppDispatch } from "../reducer/store/store";
import Loading from "../layout/Loading";
import {
  addPublicQuizToLibrary,
  addQuizToLibraryUsingToken,
} from "../reducer/action/librariesSlice";
import { useTranslation } from "react-i18next";
// import i18n from "../utils/i18n";

const AddLibrary: React.FC = () => {
  const { t } = useTranslation();
  // const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>(
    t("AddLibrary.addingQuizToLibrary")
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const addQuizToLibrary = async () => {
      if (!id) {
        setMessage(t("AddLibrary.invalidLink"));
        setIsLoading(false);
        return;
      }

      try {
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

        if (isValidObjectId) {
          await dispatch(addPublicQuizToLibrary(id)).unwrap();
          setMessage(t("AddLibrary.successPublicQuiz"));
        } else {
          await dispatch(addQuizToLibraryUsingToken(id)).unwrap();
          setMessage(t("AddLibrary.successPrivateQuiz"));
        }
      } catch (error: any) {
        console.error("Error adding quiz to library:", error);
        if (error.response?.data?.message) {
          setMessage(
            `${t("AddLibrary.errorPrefix")} ${error.response.data.message}`
          );
        } else {
          setMessage(t("AddLibrary.errorAddingQuiz"));
        }
      } finally {
        setIsLoading(false);
        setTimeout(() => navigate("/dashboard/library"), 3000);
      }
    };

    addQuizToLibrary();
  }, [dispatch, id, navigate, t]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-backgroundOuter text-secondary p-4">
      {isLoading ? (
        <Loading />
      ) : (
        <div className="text-primary text-xl sm:text-2xl font-bold">
          {message}
        </div>
      )}
    </div>
  );
};

export default AddLibrary;
