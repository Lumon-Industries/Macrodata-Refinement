// Starting point for frag code is the "RayMarching starting point"
// Layer effect described in  "Over the Moon" tutorial
// by Martijn Steinrucken aka The Art of Code/BigWings - 2020
// YouTube: youtube.com/TheArtOfCodeIsCool

//Dissolve shader code ported from  https://www.shadertoy.com/view/stG3Rh

#ifdef GL_ES
precision mediump float;
#endif

// Pass in uniforms from the sketch.js file
uniform vec2 u_resolution; 
uniform float iTime;
uniform vec2 iMouse;
uniform int iFrame;
vec2 curvature = vec2(4.5);

#define PI 3.1415
#define E 2.71828182846
#define S(x,y,z) smoothstep(x,y,z)
#define B(x,y,z,b) S(x, x+b, z)*S(y+b, y, z)
#define saturate(x) clamp(x,0.,1.)
#define CG colorGradient
#define DL diagonalLine
#define MOD3 vec3(.1031,.11369,.13787)


// Initial color for screen
#define NAVY vec3(32,33,83)/255.
#define AQUA vec3(171,255,233)/255.


// Define colors scheme
// I needed to use exaggerated colors for the sky to avoid ending up with dull colors
#define GREY vec3(153, 138, 119)/255.
#define BROWN vec3(102,67,36)/255.
#define BEIGE vec3(242,170,158)/255.
#define PINKER vec3(255, 57, 255)/255.
#define YELLOW vec3(255,240,90)/255.

// Function to add background color
vec3 colorGradient(vec2 uv, vec3 col1, vec3 col2, float m) {
  float k = uv.y*m + m;
  vec3 col = mix(col1, col2, k);
  return col;
}


// Rotation matrix
mat2 Rot(float a) {
    float s=sin(a), c=cos(a);
    return mat2(c, -s, s, c);
}

vec3 gradient(vec3 uv, vec3 col1, vec3 col2, float m) {
  float k = uv.y*m + m;
  vec3 col = mix(col1, col2, k);
  return col;
}

// Basic sdf functions from Inigo Quilez
// https://iquilezles.org/articles/distfunctions2d/
float sdSegment( vec2 uv, vec2 a, vec2 b) {
  vec2 pa = uv-a, ba = b-a;
  float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
  return length( pa-ba*h );
}

float sdRoundedBox( in vec2 p, in vec2 b, in vec4 r )
{
    r.xy = (p.x>0.0)?r.xy : r.zw;
    r.x  = (p.y>0.0)?r.x  : r.y;
    vec2 q = abs(p)-b+r.x;
    return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
}

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

// Functions to create 100%
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
float sdCloud1( vec2 uv, float x, float y) {
   float d1 = sdRoundedBox(uv  - vec2(x, y), vec2(.14, .040), vec4(.05, .03, .05, .03) );
   float m1 = S(0.008, 0., d1);
   float d2 = sdEllipse(uv - vec2(x - .035, y+.01), vec2(.05, .05));
   float m2 = S(0.008, .00, d2);
   float d3 = sdEllipse(uv - vec2(x + .06, y+.03), vec2(.045, .06));
   float m3 = S(0.008, .00, d3);
   float d4 = sdEllipse(uv - vec2(x - .02 , y+.04), vec2(.05, .04));
   float m4 = S(0.008, .00, d4);
   float m5 = max(m1, m2);
   float m6 = max(m3, m4);
   return max(m5, m6);
}

float sdCloud2( vec2 uv, float x, float y) {
   float d1 = sdRoundedBox(uv  - vec2(x, y), vec2(.14, .04), vec4(.05, .03, .05, .03) );
   float m1 = S(0.008, 0., d1);
   float d2 = sdEllipse(uv - vec2(x + .07, y+.02), vec2(.03, .055));
   float m2 = S(0.008, .00, d2);
   float d3 = sdEllipse(uv - vec2(x - .06, y+.02), vec2(.05, .06));
   float m3 = S(0.008, .00, d3);
   float d4 = sdEllipse(uv - vec2(x , y + 0.03), vec2(.055, 0.065));
   float m4 = S(0.008, .00, d4);
   float m5 = max(m1, m2);
   float m6 = max(m3, m4);
   return max(m5, m6);
}

