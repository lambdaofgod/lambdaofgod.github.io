/* I think I refactored this code to an acceptable level, if you think of something is wrong with it please share your thoughts
*/

"use strict";

var canvas;
var gl;

var points = [];

// GLOBALS
var _tesselationDepth = 12; //actually it's 6
var _numTimesToSubdivide = 0;
var _baseAngle = - 2*Math.PI/6;
var _angle = 0;
var _scaling = 0.5;

var _controller = {
    drawFractal : false, 
    drawWireframe : false, 
    changeDrawingFractal : function () {
        this.drawFractal = !this.drawFractal;
    },
    changeDrawingWireframe : function() {
        this.drawWireframe = !this.drawWireframe;
    },
    
    choose : {
        tesselation : function () {
            if (_controller.drawFractal) 
                return tesselateFractal;
            else
                return tesselateTriangle;
        },

        draw : function() {
            if (!_controller.drawWireframe) 
                gl.drawArrays( gl.TRIANGLES, 0, points.length );
            else {
                for (var i = 0; i < points.length; i+=3)
                gl.drawArrays(gl.LINE_LOOP,i,3)
            }
        }
    },

    draw : function(vertices) {
        var mutating = this.choose.tesselation();
        
        mutating( vertices[0], vertices[1], vertices[2],
                        _numTimesToSubdivide);

        points = points.map(defaultTwist);

        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
        gl.clear( gl.COLOR_BUFFER_BIT );
        
        // drawing mode 2nd
        this.choose.draw(); 
    }
};

var bufferId;

function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.


    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, Math.pow(4,_tesselationDepth),gl.STATIC_DRAW );
    //8*Math.pow(3, 6),

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );


    // slider actions
    var slider = document.getElementById("slider"); 
    slider.onchange = function() {
        _numTimesToSubdivide = slider.value;
        render();
    };

    var angleSlider = document.getElementById("angleSlider"); 
    angleSlider.onchange = function() {
    _angle = -angleSlider.value * (4*3.14)/(360);
        render();
    };

    var sizeSlider = document.getElementById("sizeSlider"); 
        sizeSlider.onchange = function() {
        _scaling = 0.5 + sizeSlider.value/100;
        render();
    }
    
    render();
};

function triangle( a, b, c ) {
    points.push( a, b, c );
}

function tesselateTriangle( a, b, c, count ) {
    // check for end of recursion

    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        tesselateTriangle( a, ab, ac, count );
        tesselateTriangle( c, ac, bc, count );
        tesselateTriangle( b, bc, ab, count );
        tesselateTriangle( ab, bc, ac, count);
    }
}

function tesselateFractal( a, b, c, count ) {
    // check for end of recursion

    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        tesselateFractal( a, ab, ac, count );
        tesselateFractal( c, ac, bc, count );
        tesselateFractal( b, bc, ab, count );
    }
}

function defaultTwist(pt) {
    function twist(pt, ang) {
            var x = pt[0];
            var y = pt[1];
            var r = Math.sqrt(Math.pow(x,2) + Math.pow(y,2));
            var cosine = Math.cos(r*ang)
            var sine = Math.sin(r*ang)
            return vec2( x*cosine - y * sine,
                        x*sine + y*cosine);
    }
    return twist(pt,_angle);
}


window.onload = init;

function render() {
    var baseAngle = 2*Math.PI/3;
    var vertices = [
        vec2( 1, 0 ),
        vec2( Math.cos(baseAngle), Math.sin(baseAngle)),
        vec2( Math.cos(2*baseAngle), Math.sin(2*baseAngle))
    ];

    vertices = vertices.map( 
        function(ar) 
            {return ar.map(
                function(x) {return x * _scaling});});

    points = [];

    // drawing mode 
    _controller.draw(vertices);
    
    points = [];
    //requestAnimFrame(render);
}
