import './Dashboard.css';
import PropTypes from 'prop-types';
import { Typography, InputLabel, FormControl, Select, MenuItem } from "@material-ui/core";
import { useEffect, useState, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const intervalOptions = [
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 30, label: '30' }
];

let chartTimeseries;
let dataSetup = {
  labels: [],
  datasets: [
    {
      label: 'Plant Temperature',
      data: [],
      fill: false,
      borderColor: 'rgb(227, 230, 67)',
      tension: 0.1
    },
    {
      label: 'Plant Humidity',
      data: [],
      fill: false,
      borderColor: 'rgb(51, 104, 255)',
      tension: 0.1
    }
  ]
};

function Dashboard({ setCurrentPath }) {

  const [lastestTemperatureReading, setlastestTemperatureData] = useState();
  const [lastestHumidityReading, setlastestHumidityData] = useState();
  const intervalId = useRef();

  const [intervalOption, setIntervalOption] = useState('100');
  const handleSelectChange = (e) => {
    const value = e.target.value;
    setIntervalOption(value);
    //console.log('The Interval is : ', value);
  };

  function generateRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  function addDataToChart(chart, limit, label, temperature, humidity) {
    //console.log('temperature - ' + temperature + ',humidity - ' + humidity);
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
      if ((dataset.label).includes('Temperature')) {
        dataset.data.push(temperature);
      } else {
        dataset.data.push(humidity);
      }
    });

    if (chart.data.labels.length > limit) {
      chart.data.labels.splice(0, chart.data.labels.length - limit);
    }
    chart.data.datasets.forEach((dataset) => {
      console.log('length: ' + dataset.data.length + ', ' + dataset.label + ':' + dataset.data);
      if (dataset.data.length > limit) {
        dataset.data.splice(0, dataset.data.length - limit);
        //dataset.data.shift();
        console.log('length: ' + dataset.data.length + ', ' + dataset.label + ':' + dataset.data);
      }
      //console.log('dataset: ' + JSON.stringify(dataset, null, 4));
    });
  };


  useEffect(() => {
    //if (typeof chartTimeseries !== "undefined") chartTimeseries.destroy();

    function fetchmeasurements() {
      setlastestTemperatureData(generateRandomInt(10, 50));
      setlastestHumidityData(generateRandomInt(40, 70));
    };

    const canvasTimeseries = document.getElementById('chartTimeseries');
    chartTimeseries = new Chart(canvasTimeseries, {
      type: 'line',
      data: dataSetup,
      options: {
        scales: { y: { beginAtZero: true, display: true } }
      }
    });

    intervalId.current = setInterval(() => {
      let d = new Date();
      let timestamp = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
      console.log("datatime: " + timestamp);
      fetchmeasurements();
      if (typeof lastestTemperatureReading !== "undefined" &&
        typeof lastestHumidityReading !== "undefined") {
        addDataToChart(chartTimeseries, intervalOption, timestamp,
          lastestTemperatureReading, lastestHumidityReading);
        chartTimeseries.update();
      };
    }, 1000);

    setCurrentPath('dashboard');
    
    return () => {
      chartTimeseries.destroy();
      clearInterval(intervalId.current);
    }
  });

  return (
    <>
      <header className="dashboard-header">
        <Typography variant="h5">Current Temperature: {lastestTemperatureReading} °C,
          Humidity: {lastestHumidityReading} %</Typography>
        <FormControl className='dashboard-formControl' fullWidth size='medium'>
          <InputLabel id="select-label-id">Interval</InputLabel>
          <Select labelId="select-label-id" defaultValue=""
            onChange={handleSelectChange}
          >
            {intervalOptions.map((option) => (
              <MenuItem value={option.value} key={option.value}>{option.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </header>
      <div>
        <canvas className="dashboard-canvas" id="chartTimeseries"></canvas>
      </div>
    </>

  );
}
export default Dashboard;

Dashboard.propTypes = {
  setCurrentPath: PropTypes.func.isRequired
}