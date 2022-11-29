const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [ 1080, 1080 ]
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
  const cell = 20;
  const cols = Math.floor(width / cell);
  const rows = Math.floor(height / cell);
  const numCells = rows * cols;
  typeCanvas.width = cols;
  typeCanvas.height = rows;


  /**
  * @param {{context: CanvasRenderingContext2D, width: number, height: number  }}
  */
  return ({ context, width, height }) => {
    typeContext.fillStyle = 'black';
    typeContext.fillRect(0, 0, cols, rows);

    fontSize = cols;

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
    console.log(typeData);
    context.drawImage(typeCanvas, 0, 0);

    context.fillStyle = 'black';
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

      context.font = `${cell * 2}px ${fontFamily}`;
      context.translate(x,y);
      context.translate(cell * 0.5,cell * 0.5);
      context.fillStyle = `white`;
      
      context.fillText(glyph, 0, 0)

      context.restore();
    }
  };
};

const getGlyph = (brightness) => {
  if (brightness < 50) return '';
  if (brightness < 100) return '.';
  if (brightness < 150) return '-';
  if (brightness < 200) return '*';
  return text;
}

document.addEventListener('keyup', event => {
  text = event.key.toUpperCase();
  manager.render();
})
const start = async () => {
  manager = await canvasSketch(sketch, settings);
}

start();
