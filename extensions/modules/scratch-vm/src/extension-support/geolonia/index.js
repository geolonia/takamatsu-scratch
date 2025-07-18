/* eslint-disable no-undef */
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const {openReverseGeocoder} = require('@geolonia/open-reverse-geocoder');
const {isCSVData, isGeojsonData} = require('./utils');

const AvailableLocales = ['en', 'ja', 'ja-Hira'];

class Scratch3GeoloniaBlocks {


    sourceName = 'custom-markers';

    constructor (runtime) {
        this.runtime = runtime;
        this.addr = {
            code: '',
            prefecture: '',
            city: ''
        };
        this.center = {lng: 0, lat: 0};
        this.zoom = 10;
        this.features = [];
        this.loaded = false;
        this.data = '';
        this.customMarkers = {
            type: 'FeatureCollection',
            features: []
        };
        this.osmPoiLayers = null;
        this.addedLayers = [];
        this.addCustomMarkerNames = [];
    }

    getInfo() {
        this._locale = this.setLocale();

        return {
            id: 'geolonia',
            name: '地図',
            blocks: [
                {
                    opcode: 'displayMap',
                    blockType: BlockType.COMMAND,
                    text: '地図を経度 [LNG] 緯度 [LAT] ズーム [ZOOM] で表示',
                    arguments: {
                        LAT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 35.65
                        },
                        LNG: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 139.74
                        },
                        ZOOM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: this.zoom
                        }
                    }
                },
                {
                    opcode: 'changePitch',
                    blockType: BlockType.COMMAND,
                    text: '地図の傾きを [PITCH] 度に変更する',
                    arguments: {
                        PITCH: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'setBaseMap',
                    blockType: BlockType.COMMAND,
                    text: '背景地図を [STYLE] に変更する',
                    arguments: {
                        STYLE: {
                            type: ArgumentType.STRING,
                            menu: 'baseMapStyles', // ドロップダウンメニューを指定
                            defaultValue: 'https://chizubouken-lab.pages.dev/style.json'
                        }
                    }
                },
                {
                    opcode: 'addSymbolMarker',
                    blockType: BlockType.COMMAND,
                    text: '経度 [LON] 緯度 [LAT] に [ICON] を [NAME] という名前で表示する',
                    arguments: {
                        LAT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 35.65
                        },
                        LON: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 139.74
                        },
                        ICON: {
                            type: ArgumentType.STRING,
                            menu: 'iconMenu',
                            defaultValue: 'pin'
                        },
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'お店'
                        }
                    }
                },
                {
                    opcode: 'changeLayerIcon',
                    blockType: BlockType.COMMAND,
                    text: '[LAYER] のアイコンを [ICON] に変更する',
                    arguments: {
                        LAYER: {
                            type: ArgumentType.STRING,
                            defaultValue: 'お店'
                        },
                        ICON: {
                            type: ArgumentType.STRING,
                            menu: 'iconMenu',
                            defaultValue: 'ピン'
                        }
                    }
                },
                // {
                //     opcode: 'addLayer',
                //     blockType: BlockType.COMMAND,
                //     text: '[NAME] として [DATA] を 色 [COLOR]・透明度 [OPACITY] で表示',
                //     arguments: {
                //         NAME: {
                //             type: ArgumentType.STRING,
                //             defaultValue: 'サンプル'
                //         },
                //         DATA: {
                //             type: ArgumentType.STRING,
                //             defaultValue: 'サンプルデータ'
                //         },
                //         COLOR: {
                //             type: ArgumentType.COLOR,
                //             defaultValue: '#FF0000'
                //         },
                //         OPACITY: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: 0.4
                //         }
                //     }
                // },
                {
                    opcode: 'isTouchingLayer',
                    blockType: BlockType.BOOLEAN,
                    text: 'レイヤー [LAYER] に触れた',
                    arguments: {
                        LAYER: {
                            type: ArgumentType.STRING,
                            defaultValue: 'お店'
                        }
                    }
                },
                {
                    opcode: 'isSpriteClicked',
                    blockType: BlockType.BOOLEAN,
                    text: '[NAME] にマウスが触れた',
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'お店'
                        }
                    }
                },
                {
                    opcode: 'flyTo',
                    blockType: BlockType.COMMAND,
                    text: '経度 [LNG] 緯度 [LAT] ズーム [ZOOM] にジャンプ',
                    arguments: {
                        LNG: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 139.74,
                        },
                        LAT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 35.65,
                        },
                        ZOOM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 10,
                        },
                    }
                },
                {
                    opcode: 'zoomTo',
                    blockType: BlockType.COMMAND,
                    text: '地図のズームレベルを [ZOOM] 変更する',
                    arguments: {
                        ZOOM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1,
                        },
                    }
                },
                {
                    opcode: 'bearingTo',
                    blockType: BlockType.COMMAND,
                    text: '地図を [DEGREE] 度回転する',
                    arguments: {
                        DEGREE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 25,
                        },
                    }
                },
                {
                    opcode: 'moveVertical',
                    blockType: BlockType.COMMAND,
                    text: '地図を縦に [DISTANCE] ピクセル移動する',
                    arguments: {
                        DISTANCE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100,
                        },
                    }
                },
                {
                    opcode: 'moveHorizontal',
                    blockType: BlockType.COMMAND,
                    text: '地図を横に [DISTANCE] ピクセル移動する',
                    arguments: {
                        DISTANCE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100,
                        },
                    }
                },
                {
                    opcode: 'addOSMPoiLayer',
                    blockType: BlockType.COMMAND,
                    text: '[LAYER] を表示する',
                    arguments: {
                        LAYER: {
                            type: ArgumentType.STRING,
                            defaultValue: 'レストラン'
                        }
                    }
                },
                {
                    opcode: 'removeOSMPoiLayer',
                    blockType: BlockType.COMMAND,
                    text: '[LAYER] を非表示にする',
                    arguments: {
                        LAYER: {
                            type: ArgumentType.STRING,
                            defaultValue: 'レストラン'
                        }
                    }
                },
                {
                    opcode: 'setMaxZoom',
                    blockType: BlockType.COMMAND,
                    text: '地図の最大ズームレベルを [MAXZOOM] に変更する',
                    arguments: {
                        MAXZOOM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 18
                        }
                    }
                },
                {
                    opcode: 'setMinZoom',
                    blockType: BlockType.COMMAND,
                    text: '地図の最小ズームレベルを [MINZOOM] に変更する',
                    arguments: {
                        MINZOOM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 4
                        }
                    }
                },
                {
                    opcode: 'getPref',
                    blockType: BlockType.REPORTER,
                    text: '都道府県名',
                },
                {
                    opcode: 'getCity',
                    blockType: BlockType.REPORTER,
                    text: '市区町村名',
                },
                {
                    opcode: 'getLat',
                    blockType: BlockType.REPORTER,
                    text: '緯度',
                },
                {
                    opcode: 'getLng',
                    blockType: BlockType.REPORTER,
                    text: '経度',
                },
                {
                    opcode: 'getZoom',
                    blockType: BlockType.REPORTER,
                    text: 'zoom'
                },
                {
                    opcode: 'getName',
                    blockType: BlockType.REPORTER,
                    text: '場所の名前',
                },
                // {
                //     opcode: 'getData',
                //     blockType: BlockType.REPORTER,
                //     text: 'データ'
                // },
                {
                    opcode: 'setVariable',
                    blockType: BlockType.COMMAND,
                    text: '[VARIABLE_NAME] を [VALUE] にする',
                    arguments: {
                        VARIABLE_NAME: {
                            type: ArgumentType.STRING,
                            menu: 'variableMenu',
                            defaultValue: 'getPref'
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: '沖縄県'
                        }
                    }
                }
            ],
            menus: {
                baseMapStyles: [
                    {text: '標準', value: 'https://basic-v1-background-only.pages.dev/style.json'},
                    {text: '衛星写真', value: 'https://smartcity-satellite.styles.geoloniamaps.com/style.json'},
                    {text: 'ゲーム風', value: 'https://chizubouken-lab.pages.dev/style.json'}
                ],
                variableMenu: function () {
                    const variableNames = [
                        ['都道府県名', 'getPref'],
                        ['市区町村名', 'getCity'],
                        ['緯度', 'getLat'],
                        ['経度', 'getLng'],
                        ['zoom', 'getZoom'],
                        ['場所の名前', 'getName'],
                        ['データ', 'getData']
                    ];
                    return variableNames;
                },
                iconMenu: [
                    {text: 'ピン', value: 'pin'},
                    // {text: '星', value: 'star'},
                    {text: 'モンスター1', value: 'enemy1'},
                    {text: 'モンスター2', value: 'enemy2'},
                    {text: 'モンスター3', value: 'enemy3'},
                    {text: 'モンスター4', value: 'enemy4'},
                    {text: '宝箱', value: 'treasure-chest'},
                    {text: '宝石（黄色）', value: 'jewelry-yellow'},
                    {text: '宝石（青色）', value: 'jewelry-blue'},
                    {text: '宝石（赤色）', value: 'jewelry-red'},
                    {text: '宝石（緑色）', value: 'jewelry-green'},
                    {text: '天使', value: 'angel'},
                    {text: '勇者', value: 'friend1'},
                    {text: 'レストラン', value: 'restaurant'},
                    {text: 'カフェ', value: 'cafe'},
                    {text: 'コンビニ', value: 'convenience'},
                    {text: '病院', value: 'hospital'},
                    {text: '学校', value: 'school'},
                    {text: '博物館', value: 'museum'},
                    {text: 'お城', value: 'castle'},
                    {text: 'お城（敵）', value: 'dark-castle'},
                    {text: '銀行', value: 'bank'},
                    {text: '鉄道駅', value: 'railway'},
                    {text: '駐車場', value: 'parking'},
                    {text: '公園', value: 'park'},
                    {text: '危険マーク', value: 'danger-yellow'},
                    {text: '危険立て札', value: 'danger-red'}
                    // {text: '図書館', value: 'library'},
                    // {text: '郵便局', value: 'post_office'},
                    // {text: 'バス停', value: 'bus'},
                    // {text: '旗', value: 'flag'},
                    // {text: '家', value: 'home'}
                ]
            }
        };
    }

    getLat() {
        return `${this.center.lat.toFixed(4)}`;
    }

    getLng() {
        return `${this.center.lng.toFixed(4)}`;
    }

    getPref() {
        return this.addr.prefecture;
    }

    getCity() {
        return this.addr.city;
    }

    getName() {
        for (let i = 0; i < this.features.length; i++) {
            if ('symbol' === this.features[i].layer.type && this.features[i].properties.name) {
                return this.features[i].properties.name;
            }
        }

        return '';
    }

    getZoom () {
        return `${Math.round(this.zoom * 1000) / 1000}`;
    }

    getData () {
        if (typeof this.data === 'object') {
            return JSON.stringify(this.data);
        }
        return this.data;
    }

    setVariable (args) {
        switch (args.VARIABLE_NAME) {
        case 'getPref':
            this.addr.prefecture = args.VALUE;
            break;
        case 'getCity':
            this.addr.city = args.VALUE;
            break;
        case 'getLat':
            this.center.lat = Number(args.VALUE);
            break;
        case 'getLng':
            this.center.lng = Number(args.VALUE);
            break;
        case 'getZoom':
            this.zoom = Number(args.VALUE);
            break;
        case 'getName':
            // features配列の先頭のnameを書き換える例
            if (this.features.length > 0) {
                this.features[0].properties.name = args.VALUE;
            }
            break;
        case 'getData':
            try {
                this.data = JSON.parse(args.VALUE);
            } catch (e) {
                this.data = args.VALUE;
            }
            break;
        default:
            break;
        }
    }

    displayMap (args) {
        return new Promise((resolve) => {
            const mapContainer = document.getElementById('geolonia');

            if (document.getElementById('geolonia-map')) {
                mapContainer.removeChild(document.getElementById('geolonia-map'));
            }

            div = document.createElement('div');
            div.id = 'geolonia-map';
            div.setAttribute('style', 'width:100%;height:100%;');
            div.dataset.navigationControl = 'off';

            mapContainer.appendChild(div);

            this.map = {};

            this.map = new geolonia.japan.Map({
                container: 'geolonia-map',
                center: [args.LNG, args.LAT],
                zoom: args.ZOOM,
                pitch: 0
            });

            this.map.once('load', () => {
                this.map.on('moveend', (e) => {
                    this.center = this.map.getCenter();
                    this.osmPoiLayers = this.map.getOsmPoiLayers();

                    openReverseGeocoder(Object.values(this.center)).then(res => {
                        this.addr = res;
                    });
                });

                this.map.on('zoomend', () => {
                    this.zoom = this.map.getZoom();
                });

                const resizeObserver = new ResizeObserver(entries => {
                    this.map.resize();
                });

                resizeObserver.observe(mapContainer);

                this.loaded = true;

                resolve();
            });
        });
    }

    // レイヤーのアイコンを変更
    changeLayerIcon (args) {
        if (!this.loaded) {
            console.error('まず地図を表示してください。');
            return;
        }
        const layerIds = this.map.hasLayer(args.LAYER);
        if (layerIds.length > 0) {
            layerIds.forEach(layerId => {
                this.map.changeLayerIcon(layerId, args.ICON, 'chizubouken-lab');
            });
        }
    }

    // クラス内にメソッドを追加
    isTouchingLayer (args, util) {
        if (
            !this.loaded ||
            !this.map ||
            (
                !this.addedLayers.includes(args.LAYER) &&      // レイヤーが追加されてない
                !this.addCustomMarkerNames.includes(args.LAYER)  // 名前が登録されてない
            )
        ) {
            return false;
        }

        // spriteの表示領域
        const bounds = util.target.getBounds();
        if (!bounds) {
            return false;
        }

        const stage = document.getElementById('geolonia');
        const width = stage.offsetWidth;
        const height = stage.offsetHeight;

        // xy座標のbboxを取得
        const bbox = [
            [bounds.left + width / 2, height / 2 - bounds.top],
            [bounds.right + width / 2, height / 2 - bounds.bottom]
        ];

        const layerIds = [];
        const hasLayerName = this.addedLayers.includes(args.LAYER);
        const hasCustomMarkerName = this.addCustomMarkerNames.includes(args.LAYER);

        // レイヤーの名前が追加されてたら
        if (hasLayerName) {
            const layers = this.map.hasLayer(args.LAYER);
            if (layers.length > 0) {
                layerIds.push(...layers);
            }
        }
        // カスタムマーカーの名前が登録されてたら
        if (hasCustomMarkerName) {
            layerIds.push(this.sourceName);
        }
        if (layerIds.length === 0) {
            return false;
        }

        // レイヤーを取得
        const features = this.map.queryRenderedFeatures(bbox, {
            layers: [...layerIds]
        });

        const markerFeatures = features.filter(
            feature => feature.id === this.sourceName ? feature.properties.name === args.LAYER : true
        );

        // 何かフィーチャがあれば「触れている」と判定
        return markerFeatures.length > 0;
    }

    isSpriteClicked (args) {
        if (!this.loaded || !this.map) {
            return false;
        }
        this._prevMouseDown = this._prevMouseDown || false;
        const mouse = this.runtime.ioDevices.mouse;
        const x = mouse.getClientX();
        const y = mouse.getClientY();

        const features = this.map.queryRenderedFeatures([x, y], {
            layers: [this.sourceName]
        });

        const markerFeatures = features.filter(feature => feature.properties.name === args.NAME);

        return markerFeatures.length > 0;
    }

    addOSMPoiLayer (args) {
        if (!this.loaded) {
            console.error('まず地図を表示してください。');
            return;
        }
        if (!this.addedLayers.includes(args.LAYER)) {
            this.addedLayers.push(args.LAYER);
        }
        this.map.loadOsmPoi(args.LAYER, 'chizubouken-lab');
    }

    removeOSMPoiLayer (args) {
        if (!this.loaded) {
            console.error('まず地図を表示してください。');
            return;
        }
        this.map.removeOsmPoi(args.LAYER);
    }

    changePitch (args) {
        if (!this.loaded) {
            console.error('まず地図を表示してください。');
            return;
        }

        return new Promise((resolve) => {
            this.map.easeTo({
                pitch: Number(args.PITCH),
                easing: this.easing
            });

            this.map.once('moveend', () => {
                resolve();
            });
        });
    }

    setBaseMap (args) {
        if (!this.loaded) {
            // eslint-disable-next-line no-console
            console.error('まず地図を表示してください。');
            return;
        }
        this.map.setBaseMapStyle(args.STYLE);
    }

    setMaxZoom (args) {
        if (!this.loaded) {
            console.error('まず地図を表示してください。');
            return;
        }

        this.map.setMaxZoom(Number(args.MAXZOOM));
    }

    setMinZoom (args) {
        if (!this.loaded) {
            console.error('まず地図を表示してください。');
            return;
        }

        this.map.setMinZoom(Number(args.MINZOOM));
    }

    addSymbolMarker (args) {
        if (!this.loaded) {
            console.error('まず地図を表示してください。');
            return;
        }
        
        this.customMarkers.features.push({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [Number(args.LON), Number(args.LAT)]
            },
            properties: {
                icon: `'chizubouken-lab:${args.ICON}` || 'chizubouken-lab:pin',
                name: args.NAME || '',
                lngLat: `${args.LAT}, ${args.LON}`
            }
        });

        // eslint-disable-next-line no-negated-condition
        if (!this.map.getSource(this.sourceName)) {
            this.map.loadGeojson(this.customMarkers, this.sourceName, {
                'marker-symbol': ['get', 'icon'],
                'title': ['get', 'name'],
                'marker-size': 'medium',
                'sprite-sheet': 'chizubouken-lab'
            });
        } else {
            this.map.getSource(this.sourceName).setData(this.customMarkers);
        }

        this.addCustomMarkerNames.push(args.NAME);
    }

    addLayer (args) {
        if (!this.loaded) {
            console.error('まず地図を表示してください。');
            return;
        }

        // geojsonかどうかを確認する
        const isGeojson = isGeojsonData(args.DATA);
        if (isGeojson) {
            this.map.loadGeojson(args.DATA, args.NAME, {
                'fill-color': args.COLOR,
                'fill-opacity': Number(args.OPACITY),
                'marker-color': args.COLOR,
                'stroke': args.COLOR
            });

            return;
        }

        const isCSV = isCSVData(args.DATA);
        if (isCSV) {
            this.map.loadCSV(args.DATA, args.NAME, {
                'fill-color': args.COLOR,
                'fill-opacity': Number(args.OPACITY),
                'marker-color': args.COLOR,
                'stroke': args.COLOR
            });

            return;
        }

        console.error('geojsonまたはCSVデータを指定してください。');
    }

    zoomTo(args) {
        if (!this.loaded) {
            console.error('まず地図を表示してください。');
            return;
        }

        return new Promise((resolve) => {
            this.map.easeTo({
                zoom: this.map.getZoom() + parseFloat(args.ZOOM),
                easing: this.easing
            });

            this.map.once('moveend', () => {
                resolve();
            });
        });
    }

    bearingTo(args) {
        if (!this.loaded) {
            console.error('まず地図を表示してください。');
            return;
        }

        return new Promise((resolve) => {
            this.map.easeTo({
                bearing: this.map.getBearing() - args.DEGREE,
                easing: this.easing
            });

            this.map.once('moveend', () => {
                resolve();
            });
        });
    }

    moveVertical(args) {
        if (!this.loaded) {
            console.error('まず地図を表示してください。');
            return;
        }

        const promise = new Promise((resolve) => {
            this.map.panBy([0, args.DISTANCE], {
                easing: this.easing
            });

            this.map.once('moveend', () => {
                resolve();
            });
        });

        return promise;
    }

    moveHorizontal(args) {
        if (!this.loaded) {
            console.error('まず地図を表示してください。');
            return;
        }

        const promise = new Promise((resolve) => {
            this.map.panBy([args.DISTANCE, 0], {
                easing: this.easing
            });

            this.map.once('moveend', () => {
                resolve();
            });
        });

        return promise;
    }

    flyTo(args) {
        if (!this.loaded) {
            console.error('まず地図を表示してください。');
            return;
        }

        const promise = new Promise((resolve) => {
            this.map.flyTo({center: [args.LNG, args.LAT], zoom: args.ZOOM});

            this.map.once('moveend', () => {
                resolve();
            });
        });

        return promise;
    }

    easing(t) {
        return t * (2 - t);
    }

    setLocale() {
        let locale = formatMessage.setup().locale;
        if (AvailableLocales.includes(locale)) {
            return locale;
        } else {
            return 'en';
        }
    }
}

module.exports = Scratch3GeoloniaBlocks;
