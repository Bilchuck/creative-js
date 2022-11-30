const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const color = require('canvas-sketch-util/color');
const riso = require('riso-colors');

const settings = {
  dimensions: [ 1080, 1080 ]
};

const sketch = ({ context, width, height }) => {
  random.setSeed(555);
  let x, y, w, h, fill, stroke, blend;
  let rx, ry;
  let angle = -30;
  const num = 40;
  const rects = [];

  const rectColors = [
    random.pick(riso),
    random.pick(riso),
  ];

  const bgColor = random.pick(riso).hex;
  
  for (let i = 0; i < num; i++) {
    rects.push({
      x: random.range(0,width),
      y: random.range(0,height),
      w: random.range(600,width),
      h: random.range(200, 200),
      fill: random.pick(rectColors).hex,
      stroke: random.pick(rectColors).hex,
      blend: random.value() > 0.5 ? 'overlay' : 'source-over',
    });
  }

  const mask = {
    radius: width * 0.5,
    sides: 3,
    x: width * 0.5,
    y: height * 0.58,
  }

  /**
  * @param {{context: CanvasRenderingContext2D, width: number, height: number  }}
  */
  return ({ context, width, height }) => {
    context.fillStyle = bgColor;
    context.fillRect(0, 0, width, height);


    context.save();
    context.translate(mask.x, mask.y);
    drawPolygon({ n: mask.sides, context, radius: mask.radius });
    context.restore();
    context.clip();
    rects.forEach(rect => {
      x = rect.x;
      y = rect.y;
      w = rect.w;
      h = rect.h;
  
      context.save();
      context.translate(x,y);
      context.strokeStyle = rect.stroke;
      context.fillStyle = rect.fill;
      context.globalCompositeOperation = rect.blend;
      drawSkewedRect({ context, degress: angle })

      const shadowColor = color.offsetHSL(rect.fill, 0, 0, -20);
      shadowColor.rgba[4] = 0.5;
      context.shadowColor = color.style(shadowColor.rgba);
      context.shadowOffsetX = -10;
      context.shadowOffsetY = 20;
      context.lineWidth = 10;
      context.fill();

      context.shadowColor = null;
      context.stroke();

      context.globalCompositeOperation = 'source-over'
      context.strokeStyle = 'black';
      context.lineWidth = 2;
      context.stroke();
      context.restore();
    });

    
    context.save();
    context.translate(mask.x, mask.y);
    context.lineWidth = 20;
    drawPolygon({ n: mask.sides, context, radius: mask.radius - context.lineWidth });
    context.globalCompositeOperation = 'color-burn';
    context.strokeStyle = random.pick(rectColors).hex;
    context.stroke();
    context.restore();
  };
};

const drawSkewedRect = ({ context, w = 600, h = 200, degress=-45 }) => {
  const angle = math.degToRad(degress);
  const rx = Math.cos(angle) * w;
  const ry = Math.sin(angle) * w;

  context.save();
  context.translate(rx*-0.5, (ry+h)*-0.5);
  context.beginPath();

  context.moveTo(0,0);
  context.lineTo(rx,ry);
  context.lineTo(rx,ry + h);
  context.lineTo(0,h);
  context.lineTo(0,0);
  context.closePath();

  context.restore();
}

const drawPolygon = ({ n, context,width, height, radius = 100 }) => {
  const slice = Math.PI * 2 / n;

  context.beginPath();

  // context.lineWidth = 40;
  context.strokeStyle = 'black';

  context.moveTo(0, -1*radius);
  for (let i = 1; i < n; i++) {
    const theta = i * slice - Math.PI / 2;
    context.lineTo(
      Math.cos(theta) * radius,
      Math.sin(theta) * radius,
    );
  }
  context.lineTo(0, -1*radius);

  context.closePath();
}

canvasSketch(sketch, settings);
