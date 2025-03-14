// Радіус Землі в метрах
const EARTH_RADIUS = 6371000;

/**
 * Обчислює відстань між двома точками на Землі за формулою гаверсинусів
 * @param lat1 Широта першої точки
 * @param lon1 Довгота першої точки
 * @param lat2 Широта другої точки
 * @param lon2 Довгота другої точки
 * @returns Відстань у метрах
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  // Конвертуємо градуси в радіани
  const lat1Rad = toRadians(lat1);
  const lon1Rad = toRadians(lon1);
  const lat2Rad = toRadians(lat2);
  const lon2Rad = toRadians(lon2);

  // Різниця координат
  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;

  // Формула гаверсинусів
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Відстань у метрах
  return EARTH_RADIUS * c;
};

/**
 * Конвертує градуси в радіани
 * @param degrees Кут у градусах
 * @returns Кут у радіанах
 */
const toRadians = (degrees: number): number => {
  return degrees * Math.PI / 180;
}; 