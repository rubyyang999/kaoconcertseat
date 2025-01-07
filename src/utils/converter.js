function findBounds(geoJson) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  geoJson.features.forEach(feature => {
    if (
      !feature.geometry ||
      !(feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') ||
      !Array.isArray(feature.geometry.coordinates)
    ) {
      console.warn('Skipping invalid feature:', feature);
      return;
    }

    const coordinates = feature.geometry.type === 'Polygon'
      ? feature.geometry.coordinates
      : feature.geometry.coordinates.flat(1);

    coordinates.forEach(ring => {
      if (!Array.isArray(ring)) {
        console.warn('Skipping invalid ring:', ring);
        return;
      }

      ring.forEach(coord => {
        if (!Array.isArray(coord) || coord.length !== 2) {
          console.warn('Skipping invalid coordinate:', coord);
          return;
        }

        minX = Math.min(minX, coord[0]);
        maxX = Math.max(maxX, coord[0]);
        minY = Math.min(minY, coord[1]);
        maxY = Math.max(maxY, coord[1]);
      });
    });
  });

  return { minX, minY, maxX, maxY };
}


// 轉換座標為百分比
function convertToPercentage(coord, bounds) {
  const x = ((coord[0] - bounds.minX) / (bounds.maxX - bounds.minX)) * 100;
  const y = (1 - (coord[1] - bounds.minY) / (bounds.maxY - bounds.minY)) * 100;
  return [x, y];
}

// 生成區域數據
export function generateAreas(geoJson) {
  const bounds = findBounds(geoJson);

  return geoJson.features
    .filter(
      feature =>
        feature.geometry &&
        (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') &&
        Array.isArray(feature.geometry.coordinates)
    )
    .map(feature => {
      const coordinates = feature.geometry.type === 'Polygon'
        ? feature.geometry.coordinates[0] // 取外環
        : feature.geometry.coordinates.flat(2)[0]; // MultiPolygon 的第一個外環

      const percentageCoords = (Array.isArray(coordinates) ? coordinates : []).map(coord =>
        Array.isArray(coord) && coord.length === 2 ? convertToPercentage(coord, bounds) : [0, 0]
      );

      return {
        id: `area-${feature.properties?.id || 'unknown'}`,
        name: feature.properties?.area || '未命名',
        type: getAreaType(feature.properties?.area || ''),
        price: getPrice(feature.properties?.area || ''),
        coordinates: percentageCoords
          .map(coord => `${coord[0].toFixed(2)}% ${coord[1].toFixed(2)}%`)
          .join(', ')
      };
    });
}



// 根據區域名稱判斷類型
function getAreaType(name) {
  if (name.includes('VIP')) return 'vip';
  if (name.includes('橙')) return 'orange';
  if (name.includes('紅')) return 'red';
  if (name.includes('綠')) return 'green';
  return 'default';
}

// 設置票價
function getPrice(name) {
  if (name.includes('VIP')) return 6280;
  if (name.includes('-2')) return 4200;
  if (name.includes('綠')) return 5280;
  return 6280;
}
