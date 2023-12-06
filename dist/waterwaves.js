"use strict";
/**
 * This file is cloned and modified from repo waterwaves
 * https://github.com/acdseen/waterWaves.git
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.newWaterPolo = void 0;
function newWaterPolo(canvas, options) {
    var finalOptions = __assign({ 
        //外边距
        wrapW: 3, lineWidth: 2, 
        //上层波浪宽度，数越小越宽
        oneWaveWidth: 0.06, 
        //下层波浪宽度
        twoWaveWidth: 0.06, 
        //上层波浪高度，数越大越高
        oneWaveHeight: 8, 
        //下层波浪高度
        twoWaveHeight: 8, 
        //上层波浪x轴偏移量
        oneOffsetX: 10, 
        //下层波浪x轴偏移量
        twoOffsetX: 20, 
        //波浪滚动速度，数越大越快
        speed: 0.05 }, options);
    var ctx = canvas.getContext('2d');
    if (ctx === null) {
        return undefined;
    }
    return init(ctx);
    function init(ctx) {
        canvas.width = options.cW;
        canvas.height = options.cH;
        ctx.lineWidth = finalOptions.lineWidth;
        //圆属性
        var r = options.cH / 2; //圆心
        var drawCircle = function (ctx) {
            ctx.strokeStyle = options.lineColor;
            ctx.lineWidth = finalOptions.lineWidth;
            ctx.beginPath();
            ctx.arc(r, r, r - 1, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
            ctx.beginPath();
            ctx.arc(r, r, r - 4, 0, 2 * Math.PI);
            ctx.clip();
            ctx.closePath();
        };
        drawCircle(ctx); //画圆
        var destroy = false;
        function drawFrame() {
            ctx.clearRect(0, 0, options.cW, options.cH);
            //高度改变动画参数
            var tmp = 1;
            if (options.nowRange <= options.baseY) {
                options.nowRange += tmp;
            }
            if (options.nowRange > options.baseY) {
                options.nowRange -= tmp;
            }
            makeLiquaid(ctx, finalOptions.oneOffsetX, finalOptions.oneWaveWidth, finalOptions.oneWaveHeight, finalOptions.oneColor);
            makeLiquaid(ctx, finalOptions.twoOffsetX, finalOptions.twoWaveWidth, finalOptions.twoWaveHeight, finalOptions.twoColor);
            finalOptions.oneOffsetX += finalOptions.speed;
            finalOptions.twoOffsetX += finalOptions.speed;
            if (!destroy) {
                window.requestAnimationFrame(drawFrame);
            }
            function makeLiquaid(ctx, xOffset, waveWidth, waveHeight, color) {
                ctx.save();
                var points = []; //用于存放绘制Sin曲线的点
                ctx.beginPath();
                //在x轴上取点
                for (var x = 0; x < options.cW; x += 20 / options.cW) {
                    //此处坐标(x,y)的取点，依靠公式 “振幅高*sin(x*振幅宽 + 振幅偏移量)”
                    var y = -Math.sin(x * waveWidth + xOffset);
                    //液面高度百分比改变
                    var dY = options.cH * (1 - options.nowRange / 100);
                    points.push([x, dY + y * waveHeight]);
                    ctx.lineTo(x, dY + y * waveHeight);
                }
                //封闭路径
                ctx.lineTo(options.cW, options.cH);
                ctx.lineTo(0, options.cH);
                ctx.lineTo(points[0][0], points[0][1]);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.restore();
            }
        }
        drawFrame();
        return {
            destroy: function () { return (destroy = true); },
        };
    }
}
exports.newWaterPolo = newWaterPolo;
