const { createCanvas } = require('canvas');
const { Chart } = require('chartjs-node-canvas');

const width = 800;
const height = 600;
const chartCallback = (ChartJS) => {
  // Register plugins or configure ChartJS here
};

async function generateChartImage(data, config) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  const chart = new Chart(ctx, {
    type: config.type || 'bar',
    data: {
      labels: data.map(item => item.label),
      datasets: [{
        label: config.title || 'Dataset',
        data: data.map(item => item.value),
        backgroundColor: getChartColors(config.type),
        borderWidth: 1
      }]
    },
    options: {
      responsive: false,
      ...config.options,
      plugins: {
        legend: { position: 'top' },
        title: { 
          display: !!config.title,
          text: config.title 
        }
      }
    }
  });

  const buffer = await chart.renderToBuffer();
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

function getChartColors(type) {
  const palettes = {
    bar: ['#4CAF50', '#2196F3', '#FF9800'],
    line: ['#FF5722'],
    pie: ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0'],
    default: ['#607D8B']
  };
  
  return palettes[type] || palettes.default;
}

module.exports = {
  generateChartImage
};