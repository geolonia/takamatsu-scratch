/**
 * 四隅の座標配列からbbox（[minX, minY], [maxX, maxY]）を返す関数
 * @param {Array<Array<number>>} corners - 四隅の座標配列
 * @returns {Array<Array<number>>} bbox
 */
export const getBBoxFromCorners = function (corners) {
    const xs = corners.map(c => c[0]);
    const ys = corners.map(c => c[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return [
        [minX, minY],
        [maxX, maxY]
    ];
};
