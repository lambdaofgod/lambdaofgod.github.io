"use strict";

var canvas;
var gl;

var maxNumVertices  = 200;
var index = 0;

var cindex = 0;

var colors = [

    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0)   // cyan
];
var t;
var numPolygons = 0;
var numIndices = [];
numIndices[0] = 0;
var start = [0];
var points = [];

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    console.log("loaded!");

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    var m = document.getElementById("mymenu");

    m.addEventListener("click", function() {
       cindex = m.selectedIndex;
        });

    var a = document.getElementById("Button1")
    a.addEventListener("click", function(){
        console.log("DUPA");
        render();
    });
    
    var drawing = false;
    var old_x, old_y;
     
    var mouseMove = function(event) {
        if (!drawing) return false;
            
        var dX = event.pageX - old_x;  
        var dY = event.pageY - old_y;  
        
        if (5 <  length(vec2(dX,dY))) { 
            var t;
            t  = vec2(2*event.clientX/canvas.width-1,
                2*(canvas.height-event.clientY)/canvas.height-1);
            
            points.push(t);
                        
            event.preventDefault();
        }
        old_x = event.pageX;
        old_y = event.pageY;

        
        render();
    }

  
    canvas.addEventListener("mousedown", function(e) {
        drawing = true;
    });
    
    canvas.addEventListener("mouseup", function(e) {
        drawing = false;
    });
    
    canvas.addEventListener("mousemove", mouseMove);
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    
/*   
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT );
*/

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STATIC_DRAW );
    var vPos = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPos, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPos );

    var cBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW );
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

}

function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.drawArrays( gl.LINE_LOOP,0, points.length); 
   
    console.log("points"); 
    console.log(points); 
}

