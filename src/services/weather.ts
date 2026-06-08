import * as Location from 'expo-location';

export const getWeatherTemp = async (): Promise<number | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const location = await Location.getCurrentPositionAsync();
    const { latitude, longitude } = location.coords;

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`
    );
    const data = await response.json();
    return Math.round(data.current?.temperature_2m ?? 0);
  } catch {
    return null;
  }
};
