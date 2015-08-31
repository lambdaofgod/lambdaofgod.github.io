"use :strict";

/*
    TODO: 
    - correct render (it doesn't show all objects) 
    - add documentation to render
 */

type vec = number[];
type mat = vec[];

var canvas;
var gl;
var ui: UI;

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    //
    //  Load shaders 
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // OBJECTS INITIALIZATION
    var initShape= new Cylinder();

    initShape.scale= [0.3, 0.3, 0.3];
    initShape.rotation = [0, 0, 0];

    var objects = [initShape];
    //var menu = document.getElementById( "objectList" );
    ui = new UI(objects);

    render();
}

function render() {
    var figures = ui.figures;

        
    function draw(drawMode, toDraw: vec[]): void {
      var buff = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buff);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(toDraw), gl.STATIC_DRAW); 
      gl.drawArrays(drawMode, 0, toDraw.length);
    }

    //gl.clearColor(0.0, 0.0, 0.5, 1.0);
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    figures.forEach(figure => {
      drawFigure(figure);
    } 
    );
    //requestAnimFrame( render );
}

function drawFigure(figure: Figure) {
  var draw = function(drawMode, toDraw: vec[], color: vec): void {
                 var incolors = [];
          for (var i = 0; i < toDraw.length; i++) {
              // get black lines
              incolors.push(color);
          }

          var program = initShaders( gl, "vertex-shader", "fragment-shader" );
          gl.useProgram( program );

          // just the usual stuff passed to shaders
          var cBuffer = gl.createBuffer();
          gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
          gl.bufferData( gl.ARRAY_BUFFER, flatten(incolors), gl.STATIC_DRAW );

          var vColor = gl.getAttribLocation( program, "vColor" );
          gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
          gl.enableVertexAttribArray( vColor );
          
        // WIREFRAME VERTICES DATA
          var toDrawBuffer = gl.createBuffer();
          gl.bindBuffer( gl.ARRAY_BUFFER, toDrawBuffer );
          gl.bufferData( gl.ARRAY_BUFFER, flatten(toDraw), gl.STATIC_DRAW );

          var vPosition = gl.getAttribLocation( program, "vPosition" );
          gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
          gl.enableVertexAttribArray( vPosition );

          // this bridges parameters from Figure class with shader 
          var vRotation = gl.getAttribLocation( program, "rotation");
          gl.vertexAttrib3f(vRotation, figure.rotation[0], figure.rotation[1], figure.rotation[2]);
          
          var vScaling = gl.getAttribLocation( program, "scaling" );
          gl.vertexAttrib3f(vScaling, figure.scale[0], figure.scale[1], figure.scale[2]);
          
          var vTranslation = gl.getAttribLocation( program, "translation" );
          gl.vertexAttrib3f(vTranslation, figure.position[0], figure.position[1], figure.position[2]);

          
          gl.drawArrays(drawMode, 0, toDraw.length);
  }
 
  var wireframeMode = null;
  var solidMode = null;
  // for cone
  wireframeMode = gl.LINES; 
  solidMode = gl.TRIANGLE_STRIP

  draw(wireframeMode, figure.getWireframeVertices(), [1.0, 1.0, 1.0, 1.0]);
  draw(solidMode, figure.getSolidVertices(), [0.0, 0.0, 0.0, 1.0]);
}

function addArrays(a1: vec[], a2: vec[]) {
    return a1.concat(a2);
}
// for debugging purposes
//console.log(objects[0].getWireframeVertices().length);
//objects[0].getWireframeVertices().forEach( x =>  console.log(x));
