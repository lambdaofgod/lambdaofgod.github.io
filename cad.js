"use :strict";
var canvas;
var gl;
var ui;
window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    //
    //  Load shaders 
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    // OBJECTS INITIALIZATION
    var initShape = new Cylinder();
    initShape.scale = [0.3, 0.3, 0.3];
    initShape.rotation = [0, 0, 0];
    var objects = [initShape];
    //var menu = document.getElementById( "objectList" );
    ui = new UI(objects);
    render();
};
function render() {
    var figures = ui.figures;
    function draw(drawMode, toDraw) {
        var buff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buff);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(toDraw), gl.STATIC_DRAW);
        gl.drawArrays(drawMode, 0, toDraw.length);
    }
    //gl.clearColor(0.0, 0.0, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    figures.forEach(function (figure) {
        drawFigure(figure);
    });
    //requestAnimFrame( render );
}
function drawFigure(figure) {
    var draw = function (drawMode, toDraw, color) {
        var incolors = [];
        for (var i = 0; i < toDraw.length; i++) {
            // get black lines
            incolors.push(color);
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
        // WIREFRAME VERTICES DATA
        var toDrawBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, toDrawBuffer);
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
        gl.drawArrays(drawMode, 0, toDraw.length);
    };
    var wireframeMode = null;
    var solidMode = null;
    // for cone
    wireframeMode = gl.LINES;
    solidMode = gl.TRIANGLE_STRIP;
    draw(wireframeMode, figure.getWireframeVertices(), [1.0, 1.0, 1.0, 1.0]);
    draw(solidMode, figure.getSolidVertices(), [0.0, 0.0, 0.0, 1.0]);
}
function addArrays(a1, a2) {
    return a1.concat(a2);
}
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
        if (initSize === void 0) { initSize = Figure.ones; }
        if (initOrientation === void 0) { initOrientation = Figure.zeros; }
        if (initPos === void 0) { initPos = Figure.zeros; }
        if (initColor === void 0) { initColor = Figure.zeros; }
        this.className = "Figure";
        //check whether arguments have proper size
        var assertion = (initSize.length === 3) && (initOrientation.length === 3) && (initPos.length === 3) && (initColor.length === 3);
        if (!assertion) {
            alert("Failed to create Shape");
            return;
        }
        this.scale = initSize;
        this.rotation = initOrientation;
        this.color = initColor;
        this.position = initPos;
    }
    /** Returns array of vertices
     * laying on a circle with specified y coordinate */
    Figure.circleVertices = function (y) {
        var base = [];
        var pi = Math.PI;
        for (var i = 0; i < Figure.accuracy; i++)
            base.push(vec4(Math.cos(i * 2 * pi / Figure.accuracy), y, Math.sin(i * 2 * pi / Figure.accuracy), 1.0));
        return base;
    };
    ;
    Figure.prototype.getWireframeVertices = function () {
        throw new Error("getWireframeVertices unimplemented");
    };
    Figure.prototype.getSolidVertices = function () {
        throw new Error("getWireframeVertices unimplemented");
    };
    Figure.prototype.transform = function (by) { };
    /* Controls the accuracy of shape's interpolation */
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
        this.centerUp = [0.0, 0.5, 0.0, 1.0];
        this.centerDown = [0.0, -0.5, 0.0, 1.0];
    }
    Cylinder.prototype.getWireframeVertices = function () {
        var ordered = [];
        var len = this.topVertices.length;
        for (var i = 0; i < len; i++) {
            ordered.push(this.topVertices[i]);
            ordered.push(this.centerUp);
            ordered.push(this.centerDown);
            ordered.push(this.downVertices[i]);
            ordered.push(this.topVertices[i]);
        }
        return addArrays(this.vertices, ordered);
    };
    Cylinder.prototype.getSolidVertices = function () {
        // this function is used to 
        var interCalate = function (base, withInter) {
            var intercalated = [];
            for (var i = 0; i < base.length; i++) {
                intercalated.push(withInter);
                intercalated.push(base[i]);
            }
            intercalated.push(base[0]);
            return intercalated;
        };
        var tops = interCalate(this.topVertices, this.centerUp);
        var downs = interCalate(this.downVertices, this.centerDown);
        var middles = [];
        for (var i = 0; i < this.downVertices.length; i += 2) {
            middles.push(downs[i]);
            middles.push(tops[i]);
            middles.push(tops[i + 1]);
            middles.push(downs[i + 1]);
        }
        middles.push(downs[0]);
        middles.push(tops[0]);
        var solidVertices = tops
            .concat(middles)
            .concat(downs);
        return solidVertices;
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
    Cone.prototype.getSolidVertices = function () {
        /*
        var tmp = [this.topVertex];
        tmp = tmp.concat(this.vertices);
        */
        return this.getWireframeVertices();
        ;
    };
    return Cone;
})(Figure);
/* UI - class managing HTML-JS interaction
 *
 * objectsMenu handles selecting/adding objects
 * typeChoice handles type of added elements
 *
 */
