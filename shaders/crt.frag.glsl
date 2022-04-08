// much of this taken from: https://babylonjs.medium.com/retro-crt-shader-a-post-processing-effect-study-1cb3f783afbc

#ifdef GL_ES
precision mediump float;
#endif

float PI = 3.14159;

// grab texcoords from vert shader
varying vec2 vTexCoord;

// our texture coming from p5
uniform sampler2D u_tex;
uniform vec2 u_resolution;
vec2 curvature = vec2(5.0); //zoom level of curvature


vec2 curveRemapUV(vec2 uv) {
    // as we near the edge of our screen apply greater distortion using a cubic function
    uv = uv * 2.0 - 1.0;
    vec2 offset = abs(uv.yx) / vec2(curvature.x, curvature.y);
    uv = uv + uv * offset * offset;
    uv = uv * 0.5 + 0.5;
    return uv;
}
 
vec4 scanLineIntensity(float uv, float resolution, float opacity) {
     float intensity = sin(uv * resolution * PI * 2.0);
     intensity = ((0.5 * intensity) + 0.5) * 0.9 + 0.1;
     return vec4(vec3(pow(intensity, opacity)), 1.0);
 }


void main() {
  vec2 uv = vTexCoord;
  uv.y = 1.0 - uv.y; //flip the incoming image texture

  vec2 remappedUV = curveRemapUV(vec2(uv.xy));
  vec4 baseColor = texture2D(u_tex, remappedUV);

  baseColor *= scanLineIntensity(remappedUV.x, u_resolution.y*0.25, 1.0);
  baseColor *= scanLineIntensity(remappedUV.y, u_resolution.x*0.25, 1.0);
  // boosting the brightness, altering the hue to be more blue
  baseColor *= vec4(vec3(1.0, 2.0, 8.0), 1.0) * 2.0;
  
  
  if (remappedUV.x < 0.0 || remappedUV.y < 0.0 || remappedUV.x > 1.0 || remappedUV.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        gl_FragColor = baseColor;
    }
}