import requests
import statistics
import csv
from datetime import datetime
import numpy as np
import joblib
import warnings
import os
import json

warnings.filterwarnings("ignore", category=UserWarning)

VAR_METHOD = {
    "temperature_2m_mean": "mean",
    "temperature_2m_min": "median",
    "temperature_2m_max": "median",
    "apparent_temperature_mean": "mean",
    "apparent_temperature_max": "mean",
    "apparent_temperature_min": "mean",
    "rain_sum": "median",
    "wind_speed_10m_max": "median",
    "wind_gusts_10m_max": "median",
    "wind_direction_10m_dominant": "median",
    "shortwave_radiation_sum": "mean",
    "et0_fao_evapotranspiration": "mean",
    "cloud_cover_mean": "mean",
    "cloud_cover_max": "mean",
    "cloud_cover_min": "mean",
    "dew_point_2m_mean": "mean",
    "dew_point_2m_min": "mean",
    "dew_point_2m_max": "mean",
    "wind_speed_10m_mean": "median",
    "wind_speed_10m_min": "median",
    "winddirection_10m_dominant": "median",
    "precipitation_sum": "median",
    "snowfall_sum": "median",
    "pressure_msl_mean": "mean",
    "pressure_msl_max": "mean",
    "pressure_msl_min": "mean",
    "surface_pressure_mean": "mean",
    "surface_pressure_max": "mean",
    "surface_pressure_min": "mean",
    "wind_gusts_10m_mean": "median",
    "wind_gusts_10m_min": "median",
    "relative_humidity_2m_mean": "mean",
    "relative_humidity_2m_max": "mean",
    "relative_humidity_2m_min": "mean",
    "et0_fao_evapotranspiration_sum": "mean",
}

# 設定 BASE_DIR 為本檔案所在資料夾
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

