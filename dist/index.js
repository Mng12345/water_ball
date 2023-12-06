"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var waterwaves = __importStar(require("./waterwaves"));
var d3 = __importStar(require("d3"));
var uid;
(function (uid_1) {
    var chars = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');
    function uid(len) {
        if (len === void 0) { len = 32; }
        var getRandomChar = function (charSet) {
            while (true) {
                var ci = Math.floor(Math.random() * chars.length);
                var c = chars[ci];
                if (charSet[c] === undefined) {
                    charSet[c] = 0;
                    return c;
                }
            }
        };
        var charSet = {};
        var result = [];
        for (var i = 0; i < len; i++) {
            result.push(getRandomChar(charSet));
        }
        return result.join('');
    }
    uid_1.uid = uid;
})(uid || (uid = {}));
var waterball;
(function (waterball) {
    function init(container, points, options, valueFormat, labelFormat) {
        if (valueFormat === void 0) { valueFormat = defaultValueFormat; }
        if (labelFormat === void 0) { labelFormat = defaultLabelFormat; }
        var containerSize = getElementSize(container);
        var options_ = __assign({ frontWaveColor: '#3ACD8E', bgWaveColor: '#53ABD9', waveHeightRatio: 0.5, waveSpeed: 10, borderColor: '#CFE0E5', radiusBound: [computeMinValue(), computeMaxValue()], xForce: 'center', yForce: 'center' }, (options !== null && options !== void 0 ? options : {
            containerWidth: containerSize.w,
            containerHeight: containerSize.h,
        }));
        var createCircle = createCircleFac([computeMinValue(), computeMaxValue()], options_.radiusBound);
        var circles = points.map(createCircle);
        var simulation = d3
            .forceSimulation()
            .force('x', createForceXY('x', options_.xForce, containerSize))
            .force('y', createForceXY('y', options_.yForce, containerSize))
            .force('charge', d3.forceManyBody().strength(0.1))
            .force('collide', d3
            .forceCollide()
            .strength(0.2)
            .radius(function (_node, i) { return circles[i].getRadius(); })
            .iterations(1));
        simulation
            .nodes(circles.map(function (item, index) { return ({ index: index }); }))
            .on('tick', onSimulation.bind(simulation, false))
            .on('end', function () {
            onSimulation.bind(simulation, true)()();
        });
        var destroyWaves = undefined;
        return {
            destroy: destroy,
        };
        function onSimulation(isSimulationEnded) {
            var result = [];
            this.nodes().forEach(function (item, index) {
                if (item.x !== undefined && item.y !== undefined) {
                    result.push({
                        x: item.x,
                        y: item.y,
                        circleData: circles[index],
                    });
                }
            });
            return drawCircles(result, container);
            function drawCircles(circles, container) {
                container.innerHTML = '';
                if (destroyWaves !== undefined) {
                    destroyWaves();
                }
                var circleEles = circles
                    .map(drawCircle)
                    .reduce(function (result, item) {
                    if (item !== undefined) {
                        result.push(item);
                    }
                    return result;
                }, []);
                container.append.apply(container, circleEles.map(function (item) { return item.ele; }));
                return function () {
                    if (destroyWaves !== undefined) {
                        destroyWaves();
                    }
                    var polos = circleEles.map(function (item) { return item.drawWave(); });
                    destroyWaves = function () { return polos.forEach(function (item) { return item === null || item === void 0 ? void 0 : item.destroy(); }); };
                };
                function drawCircle(circle) {
                    var div = document.createElement('div');
                    div.style.width = "".concat(circle.circleData.getRadius() * 2, "px");
                    div.style.height = "".concat(circle.circleData.getRadius() * 2, "px");
                    div.style.position = "absolute";
                    div.style.left = "".concat(circle.x - circle.circleData.getRadius(), "px");
                    div.style.top = "".concat(circle.y - circle.circleData.getRadius(), "px");
                    div.style.borderRadius = "50%";
                    div.style.border = isSimulationEnded ? 'none' : "solid 2px #CFE0E5";
                    var canvasId = "_".concat(uid.uid());
                    div.innerHTML = "<div style=\"position: relative; width: 100%; height: 100%\">\n            <div style=\"position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 1\">\n              <canvas id=\"".concat(canvasId, "\" />\n            </div>\n            <div style=\"position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 1\">\n              <div style=\"text-align: center; margin-top: 10px\">\n                <div style=\"font-size: 20px; color: #FFFFFF;\">").concat(circle.circleData.formatValue(), "</div>\n                <div style=\"font-size: 12px; color: #FFFFFF;\">").concat(circle.circleData.getLabel(), "</div>\n              </div>\n            </div>\n          </div>");
                    var canvas = div.querySelector("#".concat(canvasId));
                    if (!(canvas instanceof HTMLCanvasElement)) {
                        return undefined;
                    }
                    canvas.width = circle.circleData.getRadius() * 2;
                    canvas.height = circle.circleData.getRadius() * 2;
                    canvas.style.width = "".concat(circle.circleData.getRadius() * 2);
                    canvas.style.height = "".concat(circle.circleData.getRadius() * 2);
                    return {
                        ele: div,
                        drawWave: function () { return drawWave(canvas); },
                    };
                    function drawWave(canvas) {
                        return waterwaves.newWaterPolo(canvas, {
                            cW: circle.circleData.getRadius() * 2,
                            cH: circle.circleData.getRadius() * 2,
                            baseY: circle.circleData.getRadius(),
                            nowRange: 0,
                            oneColor: '#3ACD8E',
                            twoColor: '#53ABD9',
                            lineColor: '#CFE0E5',
                        });
                    }
                }
            }
        }
        function destroy() {
            if (destroyWaves !== undefined) {
                destroyWaves();
                destroyWaves = undefined;
            }
        }
        function getElementSize(element) {
            var rect = element.getBoundingClientRect();
            return {
                w: rect.width,
                h: rect.height,
            };
        }
        function createCircleFac(dataBound, radiusBound) {
            return createCircle;
            function createCircle(data) {
                return {
                    getLabel: function () { return labelFormat(data.label); },
                    getValue: function () { return data.value; },
                    getRadius: function () { return boundValue(data.value); },
                    formatValue: function () { return valueFormat(data.value); },
                };
                function boundValue(value) {
                    if (radiusBound[0] === radiusBound[1]) {
                        return radiusBound[0];
                    }
                    return (((value - dataBound[0]) / (dataBound[1] - dataBound[0])) *
                        (radiusBound[1] - radiusBound[0]) +
                        radiusBound[0]);
                }
            }
        }
        function computeMinValue() {
            return points.reduce(function (min, item) {
                return Math.min(min, item.value);
            }, Number.MAX_VALUE);
        }
        function computeMaxValue() {
            return points.reduce(function (max, item) {
                return Math.max(max, item.value);
            }, Number.MIN_VALUE);
        }
        function createForceXY(type, force, containerSize) {
            var forceF;
            var centerValue;
            switch (type) {
                case 'x': {
                    forceF = d3.forceX;
                    centerValue = containerSize.w / 2;
                    break;
                }
                case 'y': {
                    forceF = d3.forceY;
                    centerValue = containerSize.h / 2;
                    break;
                }
            }
            if (force === 'center') {
                return forceF(centerValue);
            }
            return forceF(function (_node, index) { return force(index); });
        }
    }
    waterball.init = init;
    /**
     * The value formatter function.
     * @param value
     * @returns return the formatted value or html string, like <span>value</span>
     */
    function defaultValueFormat(value) {
        return "".concat(value);
    }
    /**
     * the label formatter function.
     * @param label
     * @returns return the formatted label or html string, like <span>label</span>
     */
    function defaultLabelFormat(label) {
        return label;
    }
})(waterball || (waterball = {}));
exports.default = waterball;
