import React from "react";
import dots from "../assets/Icons/dots.png";

type SectionTitleProps = {
  title: string;
};

const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => {
  return (
    <div className="relative text-center mt-6 sm:mt-10 mb-8 sm:mb-12 flex items-center justify-center">
      {/* Left side dots image */}
      <img
        src={dots}
        alt="Dots pattern"
        className="ml-2 sm:ml-4 w-6 sm:w-9 h-6 sm:h-9 opacity-10"
      />
      {/* Section Title */}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-thirdColor opacity-75 mb-2">
        {title}
      </h2>
      {/* Right side dots image */}
      <img
        src={dots}
        alt="Dots pattern"
        className="mr-2 sm:mr-4 w-6 sm:w-9 h-6 sm:h-9 opacity-10"
      />
    </div>
  );
};

export default SectionTitle;
