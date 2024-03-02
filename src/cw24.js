const palette = [
  {
    name: "Dark Purple",
    hex: '#9428FF'
  },{
    name: "Light Purple",
    hex: '#CF91FF'
  },{
    name: "Hot Pink",
    hex: '#FF0EE7'
  },{
    name: "Blood Red",
    hex: '#F12B00'
  },{
    name: "Orange",
    hex: '#FF6A3B'
  },{
    name: "Peach",
    hex: '#FF8888'
  },{
    name: "Skin",
    hex: '#FFBA88'
  },{
    name: "Sand",
    hex: '#DCB588'
  },{
    name: "Yellow",
    hex: '#FFDD62'
  },{
    name: "Lime",
    hex: '#EBFF00'
  },{
    name: "Green",
    hex: '#00D56F'
  },{
    name: "Dark Green",
    hex: '#007813'
  },{
    name: "Light Blue",
    hex: '#55D5FD'
  },{
    name: "Medium Blue",
    hex: '#27B1FE'
  },{
    name: "Periwinkle Blue",
    hex: '#316BFF'
  },{
    name: "Dark Blue",
    hex: '#000AF1'
  },{
    name: "Grey",
    hex: '#554D5C'
  },{
    name: "Brown",
    hex: '#783A00'
  }
]

const kerningPairs = {
  'AT': -.11,
  'TI': .05
};

let blendModes

let sketches = []









const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    // Retrieve p5 instance from the canvas
    // console.log(entry.target)
    const p5Instance = entry.target.p5Instance;
    
    if (entry.isIntersecting) {
      p5Instance.loop(); // Start or continue the draw loop if canvas is in the viewport
    } else {
      p5Instance.noLoop(); // Stop the draw loop if canvas is not in the viewport
    }
  });
}, { threshold: 0.01 }); // threshold: 0.1 means at least 10% of the item is visible