CACHE_PATH = os.path.join(BASE_DIR, "data", "forecast_cache.json")
SUN_CSV = os.path.join(BASE_DIR, "data", "Sun_rise_set_2025.csv")
MOON_CSV = os.path.join(BASE_DIR, "data", "Moon_rise_set_2025.csv")
MODEL_PATH = os.path.join(BASE_DIR, "model", "stargazing_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "model", "stargazing_scaler.pkl")


def process_ensemble_grouped(data):
    import math

    if isinstance(data, list):
        data = data[0]
    daily = data["daily"]
    daily_units = data.get("daily_units", {})
    dates = daily["time"]
    date_dict = {date: {"date": date} for date in dates}
    for var, method in VAR_METHOD.items():
        member_keys = [k for k in daily if k.startswith(var + "_member")]
        det_key = f"{var}_icon_seamless"
        unit = daily_units.get(det_key) or daily_units.get(var) or ""
        for idx, date in enumerate(dates):
            values = []
            for mk in member_keys:
                values.append(daily[mk][idx])
            if det_key in daily:
                values.append(daily[det_key][idx])
            values = [
                v
                for v in values
                if v is not None and not (isinstance(v, float) and math.isnan(v))
            ]
            if not values:
                continue
            if method == "mean":
                value = float(statistics.mean(values))
            else:
                value = float(statistics.median(values))
            date_dict[date][var] = value
            date_dict[date][f"{var}_unit"] = unit
    return list(date_dict.values())


def load_times_csv(filepath):
    times = {}
    with open(filepath, newline="", encoding="utf-8-sig") as csvfile:
        reader = csv.DictReader(csvfile, delimiter=",")
        for row in reader:
            date_key = list(row.keys())[0]
            date_obj = datetime.strptime(row[date_key].strip(), "%Y-%m-%d")
            date_str = date_obj.strftime("%Y-%m-%d")
            times[date_str] = {
                "rise": row["RISE"].strip(),
                "transit": row["TRAN."].strip(),
                "set": row["SET"].strip(),
            }
    return times


def merge_astronomy_grouped(processed_weather, sun_times, moon_times):
    for entry in processed_weather:
        date = entry["date"]
        if date in sun_times:
            entry["sun_rise"] = sun_times[date]["rise"]
            entry["sun_transit"] = sun_times[date]["transit"]
            entry["sun_set"] = sun_times[date]["set"]
        if date in moon_times:
            entry["moon_rise"] = moon_times[date]["rise"]
            entry["moon_transit"] = moon_times[date]["transit"]
            entry["moon_set"] = moon_times[date]["set"]
    return processed_weather


def time_to_minutes(tstr):
    if not tstr or tstr in ["", None]:
        return -1
    h, m = map(int, tstr.split(":"))
    return h * 60 + m


def mpsas_to_bortle(mpsas):
    if mpsas >= 21.99:
        return "1"
    elif mpsas >= 21.93:
        return "1-2"
    elif mpsas >= 21.89:
        return "2"
    elif mpsas >= 21.81:
        return "2-3"
    elif mpsas >= 21.69:
        return "3"
    elif mpsas >= 21.51:
        return "3-4"
    elif mpsas >= 21.25:
        return "4"
    elif mpsas >= 20.91:
        return "4-5"
    elif mpsas >= 20.49:
        return "5"
    elif mpsas >= 20.02:
        return "5-6"
    elif mpsas >= 19.50:
        return "6"
    elif mpsas >= 18.95:
        return "6-7"
    elif mpsas >= 18.38:
        return "7"
    elif mpsas >= 17.80:
        return "7-8"
    else:
        return "8-9"


def is_cache_today(cache_path):
    if not os.path.exists(cache_path):
        return False
    try:
        with open(cache_path, "r", encoding="utf-8") as f:
            cache = json.load(f)
        today = datetime.now().strftime("%Y-%m-%d")
        if cache and isinstance(cache, list) and "date" in cache[0]:
            return cache[0]["date"] == today
        return False
    except Exception:
        return False


def save_cache(cache_path, data):
    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_cache(cache_path):
    with open(cache_path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_7day_stargazing_forecast():
    # --- Try cache first ---
    if is_cache_today(CACHE_PATH):
        try:
            return load_cache(CACHE_PATH)
        except Exception:
            pass

    # --- Weather API ---
    url = "https://ensemble-api.open-meteo.com/v1/ensemble?latitude=22.311724466022362&longitude=114.17319166264973&daily=temperature_2m_mean,temperature_2m_min,temperature_2m_max,apparent_temperature_mean,apparent_temperature_min,apparent_temperature_max,wind_speed_10m_mean,wind_speed_10m_min,wind_speed_10m_max,wind_direction_10m_dominant,relative_humidity_2m_mean,relative_humidity_2m_max,relative_humidity_2m_min,wind_gusts_10m_mean,wind_gusts_10m_min,wind_gusts_10m_max,cloud_cover_mean,cloud_cover_min,precipitation_sum,precipitation_hours,rain_sum,pressure_msl_mean,pressure_msl_min,pressure_msl_max,surface_pressure_min,surface_pressure_mean,surface_pressure_max,dew_point_2m_mean,dew_point_2m_min,dew_point_2m_max,et0_fao_evapotranspiration,shortwave_radiation_sum,cloud_cover_max&models=ecmwf_ifs025&timezone=auto&wind_speed_unit=ms"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        processed = process_ensemble_grouped(data)
    else:
        processed = []

    # --- Astronomy Data ---
    sun_times = load_times_csv(SUN_CSV)
    moon_times = load_times_csv(MOON_CSV)
    processed = merge_astronomy_grouped(processed, sun_times, moon_times)

    # --- Model ---
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)

    # --- Prediction ---
    results = []
    for entry in processed:
        features = [
            time_to_minutes(entry.get("sun_rise", None)),
            time_to_minutes(entry.get("sun_transit", None)),
            time_to_minutes(entry.get("sun_set", None)),
            time_to_minutes(entry.get("moon_rise", None)),
            time_to_minutes(entry.get("moon_transit", None)),
            time_to_minutes(entry.get("moon_set", None)),
            entry.get("temperature_2m_mean", 0),
            entry.get("temperature_2m_max", 0),
            entry.get("temperature_2m_min", 0),
            entry.get("apparent_temperature_mean", 0),
            entry.get("apparent_temperature_max", 0),
            entry.get("apparent_temperature_min", 0),
            entry.get("rain_sum", 0),
            entry.get("wind_speed_10m_max", 0),
            entry.get("wind_gusts_10m_max", 0),
            entry.get("wind_direction_10m_dominant", 0),
            entry.get("shortwave_radiation_sum", 0),
            entry.get("et0_fao_evapotranspiration", 0),
            entry.get("cloud_cover_mean", 0),
            entry.get("cloud_cover_max", 0),
            entry.get("cloud_cover_min", 0),
            entry.get("dew_point_2m_mean", 0),
            entry.get("dew_point_2m_min", 0),
            entry.get("dew_point_2m_max", 0),
            entry.get("wind_speed_10m_mean", 0),
            entry.get("wind_speed_10m_min", 0),
            entry.get("winddirection_10m_dominant", 0),
            entry.get("precipitation_sum", 0),
            entry.get("snowfall_sum", 0),
            entry.get("pressure_msl_mean", 0),
            entry.get("pressure_msl_max", 0),
            entry.get("pressure_msl_min", 0),
            entry.get("surface_pressure_mean", 0),
            entry.get("surface_pressure_max", 0),
            entry.get("surface_pressure_min", 0),
            entry.get("wind_gusts_10m_mean", 0),
            entry.get("wind_gusts_10m_min", 0),
            entry.get("relative_humidity_2m_mean", 0),
            entry.get("relative_humidity_2m_max", 0),
            entry.get("relative_humidity_2m_min", 0),
            entry.get("et0_fao_evapotranspiration_sum", 0),
        ]
        X = np.array(features).reshape(1, -1)
        X_scaled = scaler.transform(X)
        y_pred = model.predict(X_scaled)
        mpsas = float(y_pred[0])
        bortle = mpsas_to_bortle(mpsas)
        results.append(
            {
                "date": entry["date"],
                "mpsas": round(mpsas, 2),
                "bortle": bortle,
                "cloud_cover_mean": round(entry.get("cloud_cover_mean", 0), 1),
            }
        )
    # Save results to cache
    save_cache(CACHE_PATH, results)
    return results


# For standalone test
if __name__ == "__main__":
    forecast = get_7day_stargazing_forecast()
    for day in forecast:
        print(
            f"{day['date']}: Bortle {day['bortle']}, {day['mpsas']} mag/arcsec², Cloud Cover: {day['cloud_cover_mean']}%"
        )
