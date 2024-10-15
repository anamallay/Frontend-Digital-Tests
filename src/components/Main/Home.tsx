import CopyRight from "../../layout/CopyRight";
import Contact from "./Contact";
import Hero from "./Hero";
import HowToStart from "./HowToStart";

export const Home = () => {
  return (
    <div>
      <Hero />
      <HowToStart />
      <Contact />
      <div className="fixed bottom-0 w-full">
        <CopyRight />
      </div>
    </div>
  );
};