function createSketchForElement(element) {
  let canvas;
  const sketchInstance = new p5((sketch) => {
      let speed1 = 2;
      let grid = 3
      let elementText, fontSize, lineHeight;
      let centerOffset;
      let frequency = 2;
      let str
      let whichDirection = "Stationary";
      let fontMultiplier = 1;
      let stationarySpeed = speed1;
      let systems;
      let font;
      let color = palette;
      

      if (element.hasAttribute("black")) {
        color = [{name: "black", hex: "#000000"}]
      }
    
      sketch.preload = () => {
        font = sketch.loadFont('/fonts/NHaasGroteskDSPro-55Rg.ttf');
      };
    
      sketch.setup = () => {
        const rect = element.getBoundingClientRect();
        canvas = sketch.createCanvas(rect.width, rect.height);
        canvas.elt.p5Instance = sketch;
        observer.observe(canvas.elt)
        sketches.push({ sketch: sketchInstance, canvas: canvas.elt })
        element.insertAdjacentElement('afterend', canvas.elt);
        canvas.position(rect.left + window.scrollX, rect.top + window.scrollY);
        
        // Access the element's text content and font size
        elementText = element.textContent || ''; // Get the text content of the element
        str = elementText.toUpperCase()
        fontSize = parseFloat(window.getComputedStyle(element).fontSize);
        lineHeight = fontSize*.95; // Line height, adjust as needed
        centerOffset = fontSize / 30;
        if (fontSize < 32) {
          grid = 2
          lineHeight = fontSize*1.1;
        } else if (fontSize < 50) {
          grid = 1
          lineHeight = fontSize;
        }
        
        sketch.textSize(fontSize); // Apply the font size to p5 text
        sketch.frameRate(10);
        blendModes = [sketch.MULTIPLY, sketch.HARD_LIGHT]
        sketch.textAlign(sketch.LEFT);
        sketch.textFont(font);
        resetString();
      };
    
      sketch.draw = () => {
        sketch.clear();
        sketch.push();
        for (let i = 0; i < systems.length; i++) {
          if (sketch.frameCount % stationarySpeed == 0) {
            systems[i].addParticle();
            systems[i].particles.splice(0, 1);
          }
          systems[i].run();
        }
        sketch.pop();
      };
    
      function resetString() {
        systems = [];
        let x = 0; // Starting X position
        let y = fontSize * 0.7; // Starting Y position
      
        sketch.textSize(fontSize);
        let previousLetter = ' ';
        let currentWordWidth = 0;
        let currentWord = '';
      
        str.split('').forEach((letter, index) => {
          let isLastLetter = index === str.length - 1;
          let kerningAdjustment = (kerningPairs[previousLetter + letter] || 0) * fontSize;
          let letterWidth = sketch.textWidth(letter) + kerningAdjustment;
          currentWord += letter;
          currentWordWidth += letterWidth;
      
          // Check for word boundary or last letter in the string
          if (letter === ' ' || isLastLetter) {
            // Check if the current word exceeds the canvas width
            if (x + currentWordWidth > sketch.width) {
              x = 0; // Reset X to starting position
              y += lineHeight; // Move to the next line
            }
      
            // Place each letter of the word
            let wordX = x; // Temporary X position for letters in the current word
            for (let i = 0; i < currentWord.length; i++) {
              let wordLetter = currentWord[i];
              let kerning = i === 0 ? 0 : (kerningPairs[currentWord[i-1] + wordLetter] || 0) * fontSize;
              let position = sketch.createVector(wordX + kerning, y);
              systems.push(new LetterSystem(wordLetter, position, systems.length)); // Use systems.length as unique identifier
              wordX += sketch.textWidth(wordLetter) + kerning; // Increment X position for the next letter
            }
      
            x += currentWordWidth; // Move X position for the next word
            currentWordWidth = 0; // Reset current word width
            currentWord = ''; // Clear current word
          }
      
          previousLetter = letter; // Update previous letter for kerning calculation
        });
      
        // Initialize particles for each system
        systems.forEach(system => {
          for (let k = 0; k < frequency; k++) {
            system.addParticle();
          }
        });
      }
      
    
    
      function setValueText(slider){
        slider.nextElementSibling.querySelector("span").innerHTML = slider.value;
      }
      
      
      
      
      
      // A simple Particle class
      let Particle = function(letter, position, idx) {
        this.index = idx;
      
        
        let newPosition = getRandomCoordinate(position.x, position.y, centerOffset, centerOffset);
      
        this.pos = {
          goal: newPosition,
          current: newPosition, 
        };
      
        this.direction = p5.Vector.sub(this.pos.goal, this.pos.current); // Direction from current to goal
        this.direction.normalize(); 
      
        this.type = "stationary";
      
        this.color = sketch.random(color).hex;
        this.blendMode = sketch.random(blendModes);
        this.letter = letter;
        this.theta = 0.0;
      
        // Calculate the direction vector pointing back to the goal position
      
      
        this.speed = speed1;
      
        this.countDown = 50;
      
        this.reachedGoal = true;
      }
      
      
      
      Particle.prototype.run = function() {
        this.calculateReachedGoal();
        this.update();
        this.display();
      };
      
      // Method to update position
      Particle.prototype.update = function() {
      
        // If the particle is close enough to the goal, it stops moving
        if (this.reachedGoal) {
          
          this.speed = 0;
          if (sketch.frameCount % stationarySpeed == 0){
            this.pos.current = this.pos.goal.copy(); // Copy the goal position
            this.pos.current.x += sketch.random(-centerOffset, centerOffset);  // Add a random value between -10 and 10 to x
            this.pos.current.y += sketch.random(-centerOffset, centerOffset); 
            // this.countDown--;
          }
      
        } else {
          // Scale direction by speed
          let step = p5.Vector.mult(this.direction, this.speed);
      
          // Update current position
          this.pos.current.add(step);
      
        }
      };
      
      // Method to display
      Particle.prototype.display = function() {
        sketch.fill(this.color);
        sketch.blendMode(this.blendMode);
        sketch.push();
          // let cShift = 0
          let cShift = fontSize*.1*fontMultiplier
          // let cShift = fontSize*.37*fontMultiplier - 50
          sketch.translate(roundToNearest(this.pos.current.x, grid, 0), roundToNearest(this.pos.current.y+cShift, grid, 0));
          sketch.rotate(this.theta);
          sketch.text(this.letter, 0, 0);
        sketch.pop();
      };
      
      // // Is the particle still useful?
      Particle.prototype.isDead = function() {
        return this.countDown <= 0;
      };
      
      Particle.prototype.calculateReachedGoal = function() {
      
        if (this.type == "inward"){
          let distanceToGoal = this.pos.current.dist(this.pos.goal);
      
          if (distanceToGoal < 10){
              this.reachedGoal = true;
              if (this.type == "outward") {
                // this.countDown = 0; 
              }
          };
        } else if (this.type == "outward"){
      
          if (this.countDown <= 0){
              this.reachedGoal = false;
          }
      
        } else if (this.type == "stationary"){
      
        }
      
      };
      
      // Utility function to get random coordinate within a radius from a point
      function getRandomCoordinate(x, y, maxRadius, minRadius) {
        let angle = sketch.random(sketch.TWO_PI); // Random angle
        let r = sketch.random(minRadius, maxRadius); // Random radius between minRadius and maxRadius
        let newX = x + r * sketch.cos(angle); // Calculate the new X coordinate
        let newY = y + r * sketch.sin(angle); // Calculate the new Y coordinate
        return sketch.createVector(newX, newY); // Return the new vector
      }
      
      // Utility function to round to the nearest value (used in display)
      function roundToNearest(value, nearest, offset) {
        return round((value - offset) / nearest) * nearest + offset;
      }
      
      
      let LetterSystem = function (letter, position, i) {
        this.letter = letter;
        this.origin = position.copy();
        this.particles = [];
        this.index = i;
        this.type = whichDirection;
      };
      
      LetterSystem.prototype.addParticle = function () {
        p = new Particle(this.letter, this.origin, this.index);
        // this.particles.push(p);
        this.particles.splice((this.particles.length+1) * Math.random() | 0, 0, p)
      };
      
      LetterSystem.prototype.run = function () {
        for (let i = this.particles.length - 1; i >= 0; i--) {
          let p = this.particles[i];
          p.run();
          // Check if the particle is dead and remove it if so
          if (p.isDead()) {
            this.particles.splice(i, 1);
          }
        }
      };
      
      // A subclass of Particle
      
      function LetterParticle(letter, origin) {
        Particle.call(this, origin);
      
        this.theta = 0.0;
        this.letter = letter;
      };
      
      LetterParticle.prototype = Object.create(Particle.prototype); // See note below
      LetterParticle.prototype.constructor = LetterParticle;
      LetterParticle.prototype.update=function() {
        Particle.prototype.update.call(this);
        this.theta += this.rotationChange / 10.0;
      }
      
      LetterParticle.prototype.display=function() {
        Particle.prototype.display.call(this);
      }
      
      
      function roundToNearest(number, increment, offset) {
        return Math.ceil((number - offset) / increment ) * increment + offset;
      }
      
      
      function windowResized() {
        resizeCanvas(windowWidth, windowHeight);
      }
      
      // for use as a map() function outside of p5
      function mapValue(value, start1, stop1, start2, stop2) {
        // Calculate the ratio of the difference between the value and start1 to the total range of start1 to stop1
        let ratio = (value - start1) / (stop1 - start1);
        // Apply the ratio to the start2 to stop2 range, adjusting by start2
        let mappedValue = start2 + (ratio * (stop2 - start2));
        return mappedValue;
      }
    
    
  }, element);
  
}
  

reDraw()
  

function reDraw() {
  // Dispose of old sketches and remove their canvases
  sketches.forEach(sketchObj => {
    // if (sketchObj.canvas) sketchObj.canvas.parentNode.removeChild(sketchObj.canvas);
    if (sketchObj.sketch) sketchObj.sketch.remove();
  });
  sketches = []; // Clear the sketches array

  const generativeElementsArray = Array.from(document.querySelectorAll("*[generative]"));
  generativeElementsArray.forEach(element => {
    createSketchForElement(element);
  });
}





let resizeTimeout

window.addEventListener('resize', function() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(reDraw, 100); // Debounce to prevent rapid calls
});



  