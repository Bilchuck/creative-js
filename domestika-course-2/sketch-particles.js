const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const color = require('canvas-sketch-util/color');
const riso = require('riso-colors');
const colormap = require('colormap');
const eases = require('eases');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
};

/**
* @type {HTMLElement}
*/
let elCanvas;
let draggableParticle;
let cursorX;
let cursorY;

const particles = [
    
]
/**
* @param {{context: CanvasRenderingContext2D, width: number, height: number, canvas: HTMLElement  }}
*/
const sketch = ({ context, width, height, canvas }) => {
  elCanvas = canvas;
  elCanvas.addEventListener('mousedown', onMouseDown);
  let x, y, particle, pos = [];

  for (let i = 0; i < 200; i++) {
    x = width / 2;
    y = height / 2;

    random.insideCircle(400, pos);

    x += pos[0];
    y += pos[1];

    particle = new Particle({ x, y });
    particles.push(particle);
  }
  /**
  * @param {{context: CanvasRenderingContext2D, width: number, height: number  }}
  */
  return ({ context, width, height, frame }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);
    
    for (const particle of particles) {
      particle.update();
      particle.draw(context);
    }
  };
};
const start = async () => {
  manager = await canvasSketch(sketch, settings);
}
start();

/**
* @param {Event} e
*/
const onMouseDown = (e) => {
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}

/**
* @param {Event} e
*/
const onMouseMove = (e) => {
  const x = (e.offsetX / elCanvas.offsetWidth) * elCanvas.width;
  const y = (e.offsetY / elCanvas.offsetHeight) * elCanvas.height;

  cursorX = x;
  cursorY = y;
  // particles.forEach(p => {
  //   if (p.hitBox({ x, y })) {
  //     draggableParticle = p;
  //   }
  // })
  // if (draggableParticle) {
  //   draggableParticle.x = x;
  //   draggableParticle.y = y;
  // }
}

/**
* @param {Event} e
*/
const onMouseUp = e => {
  draggableParticle = null;
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
}


class Particle {
  constructor({ x, y, color = 'white', radius = 10 }) {
    this.x = x;
    this.y = y;

    this.ax = 0;
    this.ay = 0;

    this.vx = 0;
    this.vy = 0;

    this.ix = x;
    this.iy = y;

    this.color = color;
    this.radius = radius;

    this.minDist = 100;
    this.pushFactor = 0.02;
    this.pullFactor = 0.004;
    this.dampDactory = 0.95;
  }

  checkPull() {
    const dx = this.ix - this.x;
    const dy = this.iy - this.y;
    
    this.ax = dx * this.pullFactor;
    this.ay = dy * this.pullFactor;
  }

  checkPush() {
    const dx = this.x - cursorX;
    const dy = this.y - cursorY;
    const dd = Math.sqrt(dx ** 2 + dy ** 2);

    const distDelta = this.minDist - dd;
    if (dd < this.minDist) {
      this.ax += (dx / dd) * distDelta * this.pushFactor;
      this.ay += (dy / dd) * distDelta * this.pushFactor;
    }
  }

  update() {
    this.checkPull();
    this.checkPush();
    this.vx += this.ax;
    this.vy += this.ay;

    this.vx *= this.dampDactory;
    this.vy *= this.dampDactory;

    this.x += this.vx;
    this.y += this.vy;
  }

  /**
  * @param {CanvasRenderingContext2D} context
  */
  draw(context) {
    context.save();
    context.translate(this.x, this.y);
    context.beginPath();
    context.fillStyle = this.color;

    context.arc(0,0,this.radius, 0, Math.PI * 2);

    context.fill();
    context.restore();
  }

  hitBox({ x, y }) {
    const d = Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2);
    return d <= this.radius + 10;
  }
}