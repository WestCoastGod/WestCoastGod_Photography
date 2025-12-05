import { useEffect, useRef } from "react";
import "./Yeti.css"; // We'll create this for the styles

const Yeti = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      // Calculate mouse progress relative to the viewport
      const viewportX = e.clientX / window.innerWidth;
      const viewportY = e.clientY / window.innerHeight;

      wrapper.style.setProperty("--mouse-progress-x", viewportX.toString());
      wrapper.style.setProperty("--mouse-progress-y", viewportY.toString());
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="wrapper"
      ref={wrapperRef}
      style={{ width: 180, height: 250, margin: "0 auto" }}
    >
      <div className="yeti">
        <div className="yeti__horns">
          <svg
            viewBox="0 0 121.9 176"
            className="yeti__horn"
            style={{ left: "-90px", position: "absolute", top: 0 }}
          >
            <defs>
              <linearGradient
                id="SVGID_1_"
                gradientUnits="userSpaceOnUse"
                x1="-233.5"
                y1="506.482"
                x2="-233.616"
                y2="506.01"
                gradientTransform="matrix(121.9346 0 0 -175.9843 28540.572 89223.594)"
              >
                <stop
                  offset="0"
                  stopColor="var(--horn-gradient-stop-0, #FF0000)"
                />{" "}
                {/* Fallback to red */}
                <stop
                  offset="1"
                  stopColor="var(--horn-gradient-stop-1, #00FF00)"
                />{" "}
                {/* Fallback to green */}
              </linearGradient>
            </defs>
            <path
              fill="url(#SVGID_1_)"
              d="M39.7,0c-124,203.4,82.3,174.6,82.3,174.6v-49.9C121.9,124.7,15.3,154.4,39.7,0z"
            />
          </svg>
          <svg
            viewBox="0 0 121.9 176"
            className="yeti__horn"
            style={{ right: "-90px", position: "absolute", top: 0 }}
          >
            <defs>
              <linearGradient
                id="SVGID_2_"
                gradientUnits="userSpaceOnUse"
                x1="-233.5"
                y1="506.482"
                x2="-233.616"
                y2="506.01"
                gradientTransform="matrix(-121.9346 0 0 -175.9843 -28418.639 89223.594)"
              >
                <stop
                  offset="0"
                  stopColor="var(--horn-gradient-stop-0, #FF0000)"
                />{" "}
                {/* Fallback to red */}
                <stop
                  offset="1"
                  stopColor="var(--horn-gradient-stop-1, #00FF00)"
                />{" "}
                {/* Fallback to green */}
              </linearGradient>
            </defs>
            <path
              fill="url(#SVGID_2_)"
              d="M0,124.7l0,49.9c0,0,206.2,28.8,82.3-174.6C106.6,154.4,0,124.7,0,124.7z"
            />
          </svg>
        </div>
        <div className="yeti__body"></div>
        <div className="yeti__eyes">
          <div className="yeti__eye"></div>
          <div className="yeti__eye"></div>
        </div>
        <div className="yeti__mouth"></div>
      </div>
    </div>
  );
};

export default Yeti;
