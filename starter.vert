#ifdef GL_ES
precision mediump float;
#endif

// our vertex data
attribute vec3 aPosition;

void main() {

  // Copy the position data into a vec4, adding 1.0 as the w parameter
 
  vec4 positionVec4 = vec4(aPosition, 1.0);
  
  // Scale to make the output fit the canvas
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0; 

  // Send the vertex information on to the fragment shader
  gl_Position = positionVec4;
}