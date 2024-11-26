//general varibles
let pivot;
let blockNum = 5;
let blocks = [];
let joints = [];
let draggingBlock = false;
let offset = 200;
let start = false;

//toolbar variables
let button1;
let button2;
let button3;
let button4;
let gravitySlider;
let gravity;
let frictionSlider;
let friction;

//math variables 
let ang = 0;
let angVel = 0;
let angAccel = 0;
let netForce = 0;
let clockwiseMoments = 0;
let antiClockwiseMoments = 0;
let balanced;

function setup() {
  createCanvas(windowWidth, windowHeight);
  //pivot in centre of the simulation area(excluding toolbar area)
  pivot = new Joint("yellow", (width - offset) / 2, height / 2);
  //buttons for blocks
  button1 = new Button("green", width - 160, 60, 30, 30, 0.5);
  button2 = new Button("yellow", width - 80, 50, 40, 40, 1);
  button3 = new Button("orange", width - 160, 120, 50, 50, 2);
  button4 = new Button("red", width - 80, 110, 60, 60, 5);
  //sliders for different forces
  gravitySlider = createSlider(0,20,10);
  gravitySlider.position(width - 160, 220);
  frictionSlider = createSlider(0,20,10);
  frictionSlider.position(width - 160, 290);
  friction = frictionSlider.value;
  //control buttons
  let startButton = createButton("Start");
  startButton.size(70, 50);
  startButton.position(width - 170, 650 - 140);
  startButton.mousePressed(function () {
    gravity = gravitySlider.value();//define forces based on inputs
    friction = frictionSlider.value()/10000;
    start = true;
  });
  
  let restartButton = createButton("Restart");
  restartButton.size(70, 50);
  restartButton.position(width - 80, 650 - 140);
  restartButton.mousePressed(function () {
    //restart resets everything
    start = false;
    balanced = false;
    netForce = 0;
    clockwiseMoments = 0;
    antiClockwiseMoments = 0;
    ang = 0;
    angVel = 0;
    angAccel = 0;
  });
  
  let pauseButton = createButton("Pause");
  pauseButton.size(70, 50);
  pauseButton.position(width - 170, 650 - 200);
  pauseButton.mousePressed(function(){
    //pause button stops the draw loop
    noLoop()
  })
  let unpauseButton = createButton("Unpause");
  unpauseButton.size(70, 50);
  unpauseButton.position(width - 80, 650 - 200);
  unpauseButton.mousePressed(function(){
    //unpause button restarts the draw loop
    loop()
  })
}

function draw() {
  background(150, 150, 220);
  toolBar();
  line(0, height / 2, width - 180, height / 2);//line for reference
  fill("yellow")
  arc((width-offset)/2,height/2,50,50,0,ang,PIE)//rotational angle measured ()
  
  push();
  translate(pivot.pos.x, pivot.pos.y);//origin at pivot
  rotate(ang);
  seeSaw(((width - offset) * 1) / 2);//seesaw occupies 3/4 width of simualtion area
  translate(0-(width-200)/2, 0-height/2);//translate back to original origin for block pos
  if (blocks.length > 0) {
    for (let i = 0; i < blockNum; i++) {
      if (i < blocks.length) {
        blocks[i].display();//draw blocks
      }
    }
  }
  pop();
  
  if (balanced){
    //if balanced show message
    fill(color(100,220,100))
    textSize(30)
    text("Perfectly Balanced",(width-offset)/2,height/4)
    textSize(12)
  }
  pivot.display();//draw pivot
}

