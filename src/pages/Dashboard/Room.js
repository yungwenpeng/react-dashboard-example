import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import welcomeImage from '../../images/welcome_bg.png';
import uploadImage from '../../images/upload-image-icon.png';
import mediumTemperature from '../../images/medium-temperature-icon.png';
import highTemperature from '../../images/high-temperature-warn-icon.png';
import humidityImage from '../../images/humidity-icon.png';
import warningImage from '../../images/warnning_icon.png';
import BusinessIcon from '@mui/icons-material/Business';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import Grid from '@mui/material/Unstable_Grid2';
import * as collections from '../../collections';
import useToken from '../../storages/useToken';
import { api_url, websocket_url } from '../../environment/environment';
import { Chart } from "react-google-charts";

// Refer to https://developers.google.com/chart/interactive/docs/gallery/linechart#configuration-options
export const lineChartOptions = {
    hAxis: {
        title: "Timestamp", titleTextStyle: { bold: true, fontSize: 16 }, textPosition: 'out',
        slantedText: true, slantedTextAngle: 40,
    },
    vAxis: { title: "°C / %", titleTextStyle: { bold: true, fontSize: 16 }, },
    series: {
        0: { curveType: "function", color: 'rgb(212, 147, 8)' },
        1: { curveType: "function", color: 'rgb(51, 104, 255)' },
    },
    legend: { position: "in", textStyle: { fontSize: 14, bold: true }, alignment: 'end' },
    backgroundColor: 'transparent',
    chartArea: { left: 100, top: 30, 'width': '80%', 'height': '70%' },
};

function createData(id, name) {
    return { id, name };
}

function createTelemetryData(timestamp, key, value) {
    return { timestamp, key, value };
}

function createLineChartData(timestamp, temperature, humidity) {
    return [timestamp, parseFloat(temperature), parseFloat(humidity)];
}

