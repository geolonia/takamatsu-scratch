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
    if (typeof data === 'string' && /^https?:\/\//.test(data) && data.match(/\.csv(\?.*)?$/i)) {
        return true;
    }
    // 文字列の場合、カンマ区切りのヘッダー行があるか簡易チェック
    if (typeof data === 'string') {
        // 1行目にカンマが含まれていればCSVとみなす（簡易判定）
        const firstLine = data.trim().split('\n')[0];
        if (firstLine && firstLine.includes(',')) {
            return true;
        }
    }
    return false;
};
