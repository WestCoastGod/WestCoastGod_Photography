import {
  MapContainer,
  TileLayer,
  Popup,
  ImageOverlay,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect, useRef } from "react";
import SEO from "../components/SEO";

// 修復 Leaflet 標記圖標問題
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// 香港邊界默認視圖
const HONG_KONG_CENTER: [number, number] = [22.3193, 114.1694];
const DEFAULT_ZOOM = 11;

// 疊加圖片的經緯度範圍
const IMG_LAT_MIN = 21.95;
const IMG_LAT_MAX = 22.75;
const IMG_LNG_MIN = 113.5;
const IMG_LNG_MAX = 114.69;

// 顏色對應表
const COLOR_TABLE = [
  { rgb: [0, 0, 0], bortle: "1", sky: "22.00~21.99" },
  { rgb: [32, 32, 32], bortle: "1-2", sky: "21.99~21.93" },
  { rgb: [64, 64, 64], bortle: "2", sky: "21.93~21.89" },
  { rgb: [0, 0, 64], bortle: "2-3", sky: "21.89~21.81" },
  { rgb: [0, 0, 128], bortle: "3", sky: "21.81~21.69" },
  { rgb: [0, 64, 0], bortle: "3-4", sky: "21.69~21.51" },
  { rgb: [0, 128, 0], bortle: "4", sky: "21.51~21.25" },
  { rgb: [128, 128, 0], bortle: "4-5", sky: "21.25~20.91" },
  { rgb: [192, 192, 64], bortle: "5", sky: "20.91~20.49" },
  { rgb: [192, 128, 0], bortle: "5-6", sky: "20.49~20.02" },
  { rgb: [192, 96, 0], bortle: "6", sky: "20.02~19.50" },
  { rgb: [128, 0, 0], bortle: "6-7", sky: "19.50~18.95" },
  { rgb: [192, 0, 0], bortle: "7", sky: "18.95~18.38" },
  { rgb: [255, 64, 64], bortle: "7-8", sky: "18.38~17.80" },
  { rgb: [192, 192, 192], bortle: "8-9", sky: "<17.80" },
];

function colorDist(a: [number, number, number], b: [number, number, number]) {
  return Math.sqrt(
    Math.pow(a[0] - b[0], 2) +
      Math.pow(a[1] - b[1], 2) +
      Math.pow(a[2] - b[2], 2)
  );
}

function colorToBortleAndSky(rgb: [number, number, number]) {
  let minDist = Infinity;
  let result = { bortle: "-", sky: "-" };
  for (const entry of COLOR_TABLE) {
    const dist = colorDist(rgb, entry.rgb as [number, number, number]);
    if (dist < minDist) {
      minDist = dist;
      result = { bortle: entry.bortle, sky: entry.sky };
    }
  }
  return result;
}

// 地圖點擊處理
function OverlayColorClickHandler({
  canvasRef,
  onResult,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onResult: (result: {
    lat: number;
    lng: number;
    bortle: string;
    sky: string;
  }) => void;
}) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      // 經緯度轉像素
      const x = Math.round(
        ((lng - IMG_LNG_MIN) / (IMG_LNG_MAX - IMG_LNG_MIN)) * w
      );
      const y = Math.round(
        ((IMG_LAT_MAX - lat) / (IMG_LAT_MAX - IMG_LAT_MIN)) * h
      );
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const rgb: [number, number, number] = [pixel[0], pixel[1], pixel[2]];
      const { bortle, sky } = colorToBortleAndSky(rgb);
      onResult({ lat, lng, bortle, sky });
    },
  });
  return null;
}