function Room() {
    const { floorId, RoomId } = useParams();
    const { token } = useToken();
    const [roomName, setRoomName] = useState(null);
    const [devices, setDevices] = useState(null);
    const websocket = useRef(null);
    const [timeseriesKeys, setTimeseriesKeys] = useState(null);
    const [lastestValue, setlastesValue] = useState();
    const navigate = useNavigate();
    const maxLineChartCount = 12;
    const [lineChartData, setLineChartData] = useState(null);
    

    // Fetch Room Name and Devices
    useEffect(() => {
        const getRoomName = async () => {
            let url = api_url + 'assets?assetIds=' + RoomId;
            fetch(url, {
                method: 'GET',
                headers: new Headers({
                    'Accept': 'application/json',
                    'X-Authorization': 'Bearer ' + token
                })
            }).then(res => res.json())
                .then(data => {
                    //console.log('getRoomName- data: ', data[0]['name']);
                    setRoomName(data[0]['name']);
                });
        };
        const getRoomInfo = async () => {
            let url = api_url + 'relations/info?fromId=' + RoomId + '&fromType=ASSET';
            fetch(url, {
                method: 'GET',
                headers: new Headers({
                    'Accept': 'application/json',
                    'X-Authorization': 'Bearer ' + token
                })
            }).then(res => res.json())
                .then(data => {
                    //console.log('getRoomInfo - data: ', data);
                    let roomDevices = [];
                    data.forEach((dev) => {
                        roomDevices.push(createData(dev['to']['id'], dev['toName']))
                    });
                    setDevices(roomDevices);
                });
        }
        getRoomName();
        getRoomInfo();
    }, [token, RoomId]);

    // Fetch device keys
    useEffect(() => {
        if (devices === null) return;
        devices.forEach((device, index) => {
            let url = api_url + 'plugins/telemetry/DEVICE/' + device.id + '/keys/timeseries';
            fetch(url, {
                method: 'GET',
                headers: new Headers({
                    'Accept': 'application/json',
                    'X-Authorization': 'Bearer ' + token
                })
            }).then(res => res.json())
                .then(timeseriesKeys => {
                    //console.log('getDeviceKeys - timeseriesKeys: ', timeseriesKeys);
                    setTimeseriesKeys(timeseriesKeys);
                });
        });
    }, [token, devices]);

    useEffect(() => {
        if (devices === null || timeseriesKeys === null) return;
        let fetchTelemetryUrl = websocket_url + "/ws/plugins/telemetry?token=" + token;
        const socket = new WebSocket(fetchTelemetryUrl);
        //console.log('WebSocket devices:', devices);
        //console.log('WebSocket - timeseriesKeys: ', timeseriesKeys);
        let chartData = [
            ["Timestamp", "Temperature", "Humidity"],
        ];

        function checkLineChartData(timestamp, temperature, humidity) {
            chartData.push(createLineChartData(timestamp, temperature, humidity));
            //console.log('checkLineChartData - ', chartData);
            if (chartData.length > maxLineChartCount) {
                chartData.splice(1, 1);
            }
            setLineChartData(chartData);
        }

        devices.forEach((device, index) => {
            //console.log('WebSocket device[', index, ']:', device.id);
            socket.onopen = () => {
                //console.log('WebSocket Connected');
                let object = {
                    tsSubCmds: [{
                        entityType: "DEVICE",
                        entityId: device.id,
                        scope: "LATEST_TELEMETRY",
                        cmdId: index
                    }],
                    historyCmds: [],
                    attrSubCmds: []
                };
                let data = JSON.stringify(object);
                socket.send(data);
                //console.log("WebSocket Message is sent: " + data);
            };
            socket.onclose = function (event) {
                console.log("Connection is closed!");
            };
            socket.onmessage = (event) => {
                const message = JSON.parse(event.data).data;
                //console.log("message: " + JSON.stringify(message));
                let data = [];
                if (timeseriesKeys !== null) {
                    timeseriesKeys.forEach(key => {
                        //console.log('key: ', key);
                        let timestamp = message[key] === undefined ?
                            '' : message[key][0][0];
                        let newDate = new Date(timestamp * 1000 / 1000);
                        // Refer to : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleTimeString
                        timestamp = newDate.toLocaleTimeString("en-GB");
                        let value = message[key] === undefined ?
                            '' : message[key][0][1];
                        data.push(createTelemetryData(timestamp, key, value));
                        //console.log(key, ', value:', value, ' , last timestamp: ', timestamp);
                    });
                    //console.log('data: ', data[0]['timestamp'], ', ', data[0]['key'], ':', data[0]['value'], ', ', data[1]['key'], ':', data[1]['value']);
                    setlastesValue(data);
                    checkLineChartData(data[0]['timestamp'], data[0]['value'], data[1]['value']);
                }
            };
        });
        websocket.current = socket;
        return () => {
            socket.close();
        };
    }, [token, devices, timeseriesKeys]);

    return (
        <>
            <collections.Paper sx={{
                width: '98%', height: '89vh', minHeight: '50%', padding: '1%',
                backgroundImage: `url(${welcomeImage})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
            }}>
                <collections.IconButton sx={{ color: 'white', fontSize: 14, '&:hover': { fontSize: '150%', } }} onClick={() => navigate('/dashboard')}>
                    <BusinessIcon /> Commercial Building
                </collections.IconButton>
                <collections.IconButton sx={{ fontSize: 14, marginLeft: -2, "&.Mui-disabled": { color: 'white' } }} disabled>
                    <ChevronRightIcon />
                </collections.IconButton>
                <collections.IconButton sx={{ color: 'white', fontSize: 14, marginLeft: -2, '&:hover': { fontSize: '150%', } }} onClick={() => navigate('/dashboard/' + floorId)}>
                    <AutoAwesomeMosaicIcon /> {floorId.substring(0, 8)}
                </collections.IconButton>
                <collections.IconButton sx={{ fontSize: 14, marginLeft: -2, "&.Mui-disabled": { color: 'white' } }} disabled>
                    <ChevronRightIcon />
                </collections.IconButton>
                <collections.IconButton sx={{ fontSize: 14, marginLeft: -2, "&.Mui-disabled": { color: 'white' } }} disabled>
                    {RoomId}
                </collections.IconButton>

                <collections.Paper sx={{
                    maxHeight: '800px', padding: '1%',
                    backgroundImage: 'linear-gradient(135deg, #d6f1e9 10%, #08e979 100%)',
                    borderRadius: '10px',
                }} >
                    <Grid container spacing={2} sx={{ margin: 1 }}>
                        <Grid xs={10}>
                            <collections.Box sx={{ fontSize: 24, fontWeight: 600 }}>{roomName}</collections.Box>
                            {devices && devices.map((device, index) => {
                                return (
                                    <collections.Box key={device.id}
                                        sx={{ fontSize: 14 }}>
                                        Device Name: {device.name}
                                    </collections.Box>)
                            })}
                        </Grid>
                        {lastestValue && lastestValue.map((value, index) => {
                            if (value.key === 'temperature' && value.value > 27)
                                return (
                                    <Grid xs={2} key={'gridwarning_' + index}>
                                        <collections.Box key={'warning_' + index}
                                            sx={{
                                                minWidth: '40px',
                                                minHeight: '40px',
                                                backgroundImage: `url(${warningImage})`,
                                                backgroundSize: 'contain',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: '50% 50%',
                                                alignItems: 'center'
                                            }}
                                        />
                                    </Grid>)
                            else return (<Grid xs={2} key={'gridnormal_' + index}></Grid>)
                        })}
                    </Grid>
                    <Grid container spacing={3}>
                        <Grid xs={4}>
                            <collections.Box
                                sx={{
                                    minWidth: '120px',
                                    minHeight: '120px',
                                    backgroundImage: `url(${uploadImage})`,
                                    backgroundSize: 'contain',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: '50% 50%',
                                    alignItems: 'center'
                                }}
                                onClick={() => { console.log('pressImage') }}
                            />
                        </Grid>
                        <Grid xs={4}>
                            {lastestValue && lastestValue.map((value, index) => {
                                if (value.key === 'temperature')
                                    if (value.value > 27)
                                        return (
                                            <collections.Paper key={'highTemperaturePaper_' + index} elevation={0} sx={{ backgroundColor: 'transparent' }}>
                                                <collections.Box
                                                    sx={{
                                                        minWidth: '35px',
                                                        minHeight: '80px',
                                                        backgroundImage: `url(${highTemperature})`,
                                                        backgroundSize: 'contain',
                                                        backgroundRepeat: 'no-repeat',
                                                        backgroundPosition: '50% 50%',
                                                        alignItems: 'center'
                                                    }}
                                                />
                                                <collections.Box sx={{ margin: 4, textAlign: 'center', fontSize: 22, color: 'red' }}>
                                                    {value.value}
                                                </collections.Box>
                                            </collections.Paper>
                                        )
                                    else
                                        return (
                                            <collections.Paper key={'mediumTemperaturePaper_' + index} elevation={0} sx={{ backgroundColor: 'transparent' }}>
                                                <collections.Box
                                                    sx={{
                                                        minWidth: '35px',
                                                        minHeight: '80px',
                                                        backgroundImage: `url(${mediumTemperature})`,
                                                        backgroundSize: 'contain',
                                                        backgroundRepeat: 'no-repeat',
                                                        backgroundPosition: '50% 50%',
                                                        alignItems: 'center'
                                                    }}
                                                />
                                                <collections.Box sx={{ margin: 4, textAlign: 'center', fontSize: 20 }}>
                                                    {value.value}
                                                </collections.Box>
                                            </collections.Paper>
                                        )
                                else
                                    return (<collections.Paper key={'NoTemperatureText_' + index} elevation={0} sx={{ backgroundColor: 'transparent' }} />)
                            })}
                        </Grid>
                        <Grid xs={4}>
                            {lastestValue && lastestValue.map((value, index) => {
                                if (value.key === 'humidity')
                                    return (
                                        <collections.Paper key={'humidityPaper_' + index} elevation={0} sx={{ backgroundColor: 'transparent' }}>
                                            <collections.Box
                                                sx={{
                                                    minWidth: '35px',
                                                    minHeight: '80px',
                                                    backgroundImage: `url(${humidityImage})`,
                                                    backgroundSize: 'contain',
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: '50% 50%',
                                                    alignItems: 'center'
                                                }}
                                            />
                                            <collections.Box sx={{ margin: 4, textAlign: 'center', fontSize: 20 }}>
                                                {value.value}
                                            </collections.Box>
                                        </collections.Paper>
                                    )
                                else return (<collections.Paper key={'NohumidityPaper_' + index} elevation={0} sx={{ backgroundColor: 'transparent' }} />)
                            })}
                        </Grid>
                    </Grid>
                    {lastestValue &&
                        <Grid sx={{
                            borderStyle: 'double',
                            borderRadius: '20px',
                            justifyItems: 'center',
                            padding: '0px',
                            margin: 'auto 10px'
                        }}>
                            {lineChartData &&
                                <Chart
                                    chartType="LineChart"
                                    width="100%"
                                    height="350px"
                                    data={lineChartData}
                                    options={lineChartOptions}
                                />}
                        </Grid>
                    }
                </collections.Paper>
            </collections.Paper>
        </>
    );
}

export default Room;