// Code to create mountains
// Psuedo random noise code from Over the Moon Tutorial
float getHeight(float x) {
//  return sin(x) + sin(x*2.234+.123)*.5 + sin(x*4.45+2.2345)*.25;
 return sin(x)  + sin(x*2.234 + 0.123)*cos(x) + sin(x*4.45 + 2.234)*.25;
}

// vec4 Layer(vec2 uv, float blur)
//   {
//      vec4 col = vec4(0); 
//      float x = abs(uv.x);
//      float y = getHeight(uv.x);
//      float m =  S(blur, -blur, uv.y + y);
//      return col + m;
//  }

vec4 landscape(vec2 uv, float d, float p, float f, float a, float y, float seed, float focus) {
	uv *= d;
    vec2 gv = 0.04*Rot(PI*1./16.)*uv;
    vec2 hv = 0.02*Rot(-PI*1./32.)*uv;
    //uv *= d;
    float x1 = uv.x*PI*f+ p;
    float x2 = gv.x*PI*f - 1.573*p;
    float x3 = gv.x*PI*f + 3.139*p;
    float c = getHeight(x1+x2+x3)*a+y;
    float x = uv.x*PI*f+p;
    float e = 0.001;//fwidth(uv.y);
    vec4 col = vec4(S(c+e, c-e, uv.y ));
    col.rgb *= mix(0.9, 1., abs(uv.y-c)*20.);
  
    return saturate(col);
}

// Code to create dissolve
// Noise functions from Inigo Quilez

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

// Random noise functions
float random(vec2 uv) {
  return fract(sin(dot(uv, vec2(15.15377, 42.43145))) * 15941.5731 * sin( iTime * 0.3));
}

float noise(vec2 uv) {
  vec2 i = floor(uv);
  vec2 f = fract(uv);
  float a = random(i);
  float b = random(i + vec2(1.0,0.0));
  float c = random( i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0));
  
  vec2 u = S(0.0, 1.0, f);
  return mix(a, b, u.x) + (c-a)*u.y * (1.0 - u.x) + (d-b) * u.x*u.y;
}

// Function to create dissolve effect
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

// Functions to create crt filter
vec2 crt_coords( vec2 uv, float bend) {
    uv -= 0.5;
    uv *= 2.;
    uv.x *= 1.0 + pow(abs(uv.y)/bend, 2.0);
    uv.y *= 1.0 + pow(abs(uv.x)/bend, 2.0);
    uv /= 2.0;
    return uv+0.5;
}

float vignette(vec2 uv, float size, float smoothness, float edgeRounding)
  {
  uv -= 0.5;
  uv *= size;
  float amount = sqrt(pow(abs(uv.x), edgeRounding) + pow((uv.y), edgeRounding));
  amount = 1.0 - amount;
  return S(0.0, smoothness, amount);
}
  
