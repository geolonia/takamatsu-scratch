const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const formatMessage = require('format-message');
const {openReverseGeocoder} = require('@geolonia/open-reverse-geocoder');

const Message = {
}

const AvailableLocales = ['en', 'ja', 'ja-Hira'];

class Scratch3GeoloniaBlocks {
    constructor(runtime) {
        this.runtime = runtime;
        this.addr = {
            code: '',
            prefecture: '',
            city: ''
        }
        this.center = {lng: 0, lat: 0}
        this.zoom = 10
        this.features = []
        this.loaded = false
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
                    text: '高松市をズーム [ZOOM] で表示',
                    arguments: {
                        LNG: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        LAT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        ZOOM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: this.zoom,
                        },
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
                    text: '地図の最大ズームレベルを [MINZOOM] に変更する',
                    arguments: {
                        MINZOOM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 4
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
                            defaultValue: '都市計画区域界',
                        },
                        COLOR: {
                            type: ArgumentType.COLOR,
                            defaultValue: '#FF0000',
                        },
                        OPACITY: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.4,
                        },
                    }
                },
                {
                    opcode: 'flyTo',
                    blockType: BlockType.COMMAND,
                    text: "経度 [LNG] 緯度 [LAT] ズーム [ZOOM] にジャンプ",
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
                    text: "地図のズームレベルを [ZOOM] 変更する",
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
                    text: "地図を [DEGREE] 度回転する",
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
                    text: "地図を縦に [DISTANCE] ピクセル移動する",
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
                    text: "地図を横に [DISTANCE] ピクセル移動する",
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
                    text: "都道府県名",
                },
                {
                    opcode: 'getCity',
                    blockType: BlockType.REPORTER,
                    text: "市区町村名",
                },
                {
                    opcode: 'getLat',
                    blockType: BlockType.REPORTER,
                    text: "緯度",
                },
                {
                    opcode: 'getLng',
                    blockType: BlockType.REPORTER,
                    text: "経度",
                },
                {
                    opcode: 'getZoom',
                    blockType: BlockType.REPORTER,
                    text: 'zoom'
                },
                {
                    opcode: 'getName',
                    blockType: BlockType.REPORTER,
                    text: "場所の名前",
                }
            ],
            menus: {
                // TODO：sdk側のmaplibreバージョンを上げてからGSI、ゲーム風のスタイルを有効にする（spriteの配列指定ができない為）
                baseMapStyles: [
                    {text: '標準', value: 'https://geoloniamaps.github.io/gsi/style.json'},
                    // {text: 'GSI', value: 'https://smartmap.styles.geoloniamaps.com/style.json'},
                    {text: '衛星写真', value: 'https://smartcity-satellite.styles.geoloniamaps.com/style.json'}
                    // {text: 'ゲーム風', value: 'https://chizubouken-lab.pages.dev/rpg-style.json'}
                ]
            }
        };
    }

    getLat() {
        return `${this.center.lat.toFixed(4)}`
    }

    getLng() {
        return `${this.center.lng.toFixed(4)}`
    }

    getPref() {
        return this.addr.prefecture
    }

    getCity() {
        return this.addr.city
    }

    getName() {
        for (let i = 0; i < this.features.length; i++) {
            if ('symbol' === this.features[i].layer.type && this.features[i].properties.name) {
                return this.features[i].properties.name
            }
        }

        return ''
    }

    getZoom () {
        return `${Math.round(this.zoom * 1000) / 1000}`;
    }

    displayMap(args) {
        return new Promise((resolve) => {
            const mapContainer = document.getElementById('geolonia')

            if (document.getElementById('geolonia-map')) {
                mapContainer.removeChild(document.getElementById('geolonia-map'))
            }

            div = document.createElement("div");
            div.id = 'geolonia-map';
            div.setAttribute("style", "width:100%;height:100%;");
            div.dataset.navigationControl = 'off';

            mapContainer.appendChild(div);

            this.map = {}

            this.map = new city.Takamatsu.Map({
                container: 'geolonia-map',
                zoom: args.ZOOM,
                pitch: 0,
            })

            this.map.once('load', () => {
                this.map.on('moveend', (e) => {
                    this.center = this.map.getCenter()

                    openReverseGeocoder(Object.values(this.center)).then(res => {
                        this.addr = res
                    })

                    this.features = this.map.queryRenderedFeatures(this.map.project(this.center), {
                        layers: ['poi']
                    })
                })

                this.map.on('zoomend', () => {
                    this.zoom = this.map.getZoom();
                });

                const resizeObserver = new ResizeObserver(entries => {
                    this.map.resize()
                });

                resizeObserver.observe(mapContainer);

                this.loaded = true

                resolve()
            })
        })
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

    setBaseMap(args) {
        if (!this.loaded) {
            // eslint-disable-next-line no-console
            console.error('まず地図を表示してください。');
            return;
        }
        this.map.setStyle(args.STYLE);
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

    addLayer(args) {
        if (!this.loaded) {
            console.error('まず地図を表示してください。')
            return
        }

        this.map.loadData(args.LAYER, {
            'fill-color': args.COLOR,
            'fill-opacity': Number(args.OPACITY),
        })
    }

    zoomTo(args) {
        if (!this.loaded) {
            console.error('まず地図を表示してください。')
            return
        }

        return new Promise((resolve) => {
            this.map.easeTo({
                zoom: this.map.getZoom() + parseFloat(args.ZOOM),
                easing: this.easing
            });

            this.map.once('moveend', () => {
                resolve()
            })
        })
    }

    bearingTo(args) {
        if (!this.loaded) {
            console.error('まず地図を表示してください。')
            return
        }

        return new Promise((resolve) => {
            this.map.easeTo({
                bearing: this.map.getBearing() - args.DEGREE,
                easing: this.easing
            });

            this.map.once('moveend', () => {
                resolve()
            })
        })
    }

    moveVertical(args) {
        if (!this.loaded) {
            console.error('まず地図を表示してください。')
            return
        }

        const promise = new Promise((resolve) => {
            this.map.panBy([0, args.DISTANCE], {
                easing: this.easing
            });

            this.map.once('moveend', () => {
                resolve()
            })
        })

        return promise
    }

    moveHorizontal(args) {
        if (!this.loaded) {
            console.error('まず地図を表示してください。')
            return
        }

        const promise = new Promise((resolve) => {
            this.map.panBy([args.DISTANCE, 0], {
                easing: this.easing
            });

            this.map.once('moveend', () => {
                resolve()
            })
        })

        return promise
    }

    flyTo(args) {
        if (!this.loaded) {
            console.error('まず地図を表示してください。')
            return
        }

        const promise = new Promise((resolve) => {
            this.map.flyTo({center: [args.LNG, args.LAT], zoom: args.ZOOM});

            this.map.once('moveend', () => {
                resolve()
            })
        })

        return promise
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