function seeSaw(rectWidth) {
  fill("brown");
  rectMode(CENTER);
  rect(0, 0, rectWidth, 20);
  for (i = 0; i < 9; i++) {
    joints.push(new Joint("red", 0 - rectWidth / 2 + (rectWidth / 8) * i, 0));//attach 9 joints to evenly on seesaw (divides seesaw into 8 parts)
    joints[i].display();
  } 

  if (start == true) {
    if (blocks.length > 0) {
      for (let i = 0; i < blockNum; i++) {
        if (i < blocks.length) {
          blocks[i].calculate(gravity);//calculate everything at the start
        
          netForce += blocks[i].forceApplied;//netForce to determine final direction(clockwise or anti-clockwise) and magnitude (how fast seesaw rotates) by adding all blocks forceApplied together
          if (blocks[i].forceApplied > 0){
            clockwiseMoments += blocks[i].forceApplied;
          } else if (blocks[i].forceApplied < 0) {
            antiClockwiseMoments += blocks[i].forceApplied;
          }
          angAccel = (netForce/50000)/blocks[i].mass; //acceleration = force/mass
        }
      }
    }
    
    if (netForce == 0) {
        balanced = true;//if no acceleration its balanced
    }
    
    //force acting on angles
    angVel += angAccel;
    ang += angVel;
    
    //friction slows down seesaw
    angVel = angVel * (1 - friction);
    netForce = netForce * (1 - friction);
    clockwiseMoments = clockwiseMoments * (1 - friction);
    antiClockwiseMoments = antiClockwiseMoments * (1 - friction);
   }
}

function mouseDragged() {
  if (start == false) {
    //if currently not dragging block
    if (!draggingBlock) {
      //button detects mouse click
      if (button1.detect()) {
        //button spawns a new block at mouse pos into blocks array
        blocks.push(new Block("green", 30, 30, mouseX - 15, mouseY - 15,0.5));
        draggingBlock = true;
      } else if (button2.detect()) {
        blocks.push(new Block("yellow", 40, 40, mouseX - 20, mouseY - 20,1));
        draggingBlock = true;
      } else if (button3.detect()) {
        blocks.push(new Block("orange", 50, 50, mouseX - 25, mouseY - 25,2));
        draggingBlock = true;
      } else if (button4.detect()) {
        blocks.push(new Block("red", 60, 60, mouseX - 30, mouseY - 30,5));
        draggingBlock = true;
      }
    }

    //Check for blocks
    if (blocks.length > 0) {
      for (let i = 0; i < blockNum; i++) {
        if (i < blocks.length) {
          blocks[i].drag();//drag already existing blocks when mouse come into contact with them
          if (blocks[i].drag()){//check only if current block is dragged
            blocks[i].joinJoints();//join block to joint after dragging block to that joint
          }
        }
      }
    }
  }
}

function mouseReleased() {
  draggingBlock = false;//no longer dragging when mouse released
  for (i=0;i<blockNum;i++){
    if (i<blocks.length){
      if (blocks[i].connectedTo == null){
        //if blocks not connected to a joint when mouse is released
        blocks.splice(i,1);//delete block
      }
    }
  }
}

function toolBar() {
  rectMode(CORNER);
  fill(100, 100, 100, 100);
  rect(width - 180, 30, 180, 650);//toolbar area
  //buttons for blocks
  button1.display();
  button2.display();
  button3.display();
  button4.display();
  textSize(16);
  //labels
  text("Gravity", width - 134, 210);
  text("Friction", width - 134, 280);
  textAlign(LEFT);
  textSize(14)
  text(`angular velocity: ${round(degrees(angVel) * 10)}`, width - 170, 340);
  text(`net moment: ${round(netForce)}`, width - 170, 370);
  netForce = 0;//reset force after displaying it
  text(`clockwise: ${round(abs(clockwiseMoments))}`, width - 170, 400);
  clockwiseMoments = 0;
  text(`anti-clockwise: ${round(abs(antiClockwiseMoments))}`, width - 170, 430);
  antiClockwiseMoments = 0;
  textSize(12);
  //guide
  textWrap(WORD);
  text("Drag the blocks onto the seesaw and see what happens.", 10, 10, 170);
  text("After placing the blocks remeber to press start.", 10, 60, 170);
  textAlign(CENTER);
}


