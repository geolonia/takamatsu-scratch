/* eslint-disable no-undef */
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const formatMessage = require('format-message');
const {openReverseGeocoder} = require('@geolonia/open-reverse-geocoder');

const Message = {
};

const AvailableLocales = ['en', 'ja', 'ja-Hira'];

class Scratch3GeoloniaBlocks {
    constructor(runtime) {
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
        this.geojson = {
            type: 'FeatureCollection',
            features: []
        };
        this.customMarkers = {
            type: 'FeatureCollection',
            features: []
        };
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
                    text: '地図を緯度 [LAT] 経度 [LNG] ズーム [ZOOM] で表示',
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
                            defaultValue: '標準'
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
                    opcode: 'addSymbolMarker',
                    blockType: BlockType.COMMAND,
                    text: '緯度 [LAT] 経度 [LON] に [ICON] を [NAME] という名前で表示する',
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
                            defaultValue: 'map-pin'
                        },
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'お店'
                        }
                    }
                },
                {
                    opcode: 'addLayer',
                    blockType: BlockType.COMMAND,
                    text: 'レイヤー [LAYER] を 色 [COLOR] 透明度 [OPACITY] で表示',
                    arguments: {
                        LAYER: {
                            type: ArgumentType.STRING,
                            defaultValue: '都市計画区域界'
                        },
                        COLOR: {
                            type: ArgumentType.COLOR,
                            defaultValue: '#FF0000'
                        },
                        OPACITY: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.4
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
                {
                    opcode: 'getGeojson',
                    blockType: BlockType.REPORTER,
                    text: 'geojson'
                },
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
                    {text: '標準', value: 'https://geoloniamaps.github.io/gsi/style.json'},
                    {text: 'GSI', value: 'https://smartmap.styles.geoloniamaps.com/style.json'},
                    {text: '衛星写真', value: 'https://smartcity-satellite.styles.geoloniamaps.com/style.json'},
                    {text: 'ゲーム風', value: 'https://chizubouken-lab.pages.dev/rpg-style.json'}
                ],
                variableMenu: function () {
                    const variableNames = [
                        ['都道府県名', 'getPref'],
                        ['市区町村名', 'getCity'],
                        ['緯度', 'getLat'],
                        ['経度', 'getLng'],
                        ['zoom', 'getZoom'],
                        ['場所の名前', 'getName'],
                        ['geojson', 'getGeojson']
                    ];
                    return variableNames;
                },
                iconMenu: [
                    {text: 'ピン', value: 'map-pin-red'},
                    // {text: '星', value: 'star'},
                    // {text: 'モンスター1', value: 'monster1'},
                    // {text: 'モンスター2', value: 'monster2'},
                    // {text: '宝箱', value: 'treasure'},
                    // {text: '旗', value: 'flag'},
                    // {text: '飲食店', value: 'restaurant'},
                    // {text: 'カフェ', value: 'cafe'},
                    // {text: 'コンビニ', value: 'convenience_store'},
                    {text: '病院', value: 'hospital'},
                    {text: '学校', value: 'preschool'},
                    // {text: '図書館', value: 'library'},
                    // {text: '郵便局', value: 'post_office'},
                    // {text: '銀行', value: 'bank'},
                    // {text: 'バス停', value: 'bus_stop'},
                    // {text: '鉄道駅', value: 'railway_station'},
                    // {text: '駐車場', value: 'parking'},
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

    getGeojson () {
        if (typeof this.geojson === 'object') {
            return JSON.stringify(this.geojson);
        }
        return this.geojson;
    }

    setVariable (args) {
        if (!this.loaded) {
            console.error('まず地図を表示してください。');
            return;
        }

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
        case 'getGeojson':
            try {
                this.geojson = JSON.parse(args.VALUE);
            } catch (e) {
                this.geojson = args.VALUE;
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

                    openReverseGeocoder(Object.values(this.center)).then(res => {
                        this.addr = res;
                    });

                    this.features = this.map.queryRenderedFeatures(this.map.project(this.center), {
                        layers: ['poi']
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
        const sourceName = 'custom-markers';
        
        this.customMarkers.features.push({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [Number(args.LON), Number(args.LAT)]
            },
            properties: {
                icon: `marker:${args.ICON}` || 'marker:map-pin',
                name: args.NAME || '',
                lngLat: `${args.LAT}, ${args.LON}`
            }
        });

        // eslint-disable-next-line no-negated-condition
        if (!this.map.getSource(sourceName)) {
            this.map.loadGeojson(this.customMarkers, sourceName, {
                'marker-symbol': ['get', 'icon'],
                'title': ['get', 'name'],
                'marker-size': 'medium'
            });
        } else {
            this.map.getSource(sourceName).setData(this.customMarkers);
        }
    }

    addLayer (args) {
        if (!this.loaded) {
            console.error('まず地図を表示してください。');
            return;
        }
        // TODO: （点、線、面）レイヤー追加を実装する
        // this.map.loadData(args.LAYER, {
        //     'fill-color': args.COLOR,
        //     'fill-opacity': Number(args.OPACITY),
        // })
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
