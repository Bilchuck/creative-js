const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');
const tweakpane = require('tweakpane');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
};

const params = {
  cols: 10,
  rows: 10,
  scaleMin: 1,
  scaleMax: 30,
  freq: 0.001,
  amp: 0.2,
  animate: true,
  frame: 0,
  lineCap: 'butt',
}

const sketch = () => {
  /**
  * @param {{context: CanvasRenderingContext2D, width: number, height: number  }}
  */
  return ({ context, width, height, frame }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    const cols = params.cols;
    const rows = params.rows;
    const numCells = rows * cols;

    const gridw = 0.8 * width;
    const gridh = 0.8 * height;

    const cellw = gridw / cols;
    const cellh = gridh / rows;
    const margx = (width - gridw) / 2;
    const margy = (height - gridh) / 2;

    for (let i = 0; i < numCells; i++) {
      const col = i % cols;
      const row = Math.floor( i / cols);

      const x = col * cellw;
      const y = row * cellh;


      const n = params.animate
        ? random.noise3D(x,y, frame*20, params.freq)
        : random.noise3D(x,y, params.frame*20, params.freq);
      const angle = n * Math.PI * params.amp;
      const scale = math.mapRange(n, -1, 1, params.scaleMin, params.scaleMax);

      const w = cellw * 0.8;
      const h = cellh * 0.8;

      context.save();

      context.translate(x,y);
      context.translate(margx,margy);
      context.translate(cellw*0.5,cellh*0.5);
      context.rotate(angle);

      context.lineWidth = scale;
      context.lineCap = params.lineCap;

      context.beginPath()
      context.moveTo(w * -0.5, 0);
      context.lineTo(w * 0.5, 0);
      context.stroke();

      context.restore();
    }
  };
};

const createPane = () => {
  const pane = new tweakpane.Pane();
  const folder = pane.addFolder({title: 'grid'});
  folder.addInput(params, 'lineCap', {
    options: {
      butt: 'butt',
      round: 'round',
      square: 'square',
    }
  })
  folder.addInput(params, 'cols', {
    min: 2,
    max: 50,
    step: 1
  })
  folder.addInput(params, 'rows', {
    min: 2,
    max: 50,
    step: 1
  })
  folder.addInput(params, 'scaleMin', {
    min: 1,
    max: 100,
    step: 1
  })
  folder.addInput(params, 'scaleMax', {
    min: 1,
    max: 100,
    step: 1
  })

  const folder2 = pane.addFolder({ title: 'noise' });
  folder2.addInput(params, 'freq', {
    min: -0.01, max: 0.01
  })
  folder2.addInput(params, 'amp', {
    min: 0, max: 1
  })
  folder2.addInput(params, 'animate')
  folder2.addInput(params, 'frame', {
    min: 0,
    max: 999,
  })
}
createPane();
canvasSketch(sketch, settings);
