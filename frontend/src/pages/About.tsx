import { ReactP5Wrapper } from "react-p5-wrapper";
import { sketch } from "../p5sketch";
import SEO from "../components/SEO";

const titles = ["WestCoastGod", "CUHK Student", "AI DEVELOPE"];

export default function About() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-black w-full h-full overflow-hidden">
      <SEO
        title="About"
        description="Learn more about WestCoastGod - CUHK student, AI developer, and passionate photographer."
        keywords="WestCoastGod, CUHK, AI developer, photographer, about WestCoastGod"
        url="https://westcoastgod-photography.vercel.app/about"
      />
      {/* Background animation canvas */}
      <div
        id="about-bg-canvas"
        className="fixed inset-0 w-full h-full z-0 about-bg-canvas"
        style={{ pointerEvents: "none" }}
      >
        <ReactP5Wrapper sketch={sketch} />
      </div>
      {/* Main stack content */}
      <div className="relative flex flex-col items-center text-center z-10 w-full text-shadow-strong">
        {titles.map((text, idx) =>
          text === "AI DEVELOPE" ? (
            <div
              key={idx}
              className="flex flex-row gap-2 md:gap-6 press-start-2p text-2xl sm:text-4xl md:text-5xl text-black dark:text-white uppercase mb-2 items-center"
            >
              <span>AI</span>
              <span>DEVELOPER</span>
              <img
                src="/images/smart_toy_ai.svg"
                alt="AI Icon"
                className="h-8 sm:h-12 md:h-16 ml-0 -mt-2 dark:invert svg-shadow "
                style={{ display: "inline-block", verticalAlign: "middle" }}
              />
            </div>
          ) : (
            <div
              key={idx}
              className={
                idx === 0
                  ? "charmonman-regular text-3xl sm:text-5xl md:text-6xl text-black dark:text-white mb-4 sm:mb-6 md:mb-6"
                  : "font-serif text-3xl sm:text-5xl md:text-6xl text-black dark:text-white uppercase mb-2"
              }
            >
              {text}
            </div>
          )
        )}
        {/* PHOTOGRAPHY */}
        <div className="eagle-lake-regular text-3xl sm:text-5xl md:text-6xl text-black dark:text-white uppercase mb-2">
          PHOTOGRAPHY
        </div>
        {/* 3 SVGs */}
        <div className="flex flex-row gap-4 items-center mb-2">
          <img
            src="/images/badminton.svg"
            alt="Badminton"
            className="h-10 sm:h-14 md:h-16 dark:invert svg-shadow"
            style={{ display: "inline-block", verticalAlign: "middle" }}
          />
          <img
            src="/images/table_tennis.svg"
            alt="Table Tennis"
            className="h-10 sm:h-14 md:h-16 dark:invert svg-shadow"
            style={{ display: "inline-block", verticalAlign: "middle" }}
          />
          <img
            src="/images/tennis.svg"
            alt="Tennis"
            className="h-10 sm:h-14 md:h-16 dark:invert svg-shadow"
            style={{ display: "inline-block", verticalAlign: "middle" }}
          />
          <img
            src="/images/hiking.svg"
            alt="Hiking"
            className="h-10 sm:h-14 md:h-16 dark:invert svg-shadow"
            style={{ display: "inline-block", verticalAlign: "middle" }}
          />
        </div>
      </div>
      <style>{`
        .charmonman-regular {
          font-family: "Charmonman", cursive;
          font-weight: 400;
          font-style: normal;
        }
        .press-start-2p {
          font-family: "Press Start 2P", cursive;
          font-weight: 400;
          font-style: normal;
        }
        .eagle-lake-regular {
          font-family: "Eagle Lake", cursive;
          font-weight: 400;
          font-style: normal;
        }
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden !important;
        }
        body {
          background-color: white !important;
        }
        @media (prefers-color-scheme: dark) {
          .text-shadow-strong {
            text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.5);
          }
          
          .svg-shadow {
            filter: invert(1) drop-shadow(2px 2px 4px rgba(255, 255, 255, 0.5));
          }
          
          body {
            background-color: #000 !important;
          }
        }
        ::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