class Block {
  constructor(col, w, h, x, y,mass) {
    this.col = col;
    this.size = createVector(w, h);
    this.pos = createVector(x, y);
    this.mass = mass
    this.joint = new Joint(color(100,220,100), this.pos.x + this.size.x/2, this.pos.y + this.size.y);//each block comes with a joint to connect to seesaw joint
    this.connectedTo = null;//connected to nothing
  }
  
  calculate(g) {//calculates force exerted by block on seesaw
    this.displacement = (-4 + this.connectedTo);//displacement based on distance from pivot
    if (this.displacement < 0){
      this.sine = sin(ang - PI/2);//adjust the 0 degs to facing north
    } else if (this.displacement > 0) {
      this.sine = sin(ang + PI/2);
    }
    this.forceApplied = g * this.mass * abs(this.displacement) * this.sine;//moment formula
    
    //positive or negative moment applied depending on distance from pivot (right is positive and clockwise)
  }
  
  joinJoints(){//connects blocks to joints
    for (i=0;i<joints.length;i++){
      this.joint.connect(joints[i].pos.x + (width - 200)/2, joints[i].pos.y + height/2); //connect this joint to all joints on seesaw
      if (this.joint.connected){
        this.connectedTo = i % 9;//identifies which specific joint block is connected to when connected returns true
      }
    }
    if (this.connectedTo != null){//if joint is connected
      this.joint.connect(joints[this.connectedTo].pos.x + (width - 200)/2, joints[this.connectedTo].pos.y + height/2); //connect this joint with the specific joint identified
      if (this.joint.connected == false){//if joint no longer connected 
        this.connectedTo = null;// not connected to anything
      }
    }
  }
  
  display() {
    this.pos.x = this.joint.pos.x - this.size.x/2;
    this.pos.y = this.joint.pos.y - this.size.y;
    //position if block dependent on joint so if its joint connects block also connects
    
    fill(this.col);
    rect(this.pos.x + this.size.x/2, this.pos.y + this.size.y/2, this.size.x, this.size.y);//draw block
    
    this.joint.display();//draw joint
  }

  //if mouse is within block then move block position (dependent on joint pos) with mouse
  drag() {
    if (
      mouseX > this.pos.x &&
      mouseY > this.pos.y &&
      mouseX < this.pos.x + this.size.x &&
      mouseY < this.pos.y + this.size.y
    ) {
      this.joint.pos.x = mouseX;
      this.joint.pos.y = mouseY + this.size.y/2;
      return true;
    }
  }
}

//Creates buttons for different blocks
class Button {
  constructor(col, x, y, w, h, mass) {
    this.col = col;
    this.size = createVector(w, h);
    this.pos = createVector(x, y);
    this.mass = mass;
  }

  display() {//draws button
    fill(this.col);
    rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    fill(0);
    textAlign(CENTER);
    text(`${this.mass} kg`, this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);//labels buttons according to mass of block it represents
  }
  
  //detects if mouse position is within button
  detect() {
    if (
      mouseX > this.pos.x &&
      mouseY > this.pos.y &&
      mouseX < this.pos.x + this.size.x &&
      mouseY < this.pos.y + this.size.y
    ) {
      return true; //collision detected
    }
  }
}

class Joint {
  constructor(col, x, y) {
    this.radius = 10;
    this.col = col;
    this.pos = createVector(x, y);
    this.connected = false;
  }

  connect(x2, y2) {
    let hit = createVector(x2, y2); //other joint that this joint will connect to
    
    if (dist(this.pos.x, this.pos.y, hit.x, hit.y) < this.radius) { //checks collision detection for joints
      this.pos = hit;//connect this joint to other hit pos
      this.connected = true;
    }else {
      this.connected = false;
    }
  }

  display() {//draws joint
    fill(this.col);
    circle(this.pos.x, this.pos.y, this.radius);
  }
}
