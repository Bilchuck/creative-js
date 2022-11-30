const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [ 1080, 1080 ]
};

const sketch = () => {
  let x, y, w, h;

  /**
  * @param {{context: CanvasRenderingContext2D, width: number, height: number  }}
  */
  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    x = 0.5 * width;
    y = 0.5 * height;
    w = width * 0.6;
    h = height * 0.1;
    context.save();
    context.strokeStyle = 'blue';
    context.lineWidth = 4;
    context.translate(x,y);
    context.translate(w*-0.5, h*-0.5);
    context.beginPath();

    context.moveTo(0,0);
    context.lineTo(w,0);
    context.lineTo(w,h);
    context.lineTo(0,h);
    context.lineTo(0,0);
    context.closePath();

    context.stroke();


    context.restore();
  };
};

canvasSketch(sketch, settings);