var UI = (function () {
    /*
     * THE CONSTRUCTOR
     */
    function UI(initFigures) {
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
        /*
         * BUTTONS' CALLBACKS
         */
        this.addObjectsMenuCallback();
        this.addSettingCallbacks();
        this.addCreationCallback();
        this.addChoiceCallback();
    }
    /* Set current object accordingly  */
    UI.prototype.addObjectsMenuCallback = function () {
        var _this = this;
        this.objectsMenu.addEventListener("click", function (event) {
            var index = _this.objectsMenu.selectedIndex;
            console.log("current is" + index);
            if (index !== 0)
                _this.current = _this.figures[index - 1];
            else
                _this.current = null;
        });
    };
    /* Button for setting parameters of current object
         *
         */
    UI.prototype.addSettingCallbacks = function () {
        var _this = this;
        this.setButton.addEventListener("click", function (event) {
            if (_this.current === null)
                return;
            /* Get value from field that is named fname */
            var sizeSliders = _this.toArray(_this.getElement("size").children);
            var orientationSliders = _this.toArray(_this.getElement("orientation").children);
            var positionSliders = _this.toArray(_this.getElement("position").children);
            var dimToInt = function (dim) {
                if (dim == "X")
                    return 0;
                if (dim == "Y")
                    return 1;
                if (dim == "Z")
                    return 2;
            };
            //sizeSliders.forEach(
            var initSize = sizeSliders.map(_this.getValue);
            var initOrientation = orientationSliders.map(_this.getValue);
            var initPosition = positionSliders.map(_this.getValue);
            console.log(initSize);
            _this.current.scale = initSize;
            _this.current.rotation = initOrientation;
            _this.current.position = initPosition;
            console.log(_this.current.scale);
            console.log(_this.current.rotation);
            console.log(_this.current.position);
            render();
        });
    };
    /* Create new object*/
    UI.prototype.addCreationCallback = function () {
        var _this = this;
        this.createButton.addEventListener("click", function (event) {
            // this means we actually don't want to create new object
            if (_this.current !== null)
                return;
            var newFig = _this.createFigure(_this.nextType);
            _this.figures.push(newFig);
            _this.current = _this.figures[0];
            _this.registerFigure(newFig);
            console.log("added new" + newFig.className);
            render();
        });
    };
    /* Callback for typeChoice */
    UI.prototype.addChoiceCallback = function () {
        var _this = this;
        this.typeChoice.addEventListener("click", function (event) {
            var index = _this.typeChoice.selectedIndex;
            var kind = _this.typeChoice.options[index].text;
            _this.nextType = kind;
            render();
        });
    };
    /* Create new Figure of specified type */
    UI.prototype.createFigure = function (tp) {
        // get all the stuff from forms/sliders
        var sizeSliders = this.toArray(this.getElement("size").children);
        var orientationSliders = this.toArray(this.getElement("orientation").children);
        var positionSliders = this.toArray(this.getElement("position").children);
        var initSize = sizeSliders.map(this.getValue);
        var initOrientation = orientationSliders.map(this.getValue);
        var initPosition = positionSliders.map(this.getValue);
        var newFigure;
        if (tp == "Cone")
            newFigure = new Cone(initSize, initOrientation, initPosition);
        else if (tp == "Sphere")
            newFigure = new Sphere(initSize, initOrientation, initPosition);
        else
            newFigure = new Cylinder(initSize, initOrientation, initPosition);
        return newFigure;
    };
    UI.prototype.select = function (fig) {
        // link fig's data to fields in document
    };
    UI.prototype.initializeMenus = function () {
        // set initMenu
        for (var i = 0; i < this.figures.length; i++)
            this.registerFigure(this.figures[i]);
        if (this.figures != [])
            this.current = this.figures[0];
        // set initMenu callbacks
        // set typeChoice's callbacks
    };
    /* Add specified figure to array of Figures
     */
    UI.prototype.registerFigure = function (added) {
        if (added === null)
            return;
        this.figureNumbers[added.className] += 1;
        var i = this.figureNumbers[added.className];
        var option = document.createElement("option");
        option.value = i; //.toString();
        option.text = added.className + " " + i;
        if (this.objectsMenu !== null)
            this.objectsMenu.appendChild(option);
    };
    UI.prototype.getElement = function (fname) {
        return document.getElementById(fname);
    };
    UI.prototype.getValue = function (elem) {
        return parseFloat(elem.value);
    };
    UI.prototype.toArray = function (coll) {
        var ar = [];
        for (var i = 0; i < coll.length; i++)
            ar.push(coll[i]);
        return ar;
    };
    return UI;
})();
