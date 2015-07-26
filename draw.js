"use strict";

var canvas;
var gl;

var maxNumTriangles = 200;
var maxNumVertices  = 3 * maxNumTriangles;
var index = 0;
var first = true;

var t1, t2, t3, t4, t;

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
        
    
        addPoint: function(t1) {
          console.log("ADDING A POINT!");
            
          gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
          // push vertices to buffer
          gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(t1));
          gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
          index += 1;

          t = vec4(colors[cIndex]);
            
          // push colors to buffer
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
    
    window.oldT = null;

    //var oldT = null;
    canvas.addEventListener("mousemove", function(event) { 
        if (!drawing) return; 
        
        var currentT = helpers.getMouseCoord(event);
        if (window.oldT == null) window.oldT = currentT;
      
        var distance = function(v1, v2) { 
            return Math.pow(v1[0] - v2[0],2) + Math.pow(v1[1] - v2[1],2);
        }
         
        console.log(currentT); 
        console.log(window.oldT);
        console.log(distance(currentT,oldT));
        if (0.05 < distance(currentT,oldT)) {
            index = helpers.addPoint(currentT); 
            window.oldT = null;
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
    //for(var i = 0; i< index; i++)
     gl.lineWidth(5);
     gl.drawArrays( gl.LINE_STRIP, 0, index );

    window.requestAnimFrame(render);

}

