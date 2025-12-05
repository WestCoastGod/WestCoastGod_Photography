import { useState, useRef, useEffect } from "react";
import Masonry from "react-masonry-css";
import originalPhotos from "../data/photos_src";
import SEO from "../components/SEO";

const Photography = () => {
  const photos = originalPhotos;
  const [selected, setSelected] = useState<null | (typeof photos)[0]>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loaded, setLoaded] = useState<boolean[]>(() =>
    Array(photos.length).fill(false)
  );
  const [previewLoaded, setPreviewLoaded] = useState<boolean[]>(() =>
    Array(photos.length).fill(false)
  );
  const [allPreviewsLoaded, setAllPreviewsLoaded] = useState(false);
  const fullImgRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    setAllPreviewsLoaded(previewLoaded.every(Boolean));
  }, [previewLoaded]);

  const breakpointColumnsObj = {
    default: 7,
    2560: 6,
    1920: 5,
    1440: 4,
    1100: 3,
    700: 2,
    500: 2,
  };

  const renderGridCells = (photoId: string) => {
    const cells = [];
    for (let i = 0; i < 100; i++) {
      cells.push(
        <div
          key={`grid-${photoId}-${i}`}
          // Ensure this class matches the CSS, e.g., from the copied block:
          // .reflection-container .reflection-grid-cell
          // The individual cell positioning (top/left) is handled by .reflection-grid-cell-X in CSS
          className={`reflection-grid-cell reflection-grid-cell-${i + 1}`}
        ></div>
      );
    }
    return cells;
  };

  return (
    <div className="flex min-h-screen">
      <SEO
        title="Photography"
        description="Welcome to my photography portfolio."
        keywords="photography portfolio, landscape photography, nature photos, creative photography, WestCoastGod photos, Oscar Zhang photography, Oscar Zhang photos"
        url="https://westcoastgod-photography.vercel.app/photography"
      />
      <aside className="w-22 flex-shrink-0 bg-white">
        {/* Sidebar content */}
      </aside>
      <main className="flex-1 px-0 sm:px-2 md:px-0 py-0">
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              className="group relative cursor-pointer reflection-container"
              onClick={() => setSelected(photo)}
            >
              {renderGridCells(String(photo.id))}

              <div
                className={`reflection-content w-full h-full ${
                  loaded[idx] ? "image-loaded" : "" // Add 'image-loaded' class when loaded
                } rounded-lg`}
              >
                <img
                  src={photo.low}
                  alt={photo.title}
                  className={`w-full h-full object-cover transition-opacity duration-700 rounded-lg ${
                    loaded[idx] ? "opacity-100" : "opacity-0"
                  }`}
                  style={{
                    display: "block",
                    transitionDelay: loaded[idx] ? `${idx * 80}ms` : "0ms",
                  }}
                  onLoad={() => {
                    setLoaded((prev) => {
                      if (prev[idx]) return prev;
                      const arr = [...prev];
                      arr[idx] = true;
                      return arr;
                    });
                    setPreviewLoaded((prev) => {
                      if (prev[idx]) return prev;
                      const arr = [...prev];
                      arr[idx] = true;
                      return arr;
                    });
                  }}
                  onError={() => {
                    setLoaded((prev) => {
                      if (prev[idx]) return prev;
                      const arr = [...prev];
                      arr[idx] = true;
                      return arr;
                    });
                    setPreviewLoaded((prev) => {
                      if (prev[idx]) return prev;
                      const arr = [...prev];
                      arr[idx] = true;
                      return arr;
                    });
                  }}
                />
              </div>
              {allPreviewsLoaded && (
                <img
                  ref={(el) => {
                    fullImgRefs.current[idx] = el;
                  }}
                  src={photo.src}
                  alt=""
                  style={{ display: "none" }}
                />
              )}
            </div>
          ))}
        </Masonry>

        {selected && (
          <div
            className={`fixed inset-0 flex items-center justify-center z-[1000] transition-colors duration-300 ${
              isFullscreen ? "bg-white dark:bg-black" : "bg-black bg-opacity-60"
            }`}
            onClick={() => {
              setSelected(null);
              setIsFullscreen(false);
            }}
          >
            <div
              className="relative flex flex-col items-center justify-center shadow-lg bg-white dark:bg-black"
              style={{
                width: isFullscreen ? "100vw" : "1100px",
                maxWidth: "95vw",
                height: isFullscreen ? "100vh" : "80vh",
                maxHeight: "95vh",
                borderRadius: isFullscreen ? 0 : "0.75rem",
                overflow: "hidden",
                transition: "all 0.3s",
                boxShadow: isFullscreen ? "none" : undefined,
                padding: isFullscreen ? "40px 40px" : "32px 32px",
                paddingTop: isFullscreen ? "0px" : undefined,
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full flex flex-row justify-between items-center mb-2">
                <button
                  className="text-gray-500 hover:text-black text-2xl px-2 pt-9"
                  onClick={() => setIsFullscreen((f) => !f)}
                  aria-label="Fullscreen"
                  title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
                >
                  {isFullscreen ? (
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 3H5a2 2 0 0 0-2 2v4m0 6v4a2 2 0 0 0 2 2h4m6-18h4a2 2 0 0 1 2 2v4m0 6v4a2 2 0 0 1-2 2h-4" />
                    </svg>
                  ) : (
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 4h6M4 4v6M20 4h-6M20 4v6M4 20h6M4 20v-6M20 20h-6M20 20v-6" />
                    </svg>
                  )}
                </button>
                <button
                  className="text-gray-500 hover:text-black text-3xl px-2 pt-8"
                  onClick={() => {
                    setSelected(null);
                    setIsFullscreen(false);
                  }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 flex flex-col justify-center items-center w-full">
                <div
                  className="flex flex-row items-center justify-center w-full"
                  style={isFullscreen ? { height: "100%" } : {}}
                >
                  <button
                    className="p-3 text-3xl flex-shrink-0 text-gray-500 hover:text-black"
                    style={{ minWidth: 48 }}
                    onClick={() => {
                      const idx = photos.findIndex((p) => p.id === selected.id);
                      if (idx > 0) setSelected(photos[idx - 1]);
                    }}
                    disabled={
                      photos.findIndex((p) => p.id === selected.id) === 0
                    }
                    aria-label="Previous"
                  >
                    ‹
                  </button>
                  <img
                    src={selected.src}
                    alt={selected.title}
                    className="max-h-full max-w-full mx-4 object-contain"
                    style={{
                      display: "block",
                      margin: "0 auto",
                      background: "#f8f8f8",
                      width: "auto",
                      height: "auto",
                      maxHeight: isFullscreen
                        ? "calc(100vh - 220px)"
                        : "calc(80vh - 220px)",
                      maxWidth: "100%",
                    }}
                  />
                  <button
                    className="p-3 text-3xl flex-shrink-0 text-gray-500 hover:text-black"
                    style={{ minWidth: 48 }}
                    onClick={() => {
                      const idx = photos.findIndex((p) => p.id === selected.id);
                      if (idx < photos.length - 1) setSelected(photos[idx + 1]);
                    }}
                    disabled={
                      photos.findIndex((p) => p.id === selected.id) ===
                      photos.length - 1
                    }
                    aria-label="Next"
                  >
                    ›
                  </button>
                </div>
                {!isFullscreen && (
                  <div className="w-full flex flex-col items-center mt-4">
                    <h2 className="text-xl font-bold mb-2 px-6 w-full text-center">
                      {selected.title}
                    </h2>
                    <div className="pb-4 mx-auto px-4 max-w-full sm:max-w-lg inline-block">
                      <p className="text-justify">{selected.desc}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Photography;
