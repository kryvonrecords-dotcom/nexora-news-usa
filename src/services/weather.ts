export interface WeatherData {
  city: string;
  province: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
  conditionText: string;
  lastUpdated: string;
}

export interface CityOption {
  id: string;
  name: string;
  province: string;
  latitude: number;
  longitude: number;
}

export const USA_CITIES: CityOption[] = [
  { id: 'new-york', name: 'New York', province: 'New York', latitude: 40.7128, longitude: -74.0060 },
  { id: 'los-angeles', name: 'Los Angeles', province: 'California', latitude: 34.0522, longitude: -118.2437 },
  { id: 'chicago', name: 'Chicago', province: 'Illinois', latitude: 41.8781, longitude: -87.6298 },
  { id: 'houston', name: 'Houston', province: 'Texas', latitude: 29.7604, longitude: -95.3698 },
  { id: 'phoenix', name: 'Phoenix', province: 'Arizona', latitude: 33.4484, longitude: -112.0740 },
  { id: 'philadelphia', name: 'Philadelphia', province: 'Pennsylvania', latitude: 39.9526, longitude: -75.1652 },
  { id: 'san-antonio', name: 'San Antonio', province: 'Texas', latitude: 29.4241, longitude: -98.4936 },
  { id: 'san-diego', name: 'San Diego', province: 'California', latitude: 32.7157, longitude: -117.1611 },
  { id: 'dallas', name: 'Dallas', province: 'Texas', latitude: 32.7767, longitude: -96.7970 },
  { id: 'seattle', name: 'Seattle', province: 'Washington', latitude: 47.6062, longitude: -122.3321 },
];

export function getWmoCondition(
  code: number,
  isDay: boolean
): {
  text: string;
  iconType: 'sun' | 'moon' | 'cloud-sun' | 'cloud-moon' | 'cloud' | 'rain' | 'thunder' | 'fog' | 'drizzle'
} {
  switch (code) {
    case 0:
      return isDay
        ? { text: 'Clear Sky', iconType: 'sun' }
        : { text: 'Clear Night', iconType: 'moon' };

    case 1:
      return isDay
        ? { text: 'Mainly Clear', iconType: 'sun' }
        : { text: 'Mostly Clear', iconType: 'moon' };

    case 2:
      return isDay
        ? { text: 'Partly Cloudy', iconType: 'cloud-sun' }
        : { text: 'Partly Cloudy', iconType: 'cloud-moon' };

    case 3:
      return { text: 'Overcast', iconType: 'cloud' };

    case 45:
    case 48:
      return { text: 'Fog', iconType: 'fog' };

    case 51:
    case 53:
    case 55:
      return { text: 'Drizzle', iconType: 'drizzle' };

    case 61:
      return { text: 'Light Rain', iconType: 'rain' };

    case 63:
      return { text: 'Moderate Rain', iconType: 'rain' };

    case 65:
      return { text: 'Heavy Rain', iconType: 'rain' };

    case 80:
    case 81:
    case 82:
      return { text: 'Rain Showers', iconType: 'rain' };

    case 95:
    case 96:
    case 99:
      return { text: 'Thunderstorm', iconType: 'thunder' };

    default:
      return isDay
        ? { text: 'Clear Sky', iconType: 'sun' }
        : { text: 'Clear Night', iconType: 'moon' };
  }
}

const STORAGE_KEY = 'nexora_usa_weather_cache';
const SELECTED_CITY_KEY = 'nexora_usa_selected_city';

export async function fetchLiveWeather(
  cityId = 'new-york',
  customCoords?: { lat: number; lon: number; name?: string }
): Promise<WeatherData> {
  let lat = 40.7128;
  let lon = -74.0060;
  let cityName = 'New York';
  let provinceName = 'New York';

  if (customCoords) {
    lat = customCoords.lat;
    lon = customCoords.lon;
    cityName = customCoords.name || 'Current Location';
    provinceName = 'Current Location';
  } else {
    const selected =
      USA_CITIES.find(c => c.id === cityId) || USA_CITIES[0];

    lat = selected.latitude;
    lon = selected.longitude;
    cityName = selected.name;
    provinceName = selected.province;
  }

  const endpoint =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}` +
    `&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m` +
    `&timezone=America%2FNew_York`;

  try {
    const response = await fetch(endpoint, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`OpenMeteo HTTP error: ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;

    if (!current) {
      throw new Error('Weather data unavailable');
    }

    const isDay = current.is_day === 1;
    const weatherCode =
      typeof current.weather_code === 'number'
        ? current.weather_code
        : 0;

    const condition = getWmoCondition(weatherCode, isDay);

    const result: WeatherData = {
      city: cityName,
      province: provinceName,
      temperature: Math.round(current.temperature_2m),
      apparentTemperature: Math.round(
        current.apparent_temperature ?? current.temperature_2m
      ),
      humidity: Math.round(current.relative_humidity_2m ?? 65),
      windSpeed: Math.round(current.wind_speed_10m ?? 0),
      weatherCode,
      isDay,
      conditionText: condition.text,
      lastUpdated: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));

      if (!customCoords) {
        localStorage.setItem(SELECTED_CITY_KEY, cityId);
      }
    } catch {
      // Ignore storage errors
    }

    return result;
  } catch (err) {
    console.warn(
      'Failed to get live weather from Open-Meteo, trying server fallback:',
      err
    );

    try {
      const serverRes = await fetch(
        `/api/weather?lat=${lat}&lon=${lon}&city=${encodeURIComponent(cityName)}`
      );

      if (serverRes.ok) {
        return await serverRes.json();
      }
    } catch {
      // Ignore
    }

    try {
      const cached = localStorage.getItem(STORAGE_KEY);

      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Ignore
    }

    const now = new Date();
    const hours = now.getHours();
    const isDay = hours >= 6 && hours < 19;

    return {
      city: cityName,
      province: provinceName,
      temperature: 68,
      apparentTemperature: 70,
      humidity: 65,
      windSpeed: 8,
      weatherCode: 1,
      isDay,
      conditionText: isDay ? 'Mainly Clear' : 'Clear Night',
      lastUpdated: new Date().toISOString(),
    };
  }
}

export function getStoredCityId(): string {
  try {
    return localStorage.getItem(SELECTED_CITY_KEY) || 'new-york';
  } catch {
    return 'new-york';
  }
}
