import pandas as pd
from datetime import datetime

# File paths
nsb_path = r"C:\Users\cxoox\Desktop\star_analysis\nsb_sun_moon.csv"
weather_path = r"C:\Users\cxoox\Desktop\star_analysis\history_weather.csv"
output_path = r"C:\Users\cxoox\Desktop\star_analysis\merged_nsb_weather.csv"


# Helper to parse mixed date formats
def parse_date(date_str):
    for fmt in ("%m/%d/%Y", "%m/%d/%y"):
        try:
            return datetime.strptime(str(date_str), fmt)
        except Exception:
            continue
    return pd.NaT


# Read NSB file
df_nsb = pd.read_csv(nsb_path)
df_nsb = df_nsb[df_nsb.notna().sum(axis=1) > 1]

# Parse mixed date formats in NSB
df_nsb["Date"] = df_nsb["Date"].apply(parse_date)
df_nsb["Date"] = df_nsb["Date"].dt.strftime("%Y-%m-%d")

# Read weather file, skip metadata rows (header is on line 4, so skip 3)
df_weather = pd.read_csv(weather_path, skiprows=3)
df_weather["Date"] = pd.to_datetime(df_weather["time"], errors="coerce").dt.strftime(
    "%Y-%m-%d"
)
df_weather = df_weather.drop(columns=["time"])

# Merge: left join, so all NSB dates are kept, weather is merged in
merged = pd.merge(df_nsb, df_weather, on="Date", how="left")

# Reorder columns: Date, Max Night Sky Brightness (MPSAS), then the rest
cols = merged.columns.tolist()
cols.remove("Date")
cols.remove("Max Night Sky Brightness (MPSAS)")
ordered_cols = ["Date", "Max Night Sky Brightness (MPSAS)"] + cols
merged = merged[ordered_cols]

# Save to CSV
merged.to_csv(output_path, index=False)
print(f"Merged file saved to: {output_path}")
