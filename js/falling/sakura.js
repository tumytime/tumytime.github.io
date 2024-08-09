var stop, staticx;
var img = new Image();
img.src =
    "data:image/png;base64,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";

function Sakura(x, y, s, r, fn) {
    this.x = x;
    this.y = y;
    this.s = s;
    this.r = r;
    this.fn = fn;
}
Sakura.prototype.draw = function (cxt) {
    cxt.save();
    var xc = 40 * this.s / 4;
    cxt.translate(this.x, this.y);
    cxt.rotate(this.r);
    cxt.drawImage(img, 0, 0, 40 * this.s, 40 * this.s)
    cxt.restore();
}
Sakura.prototype.update = function () {
    this.x = this.fn.x(this.x, this.y);
    this.y = this.fn.y(this.y, this.y);
    this.r = this.fn.r(this.r);
    if (this.x > window.innerWidth || this.x < 0 || this.y > window.innerHeight || this.y < 0) {
        this.r = getRandom('fnr');
        if (Math.random() > 0.4) {
            this.x = getRandom('x');
            this.y = 0;
            this.s = getRandom('s');
            this.r = getRandom('r');
        } else {
            this.x = window.innerWidth;
            this.y = getRandom('y');
            this.s = getRandom('s');
            this.r = getRandom('r');
        }
    }
}
SakuraList = function () {
    this.list = [];
}
SakuraList.prototype.push = function (sakura) {
    this.list.push(sakura);
}
SakuraList.prototype.update = function () {
    for (var i = 0, len = this.list.length; i < len; i++) {
        this.list[i].update();
    }
}
SakuraList.prototype.draw = function (cxt) {
    for (var i = 0, len = this.list.length; i < len; i++) {
        this.list[i].draw(cxt);
    }
}
SakuraList.prototype.get = function (i) {
    return this.list[i];
}
SakuraList.prototype.size = function () {
    return this.list.length;
}

function getRandom(option) {
    var ret, random;
    switch (option) {
        case 'x':
            ret = Math.random() * window.innerWidth;
            break;
        case 'y':
            ret = Math.random() * window.innerHeight;
            break;
        case 's':
            ret = Math.random();
            break;
        case 'r':
            ret = Math.random() * 6;
            break;
        case 'fnx':
            random = -0.5 + Math.random() * 1;
            ret = function (x, y) {
                return x + 0.5 * random - 1.7;
            };
            break;
        case 'fny':
            random = 1.5 + Math.random() * 0.7
            ret = function (x, y) {
                return y + random;
            };
            break;
        case 'fnr':
            random = Math.random() * 0.03;
            ret = function (r) {
                return r + random;
            };
            break;
    }
    return ret;
}

function startSakura() {
    requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame || window.oRequestAnimationFrame;
    var canvas = document.createElement('canvas'),
        cxt;
    staticx = true;
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    canvas.setAttribute('style', 'position: fixed;left: 0;top: 0;pointer-events: none;');
    canvas.setAttribute('id', 'canvas_sakura');
    document.getElementsByTagName('body')[0].appendChild(canvas);
    cxt = canvas.getContext('2d');
    var sakuraList = new SakuraList();
    for (var i = 0; i < 50; i++) {
        var sakura, randomX, randomY, randomS, randomR, randomFnx, randomFny;
        randomX = getRandom('x');
        randomY = getRandom('y');
        randomR = getRandom('r');
        randomS = getRandom('s');
        randomFnx = getRandom('fnx');
        randomFny = getRandom('fny');
        randomFnR = getRandom('fnr');
        sakura = new Sakura(randomX, randomY, randomS, randomR, {
            x: randomFnx,
            y: randomFny,
            r: randomFnR
        });
        sakura.draw(cxt);
        sakuraList.push(sakura);
    }
    stop = requestAnimationFrame(function () {
        cxt.clearRect(0, 0, canvas.width, canvas.height);
        sakuraList.update();
        sakuraList.draw(cxt);
        stop = requestAnimationFrame(arguments.callee);
    })
}
window.onresize = function () {
    var canvasSnow = document.getElementById('canvas_snow');
}
// 通过home-bg-floor判断是否为首页
img.onload = function () {
    ($('#canvas_sakura').length <=0) && ($('#home-bg-floor').length) && startSakura();
}
document.addEventListener('pjax:send', function (e) {
    if ($('#canvas_sakura').length) {
        var child = document.getElementById("canvas_sakura");
        child.parentNode.removeChild(child);
        window.cancelAnimationFrame(stop);
        staticx = false;
    }
})
function stopp() {
    if (staticx) {
        var child = document.getElementById("canvas_sakura");
        child.parentNode.removeChild(child);
        window.cancelAnimationFrame(stop);
        staticx = false;
    } else {
        startSakura();
    }
}