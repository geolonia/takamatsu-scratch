/* global describe, it, expect */
import {isGeojsonData, isCSVData} from '../utils';

// isGeojsonDataのテスト
describe('isGeojsonData', () => {
    it('URLが.geojsonでtrue', () => {
        expect(isGeojsonData('https://example.com/data.geojson')).toBe(true);
    });
    it('URLが.jsonでtrue', () => {
        expect(isGeojsonData('https://example.com/data.json')).toBe(true);
    });
    it('URLが.txtでfalse', () => {
        expect(isGeojsonData('https://example.com/data.txt')).toBe(false);
    });
    it('FeatureCollectionオブジェクトでtrue', () => {
        const geojson = {
            type: 'FeatureCollection',
            features: []
        };
        expect(isGeojsonData(geojson)).toBe(true);
    });
    it('FeatureCollection文字列でtrue', () => {
        const geojsonStr = JSON.stringify({
            type: 'FeatureCollection',
            features: []
        });
        expect(isGeojsonData(geojsonStr)).toBe(true);
    });
    it('不正なJSON文字列でfalse', () => {
        expect(isGeojsonData('{"type": "FeatureCollection", "features": ')).toBe(false);
    });
    it('typeが違うオブジェクトでfalse', () => {
        expect(isGeojsonData({type: 'Point', coordinates: [0, 0]})).toBe(false);
    });
});

// isCSVDataのテスト
describe('isCSVData', () => {
    it('URLが.csvでtrue', () => {
        expect(isCSVData('https://example.com/data.csv')).toBe(true);
    });
    it('URLが.geojsonでfalse', () => {
        expect(isCSVData('https://example.com/data.geojson')).toBe(false);
    });
    it('カンマ区切りの文字列でtrue', () => {
        const csv = 'lat,lon,name\n35.6,139.7,東京';
        expect(isCSVData(csv)).toBe(true);
    });
    it('カンマがない文字列でfalse', () => {
        expect(isCSVData('これはカンマがありません')).toBe(false);
    });
    it('空文字でfalse', () => {
        expect(isCSVData('')).toBe(false);
    });
    it('ヘッダーがlat,lonのみでtrue', () => {
        expect(isCSVData('lat,lon\n35.6,139.7')).toBe(true);
    });
    it('ヘッダーが緯度,経度でtrue', () => {
        expect(isCSVData('緯度,経度\n35.6,139.7')).toBe(true);
    });
    it('ヘッダーがlatitude,longitudeでtrue', () => {
        expect(isCSVData('latitude,longitude\n35.6,139.7')).toBe(true);
    });
    it('URLがhttpで.csv拡張子でtrue', () => {
        expect(isCSVData('http://example.com/data.csv')).toBe(true);
    });
    it('URLがhttpsで.csv拡張子でtrue', () => {
        expect(isCSVData('https://example.com/data.csv')).toBe(true);
    });
    it('Googleスプレッドシート公開CSVでtrue', () => {
        expect(isCSVData('https://docs.google.com/spreadsheets/d/e/xxxx/pub?gid=0&single=true&output=csv')).toBe(true);
    });
});
