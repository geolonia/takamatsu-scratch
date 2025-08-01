/**
 * GeoJSONデータかどうかを判定する関数
 * @param {string} data - GeoJSONデータまたはURL
 * @returns {boolean} GeoJSONデータであればtrue、そうでなければfalse
 */
export const isGeojsonData = (data) => {
    // URLの場合
    if (typeof data === 'string' && /^https?:\/\//.test(data) && data.match(/\.(geojson|json)(\?.*)?$/i)) {
        return true;
    }
    // オブジェクトの場合
    let geojsonData = data;
    if (typeof data === 'string') {
        try {
            geojsonData = JSON.parse(data);
        } catch (e) {
            return false;
        }
    }
    if (
        geojsonData &&
        geojsonData.type === 'FeatureCollection' &&
        Array.isArray(geojsonData.features)
    ) {
        return true;
    }
    return false;
};


/**
 * CSVデータかどうかを判定する関数
 * @param {string} data - CSVデータまたはURL
 * @returns {boolean} CSVデータであればtrue、そうでなければfalse
 */
export const isCSVData = (data) => {
    // URLの場合
    if (
        typeof data === 'string' &&
        /^https?:\/\//.test(data) &&
        (
            data.match(/\.csv(\?.*)?$/i) ||
            // Googleスプレッドシートの公開CSV形式に対応
            (data.includes('docs.google.com/spreadsheets') && data.includes('output=csv'))
        )
    ) {
        return true;
    }
    // 文字列の場合、カンマ区切りのヘッダー行があるか簡易チェック
    if (typeof data === 'string') {
        const firstLine = data.trim().split('\n')[0].toLowerCase();
        if (
            (firstLine.includes('lat') && firstLine.includes('lon')) ||
            (firstLine.includes('緯度') && firstLine.includes('経度')) ||
            (firstLine.includes('latitude') && firstLine.includes('longitude'))
        ) {
            return true;
        }
    }
    return false;
};
