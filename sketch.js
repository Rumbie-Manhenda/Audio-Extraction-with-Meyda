
let recognition, resultString;
let backgroundColor = 0;
let currentShape = "square";
let rectangles = [];
let numRectangles = 20;

let sound;
let button;
let centroid;
let audioContext;
let analyzer;

let level;
let spectrum;
let spectralFlatness;


let rms;
let energy;
let zcr;
let perceptualSpread,spectralSlope;
animatedText = "Energy Level";
let particles =[];

function preload() {
    sound = loadSound('Kalte_Ohren_(_Remix_).mp3');
}

function togglePlay() {
  
  
    if (sound.isPlaying()) {
      sound.pause();
      analyzer.stop();
      button.html("Play")
    } else{
        sound.play();
        analyzer.start();
        button.html("Stop");
        
      }
    }
  

function setup() {
    createCanvas(900, 700);
    voiceRecognition();
    button = createButton('play');
    button.position(600,10);
    button.mousePressed(togglePlay);


    analyzer = Meyda.createMeydaAnalyzer({
        audioContext: getAudioContext(),
        source: sound,
        bufferSize: 512,
        featureExtractors: ['powerSpectrum', 'spectralFlatness','spectralSlope','perceptualSpread','spectralCentroid','zcr', 'energy',"rms"],
        callback: featureExtractorCallback,
    });
    analyzer.start();

    centroid = 0;
    rms = 0;
    zcr= 0;
    energy = 0;
    level = 0;
    perceptualSpread= 0;
    rmsCircleSize= 0;
    spectralFlatness= 0;
    spectralSlope= 0;

    for (let i = 0; i < numRectangles; i++) {
        let x = i * (width / numRectangles);
        let y = height / 2;
        let widthMultiplier = 2; 
        rectangles.push(new Rectangle(x, y, widthMultiplier));
      }
}


function featureExtractorCallback(features) {
  
    
    spectrum = features.amplitudeSpectrum; 
    centroid = features.spectralCentroid;//range 0-256
    rmsCircleSize = features.rms
    zcr = features.zcr;//range 0-255
    energy = features.energy; //range 0-1
     spectralFlatness= features.spectralFlatness
    perceptualSpread= features.perceptualSpread;//range0-1
    spectralSlope= features.spectralSlope;//range 0-1


   
}

function draw() {
    //change background based on speech recognition commands
     background(backgroundColor);
     //use rectangle speed to dtermine the spectral slope
     for (let i = 0; i < rectangles.length; i++) {
        rectangles[i].updateRect();
        rectangles[i].displayRect();
      }
     push();
     //use the length of the lines to represent energy level
    let circleRadius = 150;
    let numLines = 36; 
    let angleIncrement = 360 / numLines; 
    scale(0.25)
    translate(400, height*3);

    for (let i = 0; i < numLines; i++) {
      let angle = i * angleIncrement;
      let lineLength = map(energy,0,1, 0, 25); 
      let colorVal = color(map(angle, 0, 360, 0, 255), 150, 200);
      stroke(colorVal);
      strokeWeight(2);
      let x = cos(radians(angle)) * (circleRadius + lineLength);
      let y = sin(radians(angle)) * (circleRadius + lineLength);
      
      line(0, 0, x, y);
    }
    

    let textSizeValue = map(energy, 0, 1, 10, 20);
    let motionSpeed = 0.1

    textSize(textSizeValue);
    fill(255, 150, 200);
    textAlign(CENTER, CENTER);
    // Add some motion to the text
    let offsetX = sin(frameCount/2 * motionSpeed) * 10;
    let offsetY = cos(frameCount/2 * motionSpeed) * 10;
    text(animatedText, offsetX, offsetY);
    pop();

    textSize(20);
    text("Spectral Slope",offsetX+350,300)
   push();
   scale(0.4);
   translate(width+350,height+250);
     
    let spectrum = analyzer.get('powerSpectrum');
    drawSpectrogram(spectrum);
    textSize(50);
    textStyle(BOLD);
    fill(0, 200, 30);
    textAlign(LEFT, TOP);
    text("Power Spectrum", offsetX+300, 300);

    generateParticles(spectrum);
    pop();

    push();
    //change circle size bases on the zcr
    var sizeCircle = map(zcr,0,255,50,100);
    text("Zero Crossing Rate", offsetX,offsetY+30);
    textSize(10);
    circle(offsetX+80,offsetY+60,sizeCircle);
    pop();
    


    push();
    //change circle size and color based on the rms
    var sizeCircle = rmsCircleSize*250;
    text("Root Mean Squared(rms)", offsetX,offsetY+150);
    textSize(10);
    colorCircle = color(map(zcr, 0, 1, 50, 250));
    fill(colorCircle);
   
    drawCurrentShape(sizeCircle, x= offsetX+50,y = offsetY+200);
    
    pop();

    //change the rectangle size based on the perceptualSpread
    var sizeRectangle= map(perceptualSpread,0,1,50,100);
    text("Perceptual Spread", offsetX+400,offsetY+30);
    
    fill(255);
    //rect(450,50,sizeRectangle/2,sizeRectangle);
    drawCurrentShape(sizeRectangle, x= 450, y=60);

    //change the rectangle size and color based on the spectralFlatness
    var sizeRectangle= map(spectralFlatness,0,1,50,100);
    text("Spectral Flatness", offsetX+400,offsetY+200);
    fill(spectralFlatness*80,100,0);
    rect(580,200,sizeRectangle/2,sizeRectangle);
    var sizeRectangle= map(perceptualSpread,0,1,50,100);
    fill(spectralFlatness*100,100,100);
    rect(590,210,sizeRectangle,sizeRectangle/2);

    }
