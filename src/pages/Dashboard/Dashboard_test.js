import './Dashboard.css';
import PropTypes from 'prop-types';
import { Typography, InputLabel, FormControl, Select, MenuItem } from "@material-ui/core";
import { useEffect, useState, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import useToken from '../../useToken';
import jwt_decode from "jwt-decode";
import { api_url, websocket_url } from '../../environment/environment'
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

let webSocket;

function Dashboard({ setCurrentPath }) {

  const [lastestTemperatureReading, setlastestTemperatureData] = useState();
  const [lastestHumidityReading, setlastestHumidityData] = useState();

  const [intervalOption, setIntervalOption] = useState('100');
  const handleSelectChange = (e) => {
    const value = e.target.value;
    setIntervalOption(value);
    if (typeof webSocket !== 'undefined') { webSocket.close(); }
    if (typeof deviceEntryId !== 'undefined') { fetchTelemetry(value); }
    //console.log('The Interval is : ', value);
  };

  const { token } = useToken();
  const [deviceInfos, setDeviceInfos] = useState([]);
  const [deviceEntryId, setDeviceEntryId] = useState();
  const isMounted = useRef(false);
  const handleSelectDeviceChange = (e) => {
    const value = e.target.value;
    isMounted.current = true;
    setDeviceEntryId(value);
    console.log('The Device EntryId is : ', value);
  };

  function fetchTelemetry(limit) {
    if (deviceInfos.length === 0) return;

    let fetchTelemetryUrl = websocket_url + "/ws/plugins/telemetry?token=" + token;
    //console.log('fetchTelemetryUrl:', fetchTelemetryUrl);
    //console.log('fetchTelemetry - isMounted:', isMounted.current);
    
    webSocket = new WebSocket(fetchTelemetryUrl);
    webSocket.onopen = function () {
      let object = {
        tsSubCmds: [{
          entityType: "DEVICE",
          entityId: deviceEntryId,
          scope: "LATEST_TELEMETRY",
          cmdId: 10
        }],
        historyCmds: [],
        attrSubCmds: []
      };
      let data = JSON.stringify(object);
      webSocket.send(data);
      console.log("Message is sent: " + data);
    };
    webSocket.onmessage = function (event) {
      let received_msg = JSON.stringify(JSON.parse(event.data).data);
      //console.log("Message is received received_msg(before): " + received_msg);
      let timestamp = JSON.stringify(JSON.parse(received_msg).temperature);
      //console.log("Message is received timestamp(before): " + timestamp);
      timestamp = timestamp.replace('[[','').replace(']]', '').split(',')[0];
      let d = new Date(timestamp * 1000 / 1000);
      timestamp = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
      //console.log("Message is received timestamp(after): " + timestamp);
      let humidity = JSON.stringify(JSON.parse(received_msg).humidity);
      //console.log("Message is received humidity(before): " + humidity);
      humidity = humidity.replace('[[','').replace(']]', '').split(',')[1].replace('"','').replace('"','');
      //console.log("Message is received humidity(after): " + humidity);
      let temperature = JSON.stringify(JSON.parse(received_msg).temperature);
      //console.log("Message is received temperature(before): " + temperature);
      temperature = temperature.replace('[[','').replace(']]', '').split(',')[1].replace('"','').replace('"','');
      //console.log("Message is received temperature(after): " + temperature);
      //console.log("Message is received: " + received_msg);
      //console.log("Message is received interval:", limit, ", timestamp: ", timestamp, ", temperature:", temperature, ",humidity:", humidity);
      setlastestTemperatureData(temperature);
      setlastestHumidityData(humidity);
      addDataToChart(chartTimeseries, limit, timestamp, temperature, humidity);
    };
    webSocket.onclose = function (event) {
      console.log("Connection is closed!");
    };
  };


  function addDataToChart(chart, limit, label, temperature, humidity) {
    //console.log('addDataToChart - intervalOption:', intervalOption, ', limit:', limit);
    if (limit === 100 && intervalOption !== 100) limit = intervalOption;
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
    const fetchDeviceInfo = async () => {
      let decoded = jwt_decode(token);
      //console.log('fetchDeviceInfo decoded: ', decoded, decoded['scopes'][0]);
      let fetchDeviceUrl = api_url;
      if (decoded['scopes'][0] === 'CUSTOMER_USER'){
        // For customer fetch device info API
        fetchDeviceUrl = fetchDeviceUrl + 'customer/' + decoded['customerId'] +'/deviceInfos?pageSize=20&page=0'
      } else if(decoded['scopes'][0] === 'TENANT_ADMIN'){
        // For tenant fetch device info API
        fetchDeviceUrl = fetchDeviceUrl + 'tenant/deviceInfos?pageSize=20&page=0';
      }
      console.log('fetchDeviceUrl:', fetchDeviceUrl);
      fetch(fetchDeviceUrl, {
        method: 'GET',
        headers: new Headers({
          'Accept': 'application/json',
          'X-Authorization': 'Bearer ' + token
        })
      })
       .then(res => res.json())
       .then(data => {
         console.log('fetchDeviceInfo all:', data['data']);
         let dInfos = [];
         data['data'].forEach((device) => {
           if (device['name'].includes('DHT11') || device['name'].includes('device')) {
            console.log('device:', device['name'], ' , id:', device['id']['id']);
            dInfos.push({
              "name": device['name'],
              "entryId": device['id']['id'],
              "entityType":device['id']['entityType']
            });
           }
         });
         console.log('fetchDeviceInfo :', dInfos);
         setDeviceInfos(dInfos);
       })
       .catch(e => {
         console.log('[Error] fetchDeviceInfo! Please retry it!\n', e);
       });
    };
    fetchDeviceInfo();
    return () => {
    }
  },[token]);

  useEffect(() => {
    if (isMounted.current) {
      //if (typeof chartTimeseries !== "undefined") chartTimeseries.destroy();

      const canvasTimeseries = document.getElementById('chartTimeseries');
      chartTimeseries = new Chart(canvasTimeseries, {
        type: 'line',
        data: dataSetup,
        options: {
          scales: { y: { beginAtZero: true, display: true } }
        }
      });
      fetchTelemetry(100);
    }
    
    return () => {
      //console.log('The useEffect - destroy - isMounted:', isMounted.current, ', webSocket:', webSocket);
      if (typeof chartTimeseries !== 'undefined') {
        //console.log('The useEffect - chartTimeseries.destroy')
        chartTimeseries.destroy();
      }
      if (typeof webSocket !== 'undefined') {
        //console.log('The useEffect - webSocket.close')
        webSocket.close();
      }
      setlastestTemperatureData('');
      setlastestHumidityData('');
    }
  },[isMounted.current]);

  return (
    <>
      <header className="dashboard-header">
        <FormControl className='dashboard-formControl' fullWidth size='medium'>
          <InputLabel id="select-device">Select your device: </InputLabel>
          <Select labelId="select-device-id" defaultValue="" onChange={handleSelectDeviceChange}>
          {
            (deviceInfos.length > 0) ? (
              deviceInfos.map((d) => (
                <MenuItem value={d.entryId} key={d.name}>{d.name}</MenuItem>
              ))
            ) : ('')
          }
          </Select>
        </FormControl>
        <FormControl className='dashboard-formControl' fullWidth size='medium'>
          <InputLabel id="select-label-id">Interval (default 100)</InputLabel>
          <Select labelId="select-label-id" defaultValue=""
            onChange={handleSelectChange}
          >
            {intervalOptions.map((option) => (
              <MenuItem value={option.value} key={option.value}>{option.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </header>
      <div className='dashboard-canvas-body'>
        <Typography variant="h5">Current Temperature: {lastestTemperatureReading} °C,
            Humidity: {lastestHumidityReading} %</Typography>
        <canvas className="dashboard-canvas" id="chartTimeseries"></canvas>
      </div>
    </>
    
  );
}
export default Dashboard;

Dashboard.propTypes = {
  setCurrentPath: PropTypes.func.isRequired
}