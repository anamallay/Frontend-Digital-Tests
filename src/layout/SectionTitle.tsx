import React from "react";

type SectionTitleProps = {
  title: string;
  eyebrow?: string;
};

const SectionTitle: React.FC<SectionTitleProps> = ({ title, eyebrow }) => {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
        {title}
      </h2>
    </div>
  );
};

export default SectionTitle;