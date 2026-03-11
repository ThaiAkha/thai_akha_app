/**
 * Algoritmo Ray-Casting per determinare se un punto è dentro un poligono.
 * Supporta coordinate GeoJSON standard: array di array [lng, lat].
 */
export const isPointInPolygon = (point: { lat: number, lng: number }, polygonCoords: number[][]) => {
    const x = point.lng, y = point.lat;
    let inside = false;

    // polygonCoords è un array di punti [lng, lat]
    // Iteriamo sui segmenti del poligono
    for (let i = 0, j = polygonCoords.length - 1; i < polygonCoords.length; j = i++) {
        const xi = polygonCoords[i][0], yi = polygonCoords[i][1];
        const xj = polygonCoords[j][0], yj = polygonCoords[j][1];

        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

        if (intersect) inside = !inside;
    }

    return inside;
};
