"use strict";
/*
    TODO:
    - add fields/sliders for size/orientation/position
    - link above fields with objects
*/
var canvas;
var gl;
var ui;
window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }
    //colorCube();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    //
    //  Load shaders 
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    // OBJECTS INITIALIZATION
    var cone = new Cone();
    cone.scale = [0.3, 0.3, 0.3];
    cone.rotation = [0, 0, 0];
    var objects = [cone];
    //var menu = document.getElementById( "objectList" );
    ui = new UI(objects);
    render();
};
function render() {
    var figures = ui.figures;
    //gl.clearColor(0.0, 0.0, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    figures.forEach(function (figure) {
        var toDraw = figure.getWireframeVertices();
        var incolors = [];
        for (var i = 0; i < toDraw.length; i++) {
            // get black lines
            incolors.push([0.0, 0.0, 0.0, 1.0]);
        }
        var program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);
        // just the usual stuff passed to shaders
        var cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(incolors), gl.STATIC_DRAW);
        var vColor = gl.getAttribLocation(program, "vColor");
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);
        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(toDraw), gl.STATIC_DRAW);
        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        // this bridges parameters from Figure class with shader 
        var vRotation = gl.getAttribLocation(program, "rotation");
        gl.vertexAttrib3f(vRotation, figure.rotation[0], figure.rotation[1], figure.rotation[2]);
        var vScaling = gl.getAttribLocation(program, "scaling");
        gl.vertexAttrib3f(vScaling, figure.scale[0], figure.scale[1], figure.scale[2]);
        var vTranslation = gl.getAttribLocation(program, "translation");
        gl.vertexAttrib3f(vTranslation, figure.position[0], figure.position[1], figure.position[2]);
        gl.drawArrays(gl.LINES, 0, toDraw.length);
    });
    //requestAnimFrame( render );
}
function addArrays(a1, a2) {
    return a1.concat(a2);
}
var UI = (function () {
    function UI(initFigures) {
        var _this = this;
        // where we place objectsMenu, creator and forms
        this.place = document.getElementById("interactions");
        this.figureNumbers = {
            "Cone": 0,
            "Sphere": 0,
            "Cylinder": 0
        };
        this.figures = initFigures;
        this.objectsMenu = document.getElementById("objectsMenu");
        this.createButton = document.getElementById("createButton");
        this.setButton = document.getElementById("setButton");
        this.typeChoice = document.getElementById("typeChoice");
        this.initializeMenus();
        var buttons = this.place.children[0];
        var menus = this.place.children[1];
        var forms = this.place.children[2];
        menus.appendChild(this.objectsMenu);
        menus.appendChild(this.typeChoice);
        // callbacks for buttons
        this.setButton.addEventListener("click", function (event) {
            var getValue = function (name) {
                return parseFloat(document.getElementById(name).value);
            };
            var size = ["sizeX", "sizeY", "sizeZ"].map(getValue);
            console.log(size);
            var orientation = ["angleX", "angleY", "angleZ"].map(getValue);
            var position = ["positionX", "positionY", "positionZ"].map(getValue);
            _this.current.scale = size;
            _this.current.rotation = orientation;
            _this.current.position = position;
            render();
        });
        this.objectsMenu.addEventListener("click", function (event) {
            var index = _this.objectsMenu.selectedIndex;
            _this.current = _this.figures[index];
        });
        this.createButton.addEventListener("click", function (event) {
            var newFig = _this.createFigure(_this.nextType);
            _this.figures.push(newFig);
            _this.addFigure(newFig);
            render();
        });
        // callback for typeChoice 
        this.typeChoice.addEventListener("click", function (event) {
            var index = _this.typeChoice.selectedIndex;
            var kind = _this.typeChoice.options[index].text;
            _this.nextType = kind;
            render();
        });
    }
    UI.prototype.createFigure = function (tp) {
        // get all the stuff from forms/sliders
        var getValue = function (name) {
            return parseInt(document.getElementById(name).value);
        };
        var size = ["sizeX", "sizeY", "sizeZ"].map(getValue);
        var orientation = ["angleX", "angleY", "angleZ"].map(getValue);
        var position = ["positionX", "positionY", "positionZ"].map(getValue);
        var newFigure;
        if (tp == "Cone")
            newFigure = new Cone(size, orientation, position);
        else if (tp == "Sphere")
            newFigure = new Sphere(size, orientation, position);
        else
            newFigure = new Cylinder(size, orientation, position);
        return newFigure;
    };
    UI.prototype.select = function (fig) {
        // link fig's data to fields in document
    };
    UI.prototype.initializeMenus = function () {
        // set initMenu
        for (var i = 0; i < this.figures.length; i++)
            this.addFigure(this.figures[i]);
        // set initMenu callbacks
        // set typeChoice's callbacks
    };
    UI.prototype.addFigure = function (added) {
        this.figureNumbers[added.className] += 1;
        var i = this.figureNumbers[added.className];
        var option = document.createElement("option");
        option.value = i; //.toString();
        option.text = added.className + " " + i;
        if (this.objectsMenu !== null)
            this.objectsMenu.appendChild(option);
    };
    return UI;
})();
// for debugging purposes
//console.log(objects[0].getWireframeVertices().length);
//objects[0].getWireframeVertices().forEach( x =>  console.log(x));
/*
     Representations of objects being modelled
*/
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Figure = (function () {
    function Figure(initSize, initOrientation, initPos, initColor) {
        //check whether arguments have proper size
        if (initSize === void 0) { initSize = Figure.ones; }
        if (initOrientation === void 0) { initOrientation = Figure.zeros; }
        if (initPos === void 0) { initPos = Figure.zeros; }
        if (initColor === void 0) { initColor = Figure.zeros; }
        this.className = "Figure";
        this.scale = initSize;
        this.rotation = initOrientation;
        this.color = initColor;
        this.position = initPos;
        //
    }
    Figure.circleVertices = function (y) {
        var base = [];
        var pi = Math.PI;
        for (var i = 0; i < Figure.accuracy; i++)
            base.push(vec4(Math.cos(i * 2 * pi / Figure.accuracy), y, Math.sin(i * 2 * pi / Figure.accuracy), 1.0));
        return base;
    };
    ;
    Figure.prototype.getWireframeVertices = function () { return []; };
    Figure.prototype.transform = function (by) { };
    Figure.accuracy = 20;
    Figure.zeros = [0, 0, 0];
    Figure.ones = [1, 1, 1];
    return Figure;
})();
var Sphere = (function (_super) {
    __extends(Sphere, _super);
    function Sphere() {
        _super.apply(this, arguments);
        this.className = "Sphere";
        this.vertices = this.initialVertices();
    }
    Sphere.prototype.initialVertices = function () {
        var tmp = [];
        var zs = 2.5 / Figure.accuracy;
        var iterations = Math.floor(1 / zs);
        var moveToSphere = function (v) {
            if (v[1] == 0)
                return v;
            var contr = Math.sqrt(1 - Math.pow(v[1], 2));
            var x = v[0] * contr;
            var z = v[2] * contr;
            return [x, v[1], z, 1];
        };
        for (var h = 0; h <= 1; h += zs) {
            var levelhPlus = Figure.circleVertices(h).map(function (xs) { return moveToSphere(xs); });
            var levelhMinus = Figure.circleVertices(-h).map(function (xs) { return moveToSphere(xs); });
            tmp = tmp.concat(levelhPlus.concat(levelhMinus));
        }
        /*
            DODAC POLUDNIKI
        var second = tmp.map(xs => mult(xs,rotate(Math.PI/2, [0,1,0,1])));
        tmp = tmp.concat(second);
        */
        // add poles
        tmp.push([0, 1, 0, 1]);
        tmp.push([0, -1, 0, 1]);
        return tmp;
    };
    Sphere.prototype.getWireframeVertices = function () {
        return this.vertices;
    };
    return Sphere;
})(Figure);
var Cylinder = (function (_super) {
    __extends(Cylinder, _super);
    function Cylinder() {
        _super.apply(this, arguments);
        this.className = "Cylinder";
        this.topVertices = Figure.circleVertices(0.5);
        this.downVertices = Figure.circleVertices(-0.5);
        this.vertices = addArrays(Figure.circleVertices(0.5), Figure.circleVertices(-0.5));
    }
    Cylinder.prototype.getWireframeVertices = function () {
        var ordered = [];
        for (var i = 0; i < this.topVertices.length; i++) {
            ordered.push(this.topVertices[i]);
            ordered.push(this.downVertices[i]);
        }
        //return ordered; 
        return addArrays(this.vertices, ordered);
    };
    return Cylinder;
})(Figure);
var Cone = (function (_super) {
    __extends(Cone, _super);
    function Cone() {
        _super.apply(this, arguments);
        this.className = "Cone";
        this.vertices = Figure.circleVertices(-0.5);
        this.topVertex = vec4(0.0, 1.0, 0.0, 1.0);
    }
    Cone.prototype.getWireframeVertices = function () {
        var ordered = [];
        for (var i = 1; i < this.vertices.length; i++) {
            ordered.push(this.topVertex);
            ordered.push(this.vertices[i]);
            ordered.push(this.vertices[i]);
            ordered.push(this.vertices[i - 1]);
        }
        ordered.push(this.vertices[0]);
        ordered.push(this.vertices[this.vertices.length - 1]);
        var l = this.vertices.length;
        for (var i = 1; i < l; i++) {
            ordered.push(this.vertices[i]);
            ordered.push(this.vertices[(i + l / 2) % l]);
        }
        return ordered;
    };
    return Cone;
})(Figure);
