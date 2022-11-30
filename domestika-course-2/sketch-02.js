const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const color = require('canvas-sketch-util/color');
const riso = require('riso-colors');

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
  elCanvas = canvas;
  points = [
    new Point({ x: 200,y: 540 }),
    new Point({ x: 400, y: 700 }),
    new Point({ x: 880, y: 540 }),
    new Point({ x: 600, y: 700 }),
    new Point({ x: 640, y: 900 }),
  ]
  canvas.addEventListener('mousedown', onMouseDown)

  /**
  * @param {{context: CanvasRenderingContext2D, width: number, height: number  }}
  */
  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    context.strokeStyle = '#999';
    for (let i = 1; i < points.length; i += 1) {
      context.lineTo(points[i].x, points[i].y);
    }
    context.stroke();

    
    // context.beginPath();
    // context.moveTo(points[0].x, points[0].y);

    // for (let i = 1; i < points.length; i += 2) {
    //   context.quadraticCurveTo(points[i].x, points[i].y, points[i+1].x, points[i+1].y);

    // }
    // context.stroke();

    context.beginPath();
    context.strokeStyle = 'black';
    context.lineWidth = 5;

    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i+1];

      const mx = curr.x + (next.x - curr.x) * 0.5;
      const my = curr.y + (next.y - curr.y) * 0.5;

      // context.beginPath();
      // context.arc(mx, my, 5, 0, Math.PI * 2);
      // context.fillStyle = 'blue';
      // context.fill();
      
      context.quadraticCurveTo(curr.x, curr.y, mx, my)
    }
    context.stroke();
    context.closePath();

    for (const p of points) {
      p.draw(context);
    }
  };
};

const manager = canvasSketch(sketch, settings);

/**
* @param {Event} event
*/
const onMouseDown = event => {
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);


  
  const x = (event.offsetX / elCanvas.offsetWidth) * elCanvas.width;
  const y = (event.offsetY / elCanvas.offsetHeight) * elCanvas.height;
  points.forEach(p => {
    p.isDragging = p.hitTest(x, y);
  });
}

/**
* @param {Event} event
*/
const onMouseMove = async event => {
  const x = (event.offsetX / elCanvas.offsetWidth) * elCanvas.width;
  const y = (event.offsetY / elCanvas.offsetHeight) * elCanvas.height;
  console.log(x, y);
  points.forEach(async p => {
    if (p.isDragging) {
      p.x = x;
      p.y = y;
    }
  });
}
const onMouseUp = event => {
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
}


class Point {
  constructor({x,y, control = false}) {
    this.x = x;
    this.y = y;
    this.control = control;
  }

  /**
  * @param {CanvasRenderingContext2D} context
  */
  draw(context) {
    context.save();
    context.beginPath();
    context.fillStyle = this.control ? 'red' : 'black';
    context.arc(this.x, this.y, 10, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  hitTest(x, y) {
    const d = Math.sqrt((x - this.x)**2 + (y - this.y)**2)
    return d < 20;
  }
}