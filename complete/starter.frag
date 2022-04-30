// Starting point for frag code is the "RayMarching starting point" and "Over the Moon"
// by Martijn Steinrucken aka The Art of Code/BigWings - 2020
// YouTube: youtube.com/TheArtOfCodeIsCool

#ifdef GL_ES
precision mediump float;
#endif

// Pass in uniforms from the sketch.js file
uniform vec2 u_resolution; 
uniform float iTime;
uniform vec2 iMouse;
uniform int iFrame;

#define PI 3.1415
#define S(x,y,z) smoothstep(x,y,z)
#define B(x,y,z,b) S(x, x+b, z)*S(y+b, y, z)
#define saturate(x) clamp(x,0.,1.)
#define BG backgroundGradient
#define DL diagonalLine
#define MOD3 vec3(.1031,.11369,.13787)

// Initial color for screen
 #define NAVY vec3(7,5,96)/255.

// Define colors scheme
#define LTBROWN vec3(170, 124, 100)/255.
#define DKBROWN vec3(50,42,38)/255.
#define PINKER vec3(255, 57, 255)/255.
#define YELLOW vec3(242,214,65)/255.


// Beginning of terrain shader
// Function to add background color
vec3 backgroundGradient(vec2 uv, vec3 col1, vec3 col2, float m) {
  float k = uv.y*m + m;
  vec3 col = mix(col1, col2, k);
  return col;
}

vec3 gradient(vec3 uv, vec3 col1, vec3 col2, float m) {
  float k = uv.y*m + m;
  vec3 col = mix(col1, col2, k);
  return col;
}

// From from Inigo Quilez
float sdSegment( vec2 uv, vec2 a, vec2 b) {
  vec2 pa = uv-a, ba = b-a;
  float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
  return length( pa-ba*h );
}

// From from Inigo Quilez
float sdEllipse( in vec2 p, in vec2 ab )
{
    p = abs(p); if( p.x > p.y ) {p=p.yx;ab=ab.yx;}
    float l = ab.y*ab.y - ab.x*ab.x;
    float m = ab.x*p.x/l;      float m2 = m*m; 
    float n = ab.y*p.y/l;      float n2 = n*n; 
    float c = (m2+n2-1.0)/3.0; float c3 = c*c*c;
    float q = c3 + m2*n2*2.0;
    float d = c3 + m2*n2;
    float g = m + m*n2;
    float co;
    if( d<0.0 )
    {
        float h = acos(q/c3)/3.0;
        float s = cos(h);
        float t = sin(h)*sqrt(3.0);
        float rx = sqrt( -c*(s + t + 2.0) + m2 );
        float ry = sqrt( -c*(s - t + 2.0) + m2 );
        co = (ry+sign(l)*rx+abs(g)/(rx*ry)- m)/2.0;
    }
    else
    {
        float h = 2.0*m*n*sqrt( d );
        float s = sign(q+h)*pow(abs(q+h), 1.0/3.0);
        float u = sign(q-h)*pow(abs(q-h), 1.0/3.0);
        float rx = -s - u - c*4.0 + 2.0*m2;
        float ry = (s - u)*sqrt(3.0);
        float rm = sqrt( rx*rx + ry*ry );
        co = (ry/sqrt(rm-rx)+2.0*g/rm-m)/2.0;
    }
    vec2 r = ab * vec2(co, sqrt(1.0-co*co));
    return length(r-p) * sign(p.y-r.y);
}


