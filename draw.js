"use strict";

var canvas;
var gl;

var maxNumTriangles = 200;
var maxNumVertices  = 3 * maxNumTriangles;
var index = 0;
var first = true;

var t1, t2, t3, t4;

var cIndex = 0;

var colors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT );

    var helpers = {
        
        getMouseCoord : function (event) {
            return vec2(2*event.clientX/canvas.width-1,
            2*(canvas.height-event.clientY)/canvas.height-1);
        },
        
    
        addLine : function(t1, t2) {
          console.log("ADDING LINE!");
            
          gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
          // push vertices to buffer
          gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(t2));
          gl.bufferSubData(gl.ARRAY_BUFFER, 8*(index+1), flatten(t1));
          gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
          index += 2;

          t = vec4(colors[cIndex]);
            
          // push colors to buffer
          gl.bufferSubData(gl.ARRAY_BUFFER, 16*(index-2), flatten(t));
          gl.bufferSubData(gl.ARRAY_BUFFER, 16*(index-1), flatten(t));
        
          return index;
        }
    
    }

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var m = document.getElementById("mymenu");

    m.addEventListener("click", function() {
       cIndex = m.selectedIndex;
        });

    var drawing = false;
    canvas.addEventListener("mouseup", function() {
        drawing = false;
    });

    canvas.addEventListener("mousedown", function(event) {
        console.log("drawing");
        drawing = true;
    });

    var oldT = null;
    var currentT;
    canvas.addEventListener("mousemove", function(event) { 
        if (!drawing) return; 
        
        currentT = helpers.getMouseCoord(event);
        if (oldT === null) oldT = currentT;
      
        var distance = function(v1, v2) { 
            return Math.pow(v1[0] - v2[0],2) + Math.pow(v1[1] - v2[1],2);
        }
         
        console.log(currentT); 
        console.log(oldT);
        console.log(distance(currentT,oldT));
        if (0.5 < distance(currentT,oldT)) {
            index = helpers.addLine(oldT,currentT); 
            oldT = currentT;
            currentT = helpers.getMouseCoord(event);
        }
    });

    /*
    canvas.addEventListener("mousedown", function(event){
        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
        if(first) {
          first = false;
          gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer)
          t1 = helpers.getMouseCoord();
        }
        else 
    } );
*/
    render();
}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );
  
  
    //console.log("index " + index); 
    for(var i = 0; i< index; i+=2)
        gl.drawArrays( gl.LINES, i, 2 );

    window.requestAnimFrame(render);

}

