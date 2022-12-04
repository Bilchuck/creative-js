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
  let bins = [4,12, 37];

  /**
  * @param {{context: CanvasRenderingContext2D, width: number, height: number  }}
  */
  return ({ context, width, height, frame }) => {
    context.fillStyle = '#EEEAE0';
    context.fillRect(0, 0, width, height);

    context.save();
    context.translate(width / 2, height / 2);

    for (let i = 0; i < numCircles; i++) {
      context.save();
      for (let j = 0; j < numSlices; j++) {
        context.rotate(slice);
        context.beginPath();
    
        context.lineWidth = 1;
        context.arc(0,0,radius + Math.exp(i/2) * 50, 0, slice);
    
        context.stroke();
      }
      context.restore();
    }
    context.restore();
    return;
    if (!audioContext) {
      return;
    }
    for (let i = 0; i < bins.length; i++) {
      const bin = bins[i];
      analyzerNode.getFloatFrequencyData(audioData);
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

