// much of this taken from: https://babylonjs.medium.com/retro-crt-shader-a-post-processing-effect-study-1cb3f783afbc

#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.1415926538

// grab texcoords from vert shader
varying vec2 vTexCoord;

// our texture coming from p5
uniform sampler2D u_tex;
uniform vec2 u_resolution;
vec2 curvature = vec2(4.5); //zoom level of curvature (lower = curvier)


vec2 curveRemapUV(vec2 uv) {
    // as we near the edge of our screen apply greater distortion using a cubic function
    uv = uv * 2.0 - 1.0;
    vec2 offset = abs(uv.yx) / vec2(curvature.x, curvature.y);
    uv = uv + uv * offset * offset;
    uv = uv * 0.5 + 0.5;
    return uv;
}
 
void main() {
  vec2 uv = vTexCoord;
  uv.y = 1.0 - uv.y; //flip the incoming image texture

  vec2 remappedUV = curveRemapUV(vec2(uv.xy));
  vec4 baseColor = texture2D(u_tex, remappedUV);

  float line_count = 400.0;
  float opacity = 0.65;
  float y_lines = sin(remappedUV.y * line_count * PI * 2.0);
  y_lines = (y_lines * 0.5 + 0.5) * 0.9 + 0.1;
  float x_lines = sin(remappedUV.x * line_count * PI * 2.0);
  x_lines = (x_lines * 0.5 + 0.5) * 0.9 + 0.1;
  vec4 scan_line = vec4(vec3(pow(y_lines, opacity)), 1.0);
  vec4 scan_line_x = vec4(vec3(pow(x_lines, opacity)), 1.0);

  // boosting the brightness, altering the hue to be more blue
  float avg = baseColor.r + baseColor.g + baseColor.b / 3.0;
  if (avg > 0.5) {
    baseColor *= vec4(vec3(0.4, 1.0, 1.2), 1.0) * 8.0;  
  } else {
      baseColor *= vec4(vec3(0.2, 1.2, 1.5), 1.0) * 2.0;  
  }
  

  baseColor *= scan_line;
  baseColor *= scan_line_x;
  
  if (remappedUV.x < 0.0 || remappedUV.y < 0.0 || remappedUV.x > 1.0 || remappedUV.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        gl_FragColor = baseColor;
    }
}