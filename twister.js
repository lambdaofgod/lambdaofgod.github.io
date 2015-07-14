"use strict";

var canvas;
var gl;

var points = [];

var _tesselationDepth = 12; //actually it's 6
var _numTimesToSubdivide = 0;
var _angle = 0;

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

function twist(pt, ang) {
        var x = pt[0];
        var y = pt[1];
        var r = Math.sqrt(Math.pow(x,2) + Math.pow(y,2));
        var cosine = Math.cos(r*ang)
        var sine = Math.sin(r*ang)
        return vec2( x*cosine - y * sine,
                    x*sine + y*cosine);
}

function defaultTwist(pt) {
        return twist(pt,_angle);
}


window.onload = init;

function render() {
    var baseAngle = Math.PI/3;
    var vertices = [
        vec2( 0, 1 ),
        vec2( Math.cos(4*baseAngle), Math.sin(4*baseAngle)),
        vec2( Math.cos(6*baseAngle), Math.sin(6*baseAngle))
    ];
    vertices = vertices.map( function(ar) {return ar.map(function(x) {return x * 0.5});});

    points = [];
    tesselateTriangle( vertices[0], vertices[1], vertices[2],
                    _numTimesToSubdivide);

    points = points.map(function (pt) twist(pt,_angle));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    points = [];
    //requestAnimFrame(render);
}
