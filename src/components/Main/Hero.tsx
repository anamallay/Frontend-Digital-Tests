import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RootState } from "../../reducer/store/store";

function Hero() {
  const isLoggedIn = useSelector((state: RootState) => state.users.isLoggedIn);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div
      className="relative w-[90%] border border-primaryLighter rounded-lg mx-auto overflow-hidden mt-10 sm:mt-20 lg:mt-24"
      style={{ direction: isRTL ? "rtl" : "ltr" }}
    >
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-15"
      >
        <source src="/video/hero-video.mp4" type="video/mp4" />
        {t("Hero.videoNotSupported")}
      </video>

      {/* Content overlay */}
      <section className="relative z-10 bg-opacity-30 py-10 sm:py-16 lg:py-24 pb-20 lg:pb-20">
        {/* Wrapper for paragraph */}
        <div className={`relative mb-6 sm:mb-10 ${isRTL ? "mr-20" : "ml-20"}`}>
          <p
            className={`absolute text-xs sm:text-sm md:text-base font-normal tracking-widest text-thirdColor uppercase ${
              isRTL ? "right-5" : "left-5"
            } top-2.5`}
          >
            {t("Hero.goal")}
          </p>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Main content */}
          <div className="flex flex-col items-center justify-center text-center">
            <h1
              className="mt-4 text-2xl sm:text-4xl lg:text-5xl xl:text-8xl font-bold text-white lg:mt-8"
              style={{
                maxWidth: "1000px",
                lineHeight: "1.2",
              }}
            >
              {t("Hero.mainTitle")}
            </h1>
            <p
              className="mt-4 text-sm sm:text-lg md:text-xl lg:text-3xl text-yellow-100 lg:mt-8"
              style={{
                maxWidth: "800px",
                lineHeight: "1.5",
                wordWrap: "break-word",
              }}
            >
              {t("Hero.description")}
            </p>

            <Link to="/public">
              <button
                title={t("Hero.browseTitle")}
                className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 mt-8 font-semibold text-black transition-all duration-200 bg-thirdColor rounded-lg lg:mt-16 hover:bg-thirdColorLighter focus:bg-thirdColorLighter"
              >
                {t("Hero.browseButton")}
              </button>
            </Link>
            {!isLoggedIn && (
              <p className="text-gray-300 mt-4 sm:mt-6">
                {t("Hero.alreadyRegistered")}{" "}
                <Link to="/login">
                  <span className="text-white transition-all duration-200 hover:text-thirdColorLighter cursor-pointer">
                    {t("Hero.login")}
                  </span>
                </Link>
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Hero;
