import './Dashboard.css';
import { Typography, InputLabel, FormControl, Select, MenuItem } from "@material-ui/core";
import { useEffect, useState, useCallback } from 'react';
import { Chart, registerables } from 'chart.js';
// Firebase deps
import { getFirestore, collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from '../../environment/environment';
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


function Dashboard() {

  const [lastestTemperatureReading, setlastestTemperatureData] = useState();
  const [lastestHumidityReading, setlastestHumidityData] = useState();
  const [lastestTimestampReading, setlastestTimestampData] = useState();

  const [intervalOption, setIntervalOption] = useState('50');
  const handleSelectChange = (e) => {
    //const value = e.target.value;
    setIntervalOption(e.target.value);
    //console.log('The Interval is : ', value);
  };

  const checkTimestamp = useCallback(
    () => {
      console.log('intervalOption, ', intervalOption);
    }
  );

  function addDataToChart(chart, limit, label, temperature, humidity) {
    console.log('intervalOption', intervalOption);
    //console.log('temperature - ' + temperature + ',humidity - ' + humidity);
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
      if ((dataset.label).includes('Temperature')) {
        dataset.data.push(temperature);
      } else {
        dataset.data.push(humidity);
      }
    });
    chart.update();

    if (chart.data.labels.length > limit) {
      chart.data.labels.splice(0, chart.data.labels.length - limit);
    }
    chart.data.datasets.forEach((dataset) => {
      console.log('limit:',limit, 'length: ' + dataset.data.length + ', ' + dataset.label + ':' + dataset.data);
      if (dataset.data.length > limit) {
        dataset.data.splice(0, dataset.data.length - limit);
        //dataset.data.shift();
        console.log('limit:',limit, 'length: ' + dataset.data.length + ', ' + dataset.label + ':' + dataset.data);
      }
      //console.log('dataset: ' + JSON.stringify(dataset, null, 4));
    });
  };

  // Initialize Firebase
  initializeApp(firebaseConfig);

  useEffect(() => {

    //if (typeof chartTimeseries !== "undefined") chartTimeseries.destroy();

    const canvasTimeseries = document.getElementById('chartTimeseries');
    chartTimeseries = new Chart(canvasTimeseries, {
      type: 'line',
      data: dataSetup,
      options: {
        scales: { y: { beginAtZero: true, display: true } }
      }
    });

    let documentPath = '### YOUR PATH ###';
    const db = getFirestore();
    const measurementsRef = collection(db, documentPath);
    let measurementsDoc = query(measurementsRef, orderBy("timestamp", "desc"), limit(1));

    const unsubscribe = onSnapshot(measurementsDoc, (querySnapshot) => {
      querySnapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
            console.log("New data: ", change.doc.data(), '  data-id: ', change.doc.id, lastestTimestampReading);
            if(lastestTimestampReading !== change.doc.id){
              let jsonTmp = JSON.parse(JSON.stringify(change.doc.data()))
              const d = new Date(jsonTmp['timestamp'] * 1000);
              let timestamp = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
              //console.log('latestMeasurement: ', change.doc.id, " => ", timestamp, ", temperature:", jsonTmp['temperature'], ", humidity:", jsonTmp['humidity']);
              addDataToChart(chartTimeseries, intervalOption, timestamp, jsonTmp['temperature'], jsonTmp['humidity']);
              setlastestTimestampData(value => value = change.doc.id);
              setlastestTemperatureData(value => value = jsonTmp['temperature']);
              setlastestHumidityData(value => value = jsonTmp['humidity']);
            };
        };
      });
    });

    return () => {
      chartTimeseries.destroy();
      unsubscribe();
    }
  }, [intervalOption]);

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