//.................................CUSTOM FUNCTIONS..........................................................
    function drawSpectrogram(spectrum) {
        if(spectrum){
        noStroke();
        for (let i = 0; i < spectrum.length; i++) {
            let amp = spectrum[i];
            let x = map(i, 0, spectrum.length, 0, width);
            let h = map(amp, 0, 256, height, 0);
            fill(255, 150, 200);
            rect(x, height, width / spectrum.length, -h);
        }
     }
    }
    
    function generateParticles(spectrum) {
        if(spectrum){
        for (let i = 0; i < spectrum.length; i += 10) {
            let amp = spectrum[i];
            let x = map(i, 0, spectrum.length, 0, width);
            let y = height / 2;
            let particleSize = map(amp, 0, 256, 4, 12);
            let particleColor = color(random(255), random(255), random(255), 150);
    
            particles.push(new Particle(x, y, particleSize, particleColor));
        }
    
        // Update and display particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].display();
    
            if (particles[i].isDead()) {
                particles.splice(i, 1);
            }
        }
     }
    }
    
    class Particle {
        constructor(x, y, size, color) {
            this.position = createVector(x, y);
            this.velocity = createVector(random(-1, 1), random(-1, 1));
            this.acceleration = createVector(0, 0);
            this.size = size;
            this.color = color;
            this.lifespan = 255;
        }
    
        update() {
            this.velocity.add(this.acceleration);
            this.position.add(this.velocity);
            this.acceleration.mult(0);
            this.lifespan -= 2;
        }
    
        display() {
            fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.lifespan);
            noStroke();
            ellipse(this.position.x, this.position.y, this.size, this.size);
        }
    
        isDead() {
            return this.lifespan < 0;
        }
    }

    class Rectangle {
        constructor(x, y, widthMultiplier) {
          this.x = x;
          this.y = y;
          this.widthMultiplier = widthMultiplier;
          this.height = 20;
          this.color = color(random(255), random(255), 255);
          
          this.speed = 0.1; 
        }
      
        updateRect() {
      
          this.speed = map(energy, 0,1,1,5) ;
          this.x += this.speed;
      
          // Reset position when rectangle goes off the right side of the canvas
          if (this.x > width) {
            this.x = 0;
          }
        }
      
        displayRect() {
          fill(this.color);
          noStroke();
          rect(this.x, this.y - this.height / 2, this.widthMultiplier * this.height, this.height);
        }
      }
      function toggleStop(resultString) {
        let command = resultString.toLowerCase();
      
        if (command.includes('stop') && sound.isPlaying()) {
          sound.pause();
        } 
      }

    function processVoice(resultString) {
     
      let command = resultString.toLowerCase();

      if (command.includes('black')) {
        backgroundColor = 0;
      } else if (command.includes('white')) {
        backgroundColor = 255;
      } else if (command.includes('red')) {
        backgroundColor = color(255, 0, 0);
      } else if (command.includes('blue')) {
        backgroundColor = color(0, 0, 255);
      } else if (command.includes('green')) {
        backgroundColor = color(0, 255, 0);
      } else if (command.includes('square')) {
        currentShape = 'square';
      } else if (command.includes('triangle')) {
        currentShape = 'triangle';
      } else if (command.includes('circle')) {
        currentShape = 'circle';
      } else if (command.includes('pentagon')) {
        currentShape = 'pentagon';
      }
      else if (command.includes('change color')) {
        background(random(255), random(255), random(255));
      }
    }
    function drawCurrentShape(size,x=100,y=100) {
        fill(255);
        //var size = map(zcr,0,255,50,100);
        if (currentShape === 'square') {
          rect(x, y, size, size);
        } else if (currentShape === 'triangle') {
          triangle(150, 100, 175, 50, 200, 100);
        } else if (currentShape === 'circle') {
          ellipse(x, y, size, size);
        } else if (currentShape === 'pentagon') {
          beginShape();
          for (let i = 0; i < 5; i++) {
            let angle = map(i, 0, 5, 0, TWO_PI);
            let x = 250 + 30 * cos(angle);
            let y = 125 + 30 * sin(angle);
            vertex(x, y);
          }
          endShape(CLOSE);
        }
      }

      function voiceRecognition() {

        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.onresult = function (e) {
        resultString = e.results[0][0].transcript;
        console.log(resultString);
        processVoice(resultString);
        toggleStop(resultString);
        };
    
        recognition.onerror = function (e) {
        console.log(e.error);
        };
    
        recognition.start();
    
         }