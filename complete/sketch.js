// Created for https://github.com/Lumon-Industries/Macrodata-Refinement

// a shader variable
let completeShader;
let speech;

function preload(){
  // load the shader
  completeShader = loadShader('completeShader.vert', 'completeShader.frag');
}


function setup() {
  pixelDensity(1);
  // shaders require WEBGL mode to work
  createCanvas(500, 500, WEBGL);
  noStroke();
  speech = new p5.Speech(voiceReady);
  
  function voiceReady() {
    console.log(speech.voices);
  }
  
  speech.setVoice('Vicki');
  speech.setVolume(0.25);
  speech.speak(' I knew you could do it.  You have brought glory to the company. I love you.');
}


function draw() {  
  background(0);

  // Send uniforms of sketch into shader
  completeShader.setUniform('u_resolution', [width, height]);
  completeShader.setUniform("iMouse", [mouseX, map(mouseY, 0, height, height, 0)]);
  completeShader.setUniform("iFrame", frameCount);
  completeShader.setUniform("iTime", millis()/1000.);
  
  // shader() sets the active shader with our shader
  shader(completeShader);
 
  // rect gives us some geometry on the screen
  rect(0,0,width, height);
  
//   speech.ended(endSpeaking);
//   function endSpeaking() {
//   background(0);
// }
}