void main( )
{
	vec2 uv = gl_FragCoord.xy / u_resolution.y;
  
    // Create new uv for 100% 
    vec2 gv = (gl_FragCoord.xy-0.5*u_resolution.xy) / u_resolution.y;
  
    // Code for CRT filter
    //vec2 crt_uv = curveRemapUV(uv);
  
    vec2 crt_uv = crt_coords(uv, 4.5) ; 
  
    // Add scan lines
    float line_count = 300.0;
    float opacity = 0.75;
    float y_lines = sin(crt_uv.y * line_count * PI * 2.0);
    y_lines = (y_lines * 0.5 + 0.5) * 0.9 + 0.1;
    float x_lines = sin(crt_uv.x * line_count * PI * 2.0);
    x_lines = (x_lines * 0.5 + 0.5) * 0.9 + 0.1;
    vec4 scan_line = vec4(vec3(pow(y_lines, opacity)), 1.0);
    vec4 scan_line_x = vec4(vec3(pow(x_lines, opacity)), 1.0);
  
    
   // Adjust parameter here to make variation more pronounced
    float f = fbm2( 6.0 * crt_uv ); 
    
    // Code for dissolve filter
    float rule = rule(uv);
    float p0 = S(rule, rule + 0.25, iTime*0.75);
    float t = iTime*0.04;
    
    // Add a target for the camera
    vec3 ta = vec3(0.0,0.0,0.0);
  
    // Origin of camera (ta moves camera up)
    vec3 ro = ta + vec3(1.5*sin(iTime),0.0,1.0*cos(iTime));  
    
    // Target minus ray origin
    vec3 ww = normalize( ta - ro); 
    vec3 uu = normalize( cross(ww,vec3(0.0,1.0,0.0)) );
    vec3 vv = normalize( cross(uu,ww) );
    
  // Lens of camera
    //vec3 rd = normalize( gv.x*uu + gv.y*vv + 1.0*ww*pow(E, 1.0*iTime));  
     vec3 rd = normalize( gv.x*uu + gv.y*vv + 40.0*ww*pow(E, iTime)); 
  
    // Start scene with 100%
    vec3 col = NAVY;  
    col += complete(gv)*AQUA;
    vec4 color = vec4(col, 1.0);
    color *= scan_line;
    color *= scan_line_x;
  
    // Start of mountain scene
    vec3 bkgrcol = CG(crt_uv, YELLOW, PINKER, 0.3);
    vec4 col_alpha = vec4(bkgrcol- 0.5*rd.y, 1.0); // sky with gradient 
 
    float dist = .1;
    float height = -.01;
    float amplitude = .07;
    
    dist = 1.0; // adjusts placement on screen
    height = 0.395;
    
    vec4 layers = vec4(0.);
    for(float i=0.; i<14.; i+=3.) {    
    	vec4 layer = landscape(uv - vec2(0.0, -0.004*pow(iTime, 2.0)), dist, t+i, 3.0, amplitude, height, i, .01);
        //layer.rgb *= mix( GREY, bkgrcol, clamp(0.0, 1.-i/10., 0.7) );
        layer.rgb *= mix( BROWN, bkgrcol, clamp(0.0, 1.-i/10., 0.7) );
        layers = mix(layers, layer, layer.a);
        
        dist -= .1;
        height -= .006*pow(iTime, 2.2);//*.15;
       // height -= .005*iTime;
    }
   
    col_alpha = col_alpha*(1.- layers.a) + mix(col_alpha, layers, layers.a);
    
  
    // Add clouds to sky
    vec3 c0 = sdCloud2(crt_uv, -t + 0.2 , 0.85)*vec3(1.0);
    vec4 cloud0 = vec4(c0, 1.0);
    vec3 c1 = sdCloud1(crt_uv, -t + 0.6 , 0.775)*vec3(1.0);
    vec4 cloud1 = vec4(c1, 1.0);
    vec3 c2 = sdCloud2(crt_uv, -t + 1.0 , 0.725)*vec3(1.0);
    vec4 cloud2 = vec4(c2, 1.0);
    vec3 c3 = sdCloud1(crt_uv, -t + 1.4 , 0.65)*vec3(1.0);
    vec4 cloud3 = vec4(c3, 1.0);
    vec3 c4 = sdCloud2(crt_uv, -t + 1.8 , 0.60)*vec3(1.0);
    vec4 cloud4 = vec4(c4, 1.0);
    vec3 c5 = sdCloud1(crt_uv, -t + 2.1 , 0.860)*vec3(1.0);
    vec4 cloud5 = vec4(c5, 1.0);
    col_alpha += cloud0 +cloud1 + cloud2 + cloud3 + cloud4 + cloud5;
  
    
    col_alpha *= scan_line;
    col_alpha *= scan_line.x;
   
    gl_FragColor = col_alpha*vignette(uv, 1.5, .6, 10.) ;
    gl_FragColor = mix(color, gl_FragColor, p0);
}