const MapPage = () => {
  const [popupInfo, setPopupInfo] = useState<{
    lat: number;
    lng: number;
    bortle: string;
    sky: string;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 預加載無模糊圖片到 canvas
  useEffect(() => {
    const img = new window.Image();
    img.src = "/hk_lightpollution_noblur.png";
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
    };
  }, []);

  const [forecast, setForecast] = useState<
    { date: string; bortle: string; mpsas: number; cloud_cover_mean?: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [apiTimeout, setApiTimeout] = useState(false);

  useEffect(() => {
    setLoading(true);
    setApiTimeout(false);
    const timeout = setTimeout(() => setApiTimeout(true), 8000); // 8 seconds

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    fetch(`${apiUrl}/api/stargazing-forecast`)
      .then((res) => res.json())
      .then((data) => {
        setForecast(data);
        setLoading(false);
        setApiTimeout(false);
        clearTimeout(timeout);
      })
      .catch(() => {
        setForecast([]);
        setLoading(false);
        setApiTimeout(true);
        clearTimeout(timeout);
      });

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className="stargazing-root"
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        paddingTop: "0px", 
        paddingBottom: "0px", 
        paddingLeft: "16px", 
        paddingRight: "16px", 
        boxSizing: "border-box", 
      }}
    >
      <SEO
        title="Hong Kong Stargazing"
        description="Interactive Hong Kong stargazing map showing light pollution levels, sky brightness (Bortle scale), and 7-day stargazing forecast with cloud cover predictions. 香港觀星地圖，顯示光污染程度、天空亮度（波特爾等級）及7天觀星預報。"
        keywords="Hong Kong stargazing, light pollution map, Bortle scale, night sky, astronomy, stargazing forecast, Hong Kong night sky, 香港觀星, 香港觀星地圖, 光污染地圖, 波特爾等級, 觀星預報, 天空亮度, 香港夜空, 天文觀測"
        url="https://westcoastgod-photography.vercel.app/hk-stargazing"
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flex: 1,
        }}
      >
        {/* Stargazing 資訊欄 */}
        <div
          className="info-bar"
          style={{
            width: "100%",
            background: "#23272f",
            color: "#fff",
            padding: 20,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            textAlign: "center",
            margin: "0 auto",
            boxSizing: "border-box",
            position: "relative",
          }}
        >
          <h2 className="text-2xl font-bold mb-2">
            Hong Kong Stargazing Prediction
          </h2>
          {loading ? (
            <div className="forecast-grid">
              {[...Array(7)].map((_, idx) => (
                <div
                  key={idx}
                  className="forecast-card"
                  style={{
                    background: "#fff",
                    borderRadius: 10,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                    padding: 18,
                    minWidth: 120,
                    textAlign: "center",
                    color: "#23272f",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  Predicting...
                </div>
              ))}
            </div>
          ) : (
            <div className="forecast-grid">
              {forecast.length > 0
                ? forecast.map((f, idx) => {
                    const dateObj = new Date(f.date);
                    const dayNames = [
                      "Sunday",
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                    ];
                    let label = dayNames[dateObj.getDay()];
                    if (idx === 0) label = "Today";
                    else if (idx === 1) label = "Tomorrow";
                    // 新增日期字串
                    const dateStr = `${dateObj.getDate()}/${
                      dateObj.getMonth() + 1
                    }`;

                    return (
                      <div
                        key={f.date}
                        className="forecast-card"
                        style={{
                          background: "#fff",
                          borderRadius: 10,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                          padding: 18,
                          minWidth: 120,
                          textAlign: "center",
                          color: "#23272f",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "bold",
                            fontSize: 18,
                            marginBottom: 6,
                          }}
                        >
                          {label}{" "}
                          <span
                            style={{
                              fontWeight: 400,
                              fontSize: 18,
                              marginLeft: 4,
                              color: "black",
                            }}
                          >
                            {dateStr}
                          </span>
                        </div>
                        <div
                          className="stargazing-level"
                          style={{
                            fontSize: 14,
                            marginBottom: 4,
                          }}
                        >
                          <b>Stargazing Level:</b> {f.bortle}
                        </div>
                        <div style={{ fontSize: 14, marginBottom: 4 }}>
                          <b>Sky Brightness:</b> {f.mpsas} MPSAS
                        </div>
                        <div style={{ fontSize: 14 }}>
                          <b>Cloud Cover:</b>{" "}
                          {f.cloud_cover_mean !== undefined
                            ? `${Math.round(f.cloud_cover_mean)}%`
                            : "N/A"}
                        </div>
                      </div>
                    );
                  })
                : [...Array(7)].map((_, idx) => (
                    <div
                      key={idx}
                      className="forecast-card"
                      style={{
                        background: "#fff",
                        borderRadius: 10,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                        padding: 18,
                        minWidth: 120,
                        textAlign: "center",
                        color: "#23272f",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      {apiTimeout ? "API not responding" : "API timeout"}
                    </div>
                  ))}
            </div>
          )}
        </div>
        {/* 地圖視窗 */}
        <div
          className="map-container"
          style={{
            width: "100%",
            flex: 1,
            border: "1px solid #ccc",
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            position: "relative",
            background: "#222",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 0,
          }}
        >
          {/* 地圖右下角提示 */}
          <div
            className="map-tip"
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              background: "rgba(30,30,30,0.85)",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: "8px 0 0 0",
              fontSize: 14,
              zIndex: 450,
              pointerEvents: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              
            }}
          >
            Stargazing level: <b>lower is better</b>
          </div>
          <MapContainer
            center={HONG_KONG_CENTER}
            zoom={DEFAULT_ZOOM}
            style={{ height: "100%", width: "100%" }}
            maxBounds={[
              [21.95, 113.5],
              [22.75, 114.69],
            ]}
            maxBoundsViscosity={1.0}
            minZoom={10}
            maxZoom={18}
            scrollWheelZoom={true}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* 疊加光污染半透明圖片 */}
            <ImageOverlay
              url="/hk_lightpollution.png"
              bounds={[
                [21.95, 113.5],
                [22.75, 114.69],
              ]}
              opacity={0.5}
              zIndex={500}
            />

            {/* 點擊地圖獲取顏色判斷 */}
            <OverlayColorClickHandler
              canvasRef={canvasRef}
              onResult={setPopupInfo}
            />

            {/* 點擊彈窗 */}
            {popupInfo && (
              <Popup
                position={[popupInfo.lat, popupInfo.lng]}
                eventHandlers={{
                  remove: () => setPopupInfo(null),
                }}
              >
                <div>
                  <b>Location</b>: {popupInfo.lat.toFixed(4)},{" "}
                  {popupInfo.lng.toFixed(4)}
                  <br />
                  <b>Sky Brightness</b>: {popupInfo.sky} MPSAS
                  <br />
                  <b>Bortle Level</b>: {popupInfo.bortle}
                </div>
              </Popup>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
