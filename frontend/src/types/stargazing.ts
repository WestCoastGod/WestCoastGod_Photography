interface WeatherData {
  date: string;
  cloud_cover: number;
  humidity: number;
  temperature: number;
  rainfall: number;
  pressure: number;
}

interface CelestialData {
  sun: {
    rise: string;
    set: string;
  };
  moon: {
    rise: string;
    phase: string;
  };
}

interface SkyBrightness {
  max: number;
  min: number;
  mean: number;
}

export interface StargazingLocation {
  id: string;
  name: string;
  coordinates: [number, number];
  brightness: SkyBrightness;
  weather: WeatherData;
  celestial: CelestialData;
  stargazing_score: number; // 0-5
  last_updated: string;
}

export interface TimeRange {
  start: string;
  end: string;
}