// From Inigo Quilez
float sdBox( vec2 uv, vec2 b )
{
    vec2 d = abs(uv)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

float Zero( vec2 uv, float r) {
  return abs( sdEllipse( uv, vec2(.0425,.085)) ) - .001;
}

vec3 sdOutline( vec2 uv) {
  vec3 col = vec3(0);
  float d1 = abs( sdBox(uv, vec2(.30, .17)) ) - .001;
  float m1 = S(.008, .0, d1);
  float d2 = abs( sdBox(uv, vec2(.32, .19)) ) - .001;
  float m2 = S(.008, .0, d2);
  return col += m1 + m2;
}


vec3 percent( vec2 uv, float scale ) {
   vec3 col = vec3(0);
   float d1 = sdSegment( uv, vec2(.00, -.09), vec2(.1, 0.1) );
   float s1 = S(.008, .0, d1);
   vec2 gv = uv*scale;
   float d2 = Zero(gv - vec2(.03, .1), .01 );
   float s2 = S(.008, .0, d2);
   float d3 = Zero(gv - vec2(.18, -.1), .01 );
   float s3 = S(.008, .0, d3);
   col += s1 + s2 + s3;
   return col;
}

vec3 complete( vec2 uv) {
    vec3 col = vec3(0);
    float d1 = sdSegment( uv,  vec2(-.2, .09), vec2(-.2, -.09) );
    float s1 = S(.008, .0, d1);
    float d2 = Zero( uv - vec2(-.11, 0.), .01 );
    float s2 = S(.008, .0, d2);
    float d3 = Zero( uv - vec2(.02, 0.), .01 );
    float s3 = S(.008, .0, d3);
    vec3 percent = percent( uv - vec2(0.10, 0.), 2.);
    vec3 box = sdOutline(uv);
    col += s1 + s2 + s3 + percent + box;
    return col;
}

// Functions to create clouds


float smax( in float a, in float b, float k)
{
 float h = max( k - abs(a-b), 0.0); 
 return max(a,b) + h*h*0.25/k;
}

float N21( vec2 p) {
    return fract( sin(p.x*100. + p.y*6574.)*5674. );
}

float SmoothNoise(vec2 uv) {
   // lv goes from 0,1 inside each grid
   // check out interpolation for dummies
    vec2 lv = fract(uv);
   
   //vec2 lv = smoothstep(0., 1., fract(uv*10.));  // create grid of boxes 
    vec2 id = floor(uv); // find id of each of the boxes
     lv = lv*lv*(3.-2.*lv); 
    
    // get noise values for each of the corners
    // Use mix function to join together
    float bl = N21(id);
    float br = N21(id+vec2(1,0));
    float b = mix(bl, br, lv.x);
    
    
    float tl = N21(id + vec2(0,1));
    float tr = N21(id+vec2(1,1));
    float t = mix (tl, tr, lv.x);
    
    return mix(b, t, lv.y);
}

float SmoothNoise2 (vec2 uv) {
   float c = SmoothNoise(uv*4.);
     // Layer(or octave) of noise
    // Double frequency of noise; half the amplitude
    c += SmoothNoise(uv*8.)*.5;
    c += SmoothNoise(uv*16.)*.25;
    c += SmoothNoise(uv*32.)*.125;
    c += SmoothNoise(uv*64.)*.0625;
    
    return c/ 2.;  // have to normalize or could go past 1
  
}
// From IQ
// Add rotation matrix to improve noise function
// using coordinates for right triangle
mat2 m = mat2( 0.8, .6, -.6, 0.8);


// IQ coding an eye livestream
float fbm1( vec2 p)
  {
  float f = 0.0;
   f += 0.5000*SmoothNoise( p ) ; p*= m*2.02;
   f += 0.2500*SmoothNoise( p ) ; p*= m*2.03;
   f += 0.1250*SmoothNoise( p ) ; p*= m*2.01;
   f += 0.0625*SmoothNoise( p ) ; p*= m*2.04;
   f /= 0.9375;
   return f;
}

// IQ coding an eye livestream
// this version creates smoother appearance
float fbm2( vec2 p)
  {
  float f = 0.0;
   f += 0.5000*SmoothNoise2( p ) ; p*= m*2.02;
   f += 0.2500*SmoothNoise2( p ) ; p*= m*2.03;
   f += 0.1250*SmoothNoise2( p ) ; p*= m*2.01;
   f += 0.0625*SmoothNoise2( p ) ; p*= m*2.04;
   f /= 0.9375;
   return f;
}

mat2 Rot(float a) {
    float s=sin(a), c=cos(a);
    return mat2(c, -s, s, c);
}

float hash11(float p) {
    // From Dave Hoskins
	vec3 p3  = fract(vec3(p) * MOD3);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

//  1 out, 2 in...
float hash12(vec2 p) {
	vec3 p3  = fract(vec3(p.xyx) * MOD3);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

float remap(float a, float b, float c, float d, float t) {
	return ((t-a) / (b-a)) * (d-c) + c;
}

// Use psuedo random noise to get the height of the mountains
float getHeight(float x) {
//  return sin(x) + sin(x*2.234+.123)*.5 + sin(x*4.45+2.2345)*.25;
 return sin(x)  + sin(x*2.234 + .123)*cos(x) + sin(x*4.45 + 2.234)*.25;
}


float hill(vec2 uv) {
  vec3 col = vec3(0);
  float d = length( uv - vec2( 0., clamp(uv.y, -.5, .5) ) );
  float r = mix(.1, .01, S(-.5,.5, uv.y));
  float m = S(.02, .0, d-r);
  float thickness = .45;
  //float ran = getHeight(uv.x);
  float x = abs(uv.x);
  // Define curvature of hill
  float curvature = (1. - x) * pow(x, 2.) + x * (1. - pow(x, 2.));
  float y = abs(curvature+uv.y);
  
  //Take abs(uv.y) to get convex shape
  float h= S(.01, .0, abs((y)) - thickness);
  
  return h ;
}

 vec4 Layer(vec2 uv, float blur)
  {
     vec4 col = vec4(0);   float x = abs(uv.x);
     float y1 = getHeight(uv.x);
     float y2 = (1. - x) * pow(x, 2.) + x * (1. - pow(x, 2.));
     float y = smax(y1, y2, .2);
    //float y = min(y1, y2);
     col += S(blur, -blur, uv.y + 1.2*y);
  return col;
 }

// Functions to create crt filter
vec2 crt_coords( vec2 uv, float bend) {
    uv -= 0.5;
    uv *= 2.;
    uv.x *= 1. + pow(abs(uv.y)/bend, 2.);
    uv.y *= 1. + pow(abs(uv.x)/bend, 2.);
    uv /= 2.;
    return uv+.5;
}

float vignette(vec2 uv, float size, float smoothness, float edgeRounding)
  {
  uv -= .5;
  uv *= size;
  float amount = sqrt(pow(abs(uv.x), edgeRounding) + pow((uv.y), edgeRounding));
  amount = 1. - amount;
  return S(0., smoothness, amount);
}

float scanline( vec2 uv, float lines, float speed) {
  return sin(uv.y*lines + iTime * speed);
  
}

// Random noise functions
float random(vec2 uv) {
  return fract(sin(dot(uv, vec2(15.15377, 42.43145))) * 15941.5731 * sin( iTime * 0.3));
}

float noise(vec2 uv) {
  vec2 i = floor(uv);
  vec2 f = fract(uv);
  float a = random(i);
  float b = random(i + vec2(1.,0.));
  float c = random( i + vec2(0., 1.));
  float d = random(i + vec2(1.));
  
  vec2 u = S(0., 1., f);
  return mix(a, b, u.x) + (c-a)*u.y * (1. - u.x) + (d-b) * u.x*u.y;
}

float hash(vec2 p)  // replace this by something better
{   
    p = 50.0 * fract(p * 0.3183099 + vec2(0.71,0.113));
    return -1.0+2.0*fract( p.x*p.y*(p.x+p.y) );
}

// float noise( in vec2 p )
// {
//     vec2 i = floor( p );
//     vec2 f = fract( p );
// 	vec2 u = f*f*(3.0-2.0*f);
                     
//     return mix( mix( hash( i + vec2(0.0,0.0) ), 
//                      hash( i + vec2(1.0,0.0) ), u.x),
//                 mix( hash( i + vec2(0.0,1.0) ), 
//                      hash( i + vec2(1.0,1.0) ), u.x), u.y);
// }

float rule(vec2 p)
{
	vec2 uv = p * vec2(u_resolution.x/u_resolution.y,1.0) * 37.0;
    mat2 m = mat2(1.75, 1.25, -1.25,  1.75);
	float f = 0.0;
    f = 0.5000 *noise( uv ); uv = m*uv;
    f += 0.2500*noise( uv ); uv = m*uv;
    f += 0.1250*noise( uv ); uv = m*uv;
    f += 0.0625*noise( uv ); uv = m*uv;
	f = 0.5 + 0.5*f;
    return f;
}

void main( )
{
	vec2 uv = gl_FragCoord.xy / u_resolution.y;
  
    vec2 gv = (gl_FragCoord.xy-.5*u_resolution.xy) / u_resolution.y;
  
    vec2 crt_uv = crt_coords(uv, 4.) ;
    
    float rule = rule(uv);
    float p0 = S(rule, rule + 0.25, iTime*.33);
  
    float t = iTime*.15;
    
    
    uv *= 1.;
   // add a target for the camera
    vec3 ta = vec3(0.0,0.0,0.0);
    
    vec3 ro = ta + vec3(1.5*sin(iTime),0.0,1.5*cos(iTime));  // origin of camera (ta moves camera up)
    
    vec3 ww = normalize( ta - ro); // target minus ray origin
    vec3 uu = normalize( cross(ww,vec3(0.,1.,0.)) );
    vec3 vv = normalize( cross(uu,ww) );
    
    vec3 rd = normalize( gv.x*uu + gv.y*vv + 1.5*ww );  // lens of camera
    
    vec3 col = NAVY;  
    col += complete(gv);
    vec4 color = vec4(col, 1.);
    
    vec4 col_alpha = vec4(BG(crt_uv, YELLOW, PINKER, .3) - 0.5*rd.y, 1.); // sky with gradient 
      //col1 = mix(col1, vec3(0.7,0.75,0.8), exp(-10.0*rd.y) );  // add grey along the horizon by mixing 
    //col1 = mix(col1, vec3(1.), .8*SmoothNoise(uv)); // Add some clouds
  
    float f = fbm2( 5.0 * crt_uv ); // Adjust parameter here to make variation more pronounced
   
    float blur = .005;
    for(float i=0.; i<1.; i+=1./20.) {  
        float scale = mix(2., 1., i*.5);  // make layers further away smaller
        
       vec4 layer = Layer(crt_uv*scale+vec2(t+ i*75., t*.1 + i + .05), blur); // add paralax
        
        // Add some brown color for the mountains
        // Make more distant peaks lighter in color
       
    	layer.rgb *= (1. - i)*LTBROWN; 
        
        col_alpha = mix(col_alpha, layer, layer.a); // Mix the sky with the mountains
    
        
   // }
    }
  
    //col = saturate(col);
    float s1 = scanline(uv, 900., -2.);
    gl_FragColor = mix(col_alpha, vec4(s1), 0.5)*vignette(uv, 1.9, .6, 8.) ;
    gl_FragColor = mix(color, gl_FragColor, p0);
   // gl_FragColor = mix(gl_FragColor, vec4(noise(uv * 75.)), 0.01);
  //gl_FragColor = vec4(mix(col1, scene1, p0), 1.);

}
