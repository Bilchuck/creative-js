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
let audio, audioContext, audioData, sourceNode;

/**
* @type {AnalyserNode}
*/
let analyzerNode;
let manager;


/**
* @param {{context: CanvasRenderingContext2D, width: number, height: number, canvas: HTMLElement  }}
*/
const sketch = ({ context, width, height, canvas }) => {
  let numCircles = 5;
  let numSlices = 9;
  const slice = Math.PI * 2 / numSlices;
  const radius = 200;
  let bins = [];
  let lineWidth;
  const lineWidths = [];

  for (let i = 0; i < numCircles; i++) {
    const t = i / (numCircles - 1);
    lineWidths.push(
      eases.quadIn(t) * 200 + 20,
    )
  }

  for (let i = 0; i < numCircles * numSlices; i++) {
    bins.push(
      Math.random() > 0.5
        ? random.rangeFloor(4, 64)
        : 0,
    );
  }

  /**
  * @param {{context: CanvasRenderingContext2D, width: number, height: number  }}
  */
  return ({ context, width, height, frame }) => {
    context.fillStyle = '#EEEAE0';
    context.fillRect(0, 0, width, height);

    if (!audioContext) {
      return;
    }
    analyzerNode.getFloatFrequencyData(audioData);

    context.save();
    context.translate(width / 2, height / 2);

    for (let i = 0; i < numCircles; i++) {
      context.save();
      for (let j = 0; j < numSlices; j++) {
        context.rotate(slice);
        context.beginPath();

        const bin = bins[i * numSlices + j];
        if (!bin) {
          continue;
        }
        const db = math.mapRange(audioData[bin], analyzerNode.minDecibels, analyzerNode.maxDecibels, 0, 1, true);
    
        context.lineWidth = lineWidths[i] * db;
        if (context.lineWidth < 1) continue;
        const radiusDistance = lineWidths.filter((_, index) => index < i).reduce((acc, x) => acc + x, 0);
        // const curRadius = eases.
        context.arc(0,0,radius + radiusDistance + context.lineWidth * 0.5, 0, slice);
    
        context.stroke();
      }
      context.restore();
    }
    context.restore();
    return;
    for (let i = 0; i < bins.length; i++) {
      const bin = bins[i];
      const audioAverage = getAverage(audioData);
  
      const db = math.mapRange(audioData[bin], analyzerNode.minDecibels, analyzerNode.maxDecibels, 0, 1, true);
  
  
    }
  };
};
const start = async () => {
  manager = await canvasSketch(sketch, settings);
}
start();

const createAudio = () => {
  audio = document.createElement('audio');
  audio.src="./file.mp3";
  audio.paused;
  audioContext = new AudioContext()
  sourceNode = audioContext.createMediaElementSource(audio);
  sourceNode.connect(audioContext.destination);

  analyzerNode = audioContext.createAnalyser();
  analyzerNode.smoothingTimeConstant = 0.9;
  sourceNode.connect(analyzerNode);

  audioData = new Float32Array(analyzerNode.frequencyBinCount);
}

const getAverage = (arr) => {
  return arr.reduce((acc, x) => acc + x, 0) / arr.length;
}

window.addEventListener('mouseup', () => {
  if (!audioContext) {
    createAudio();
  }
  if (audio.paused) {
    audio.play();
    manager.play();
  } else {
    audio.pause();
    manager.pause();
  }
})

