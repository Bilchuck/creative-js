const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [ 1080, 1080 ]
};

const sketch = () => {
  return ({ context: ctx, width, height }) => {
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,width,height);
    ctx.lineWidth = w*0.01;

    const w = .1 * width;
    const h = .1 * height;
    const gap = width * .03;
    const ix = width * .17;
    const iy = height * .17;
    const off = width * .02;

    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        let x = ix + (w + gap)*i;
        let y = iy + (h + gap)*j;

        ctx.beginPath();
        ctx.rect(x,y,w,h);
        ctx.stroke();

        if (Math.random() > 0.5) {

          ctx.beginPath();
          ctx.rect(x+off/2, y+off/2, w-off, h-off);
          ctx.stroke();
        }
      }
    }
  };
};

canvasSketch(sketch, settings);
