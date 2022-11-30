const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
};

let text = 'A';
let fontSize = 1200;
let fontFamily = 'serif';
let manager;
const typeCanvas = document.createElement('canvas');
const typeContext = typeCanvas.getContext('2d');


  /**
  * @param {{context: CanvasRenderingContext2D, width: number, height: number  }}
  */
const sketch = ({ context, width, height }) => {
  const cell = 5;
  const cols = Math.floor(width / cell);
  const rows = Math.floor(height / cell);
  const numCells = rows * cols;
  typeCanvas.width = cols;
  typeCanvas.height = rows;
  const agents = [];

  for (let i = 0; i < 1; i++) {
    const x = random.range(0, width);
    const y = random.range(0, height);
    agents.push(new Agent(x,y))
    
  }

  /**
  * @param {{context: CanvasRenderingContext2D, width: number, height: number  }}
  */
  return ({ context, width, height }) => {
    typeContext.fillStyle = 'black';
    typeContext.fillRect(0, 0, cols, rows);

    fontSize = cols * 1;

    typeContext.fillStyle = 'white';
    typeContext.font = `${fontSize}px ${fontFamily}`;
    typeContext.textBaseline = 'top';

    const metrics = typeContext.measureText(text);

    const mx = metrics.actualBoundingBoxLeft * -1;
    const my = metrics.actualBoundingBoxAscent * -1;
    const mw = metrics.actualBoundingBoxRight + metrics.actualBoundingBoxLeft;
    const mh = metrics.actualBoundingBoxDescent + metrics.actualBoundingBoxAscent;
    const tx = (cols - mw) / 2 - mx;
    const ty = (rows - mh) / 2 - my;
    typeContext.save();

    typeContext.translate(tx,ty);
    typeContext.beginPath();
    typeContext.rect(mx, my, mw, mh);
    typeContext.stroke();

    typeContext.fillText(text, 0, 0);

    typeContext.restore();

    const typeData = typeContext.getImageData(0,0,cols,rows).data;
    context.drawImage(typeCanvas, 0, 0);

    context.fillStyle = 'white';
    context.fillRect(0,0,width, height);

    context.textBaseline = 'middle';
    context.textAlign = 'center';

    for (let i = 0; i < numCells; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x =  col * cell;
      const y = row * cell;

      const r = typeData[i * 4];
      const g = typeData[i * 4 + 1];
      const b = typeData[i * 4 + 2];
      const a = typeData[i * 4 + 3];

      const glyph =  getGlyph(r);

      context.save();

      context.fillStyle = `grey`;
      if (r > 150) {
        context.fillRect(x,y,cell,cell);
      }
      // context.font = `${cell * 2}px ${fontFamily}`;
      // if (Math.random() < 0.1) {
      // context.font = `${cell * 6}px ${fontFamily}`;
      // }
      // context.translate(x,y);
      // context.translate(cell * 0.5,cell * 0.5);
      // context.fillStyle = `black`;
      
      // context.fillText(glyph, 0, 0)

      context.restore();
    }


    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      for (let j = i+1; j < agents.length; j++) {
        const other = agents[j];

        const distance = agent.pos.getDistance(other.pos);
        if (distance <200) {
          context.beginPath();
          context.moveTo(agent.pos.x, agent.pos.y);
          context.lineTo(other.pos.x, other.pos.y);
          context.lineWidth = math.mapRange(distance, 0, 200, 12, 1);
          context.stroke();
        }
      }
    }
    
    agents.forEach(agent => {
      agent.draw(context);
      agent.update(context);
      // agent.bounce(width, height);
      agent.bounceBitmap(typeData, width, height, cols, rows);
    });
  };
};

const getGlyph = (brightness) => {
  if (brightness < 50) return '';
  // if (brightness < 100) return '.';
  // if (brightness < 150) return '-';
  // if (brightness < 200) return '+';
  const strs = text + '_= /'.split('');
  return random.pick(strs);
}

document.addEventListener('keyup', event => {
  text = event.key.toUpperCase();
  manager.render();
})
const start = async () => {
  manager = await canvasSketch(sketch, settings);
}

start();

class Vector {
  /**
  * @param x: number
  * @param y: number
  * @param radius: number
  */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  getDistance(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx**2 + dy**2);
  }
}

class Agent {
  constructor(x, y) {
    this.pos = new Vector(x,y);
    this.radius = random.range(4, 12);
    this.vel = new Vector(random.range(-1, 1), random.range(-1, 1));
  }

  /**
  * @param {CanvasRenderingContext2D} context
  */
  draw(context) {
    context.save();
    context.translate(this.pos.x, this.pos.y);

    context.lineWidth = 4;

    context.beginPath();
    context.arc(0, 0, this.radius, 0, Math.PI * 2)
    context.fill();
    context.stroke();

    context.restore();
  }

  bounce(width, height) {
    if (this.pos.x <= 0 || this.pos.x >= width) {
      this.vel.x *= -1;
    }
    if (this.pos.y <= 0 || this.pos.y >= height) {
      this.vel.y *= -1;
    }
  }

  bounceBitmap(bitmapRGBA, width, height, cols, rows) {
    const x = Math.floor(Math.floor(this.pos.x) / width * cols);
    const y = Math.floor(Math.floor(this.pos.y) / height * rows);
    const xValues = [
      (y * cols + (x+1)) * 4 ,
      (y * cols + (x-1)) * 4 ,
    ].map(v => bitmapRGBA[Math.floor(v)]);
    const yValues = [
      ((y+1) * cols + x) * 4 ,
      ((y-1) * cols + x) * 4 ,
    ].map(v => bitmapRGBA[Math.floor(v)]);
    if (xValues[0] < 50) this.vel.x = -1 * Math.abs(this.vel.x);
    if (xValues[1] < 50) this.vel.x *= Math.abs(this.vel.x);
    if (yValues[0] < 50) this.vel.y = Math.abs(this.vel.y);
    if (yValues[1] < 50) this.vel.y *= -1 * Math.abs(this.vel.y);

  }

  update() {
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
  }
}