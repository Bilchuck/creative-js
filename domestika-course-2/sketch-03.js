const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const color = require('canvas-sketch-util/color');
const riso = require('riso-colors');
const colormap = require('colormap');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
};
let elCanvas;
let points;

/**
* @param {{context: CanvasRenderingContext2D, width: number, height: number, canvas: HTMLElement  }}
*/
const sketch = ({ context, width, height, canvas }) => {
  const cols = 72;
  const rows = 6;
  const numCells = cols * rows;

  const gw = width * 0.8;
  const gh = 0.8 * height;

  const cw = gw / cols;
  const ch = gh / rows;

  const mx = (width - gw) / 2;
  const my = (height - gh) / 2;
  let frequency = 0.002;
  let amp = 90;
  const colors = colormap({
    colormap: 'magma',
    nshades: amp,
  })

  const points = [];

  for (let i = 0; i < numCells; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * cw;
    const y = row * ch;
    const n = random.noise2D(x,y, frequency, amp);
    points.push(new Point({
      x: x,
      y: y,
      n: random.noise2D(x,y),
      lineWidth: math.mapRange(n, -amp, amp, 0, 5),
      color: colors[Math.floor(math.mapRange(n, -amp, amp, 0, amp-1))]
    }))

  }

  /**
  * @param {{context: CanvasRenderingContext2D, width: number, height: number  }}
  */
  return ({ context, width, height, frame }) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);
    
    context.save();
    context.translate(mx, my);
    context.translate(cw*0.5, ch*0.5);
    context.strokeStyle = 'red';
    context.lineWidth = 4;

    let lastX, lastY;


    points.forEach(p => {
      const n = random.noise2D(p.ix + frame * 3,p.iy, frequency, amp);
      p.x = p.ix + n;
      p.y = p.iy + n;
    })
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const curr = points[r*cols + c];
        const next = points[r*cols + c + 1];
        
        
        const mx = curr.x + (next.x - curr.x) * 0.8;
        const my = curr.y + (next.y - curr.y) * 5.5;


        if (!c) {
          lastX = curr.x;
          lastY = curr.y;
        }
        context.beginPath();
        context.lineWidth = curr.lineWidth;
        context.strokeStyle = curr.color;
        
        
        // if (c === 0) context.moveTo(curr.x, curr.y)
        // if (c === cols -1) context.quadraticCurveTo(curr.x, curr.y, next.x, next.y);
        // else context.quadraticCurveTo(curr.x, curr.y,mx, my);
        context.moveTo(lastX, lastY);
        context.quadraticCurveTo(curr.x, curr.y,mx, my);
        lastX = mx - c / cols * 250;
        lastY = my - r / rows * 250;

        context.stroke();

      }
    }

    // points.forEach(point => {
    //   point.draw(context);
    // });
    context.restore();
  };
};

canvasSketch(sketch, settings);


class Point {
  constructor({x,y, lineWidth, color}) {
    this.x = x;
    this.y = y;
    this.lineWidth = lineWidth;
    this.color = color;

    this.ix = x;
    this.iy = y;
  }

  /**
  * @param {CanvasRenderingContext2D} context
  */
  draw(context) {
    context.save();
    context.beginPath();
    context.fillStyle = 'red';
    context.arc(this.x, this.y, 10, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
}