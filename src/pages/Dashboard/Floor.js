import { useEffect, useState, useRef } from 'react';
import * as collections from '../../collections';
import { useNavigate, useParams } from 'react-router-dom';
import useToken from '../../storages/useToken';
import { api_url, websocket_url } from '../../environment/environment';
import welcomeImage from '../../images/welcome_bg.png';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Grid from '@mui/material/Unstable_Grid2';
import PropTypes from 'prop-types';
import './Floor.css';

function createData(id, name) {
  return { id, name };
}

function Floor() {
  const { floorId } = useParams();
  const { token } = useToken();
  const [relationsList, setRelationsList] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [showTelemetry, setShowTelemetry] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getRelationsInfo = async () => {
      let url = api_url + 'relations/info?fromId=' + floorId + '&fromType=ASSET';
      //console.log('getRelationsInfo - url:', url);
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: new Headers({
            'Accept': 'application/json',
            'X-Authorization': 'Bearer ' + token
          })
        });
        if (!response.ok) {
          console.log(`getRelationsInfo error: The status is ${response.status}`);
        }
        let relationsInfos = await response.json();
        const dataAscending = [...relationsInfos].sort((a, b) =>
          b['toName'] > a['toName'] ? -1 : 1,
        );
        console.log('getRelationsInfo: ', dataAscending);
        let relationsData = [];
        dataAscending.forEach((rel) => {
          relationsData.push(createData(rel['to']['id'], rel['toName']))
        });
        setRelationsList(relationsData);
      } catch (err) {
        console.log('getRelationsInfo - error:', err.message);
      } finally {
        //console.log('getRelationsInfo - finally');
      }
    }
    getRelationsInfo();
  }, [token, floorId]);

  const onMouseEnterEvent = (room) => () => {
    //console.log('onMouseEnterEvent - room:', room['id']);
    setShowTelemetry(true);
    setSelectedRoomId(room['id']);
  };
  const onMouseLeaveEvent = () => () => {
    //console.log('onMouseLeaveEvent');
    setShowTelemetry(false);
    setSelectedRoomId(null);
  };

  return (
    <>
      <collections.Paper sx={{
        width: '98%', height: '89vh', minHeight: '50%', padding: '1%',
        backgroundImage: `url(${welcomeImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}>
        <collections.IconButton sx={{ color: 'white', fontSize: 14, '&:hover': { fontSize: '150%', } }} onClick={() => navigate('/dashboard')}>
          <collections.DashboardIcon /> Commercial Building
        </collections.IconButton>
        <collections.IconButton sx={{ fontSize: 14, marginLeft: -2, "&.Mui-disabled": { color: 'white' } }} disabled>
          <ChevronRightIcon />
        </collections.IconButton>
        <collections.IconButton sx={{ fontSize: 14, marginLeft: -2, "&.Mui-disabled": { color: 'white' } }} disabled>
          {floorId}
        </collections.IconButton>

        <Grid container spacing={2}>
          {relationsList && relationsList.map((item) => {
            return (
              <Grid xs={6} key={'grid_' + item.id}>
                <collections.Paper className='main-content' key={'main' + item.id}>
                  <collections.Box className="door-hor" key={'door_' + item.id}></collections.Box>
                  <collections.Box className="window-hor" key={'window_' + item.id}></collections.Box>
                  <collections.Box className="bed" key={'bed_' + item.id}>
                    <collections.Box className="table" key={'table_' + item.id} />
                    <collections.Box className="blanket" key={'blanket_' + item.id} />
                    <collections.Box className="pillow" key={'pillow1_' + item.id} />
                    <collections.Box className="pillow" key={'pillow2_' + item.id} />
                    <collections.Box
                      className="bi-thermometer-half"
                      key={'sensor_' + item.id}
                      onMouseEnter={onMouseEnterEvent(item)}
                      onMouseLeave={onMouseLeaveEvent()}
                    >
                      {(showTelemetry && selectedRoomId === item.id) && <FetchDeviceTelemetry selectedRoom={item} />}
                    </collections.Box>
                  </collections.Box>
                  <collections.Box className="bathroom" key={'pbathroom_' + item.id}>
                    <collections.Box className="door-hor" key={'door2_' + item.id} />
                    <collections.Box className="shower" key={'shower_' + item.id} />
                    <collections.Box className="toilet" key={'toilet_' + item.id} />
                    <collections.Box className="vanity" key={'vanity_' + item.id} />
                  </collections.Box>
                  <collections.Box className="name" key={'name_' + item.id}>{item.name.substr(5)}</collections.Box>
                </collections.Paper>
              </Grid>
            );
          })
          }
        </Grid>
      </collections.Paper>
    </>
  );
}
export default Floor;


function createTelemetryData(timestamp, key, value) {
  return { timestamp, key, value };
}

function FetchDeviceTelemetry({ selectedRoom }) {
  const { token } = useToken();
  const [devices, setDevices] = useState(null);
  const websocket = useRef(null);
  const [timeseriesKeys, setTimeseriesKeys] = useState(null);
  const [lastestValue, setlastesValue] = useState();

  // Fetch Room Devices
  useEffect(() => {
    const getRoomInfo = async () => {
      let url = api_url + 'relations/info?fromId=' + selectedRoom.id + '&fromType=ASSET';
      //console.log('getRoomInfo - url:', url);
      try {
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
            //console.log('getRoomInfo - roomDevices: ', roomDevices);
          });
      } catch (err) {
        console.log('getRoomInfo - error:', err.message);
      } finally {
        //console.log('getRoomInfo - finally');
      }
    }
    getRoomInfo();
  }, [token, selectedRoom.id]);

  useEffect(() => {
    if (devices === null) return;
    devices.forEach((device, index) => {
      //console.log('WebSocket device[', index, ']:', device.id);
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
            timestamp = newDate.toLocaleString("zh-TW", "zh-TW");
            let value = message[key] === undefined ?
              '' : message[key][0][1];
            data.push(createTelemetryData(timestamp, key, value));
            //console.log(key, ', value:', value, ' , last timestamp: ', timestamp);
          });
          setlastesValue(data);
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
      <collections.Box className="overlay">
        {devices && devices.map((device) => {
          let deviceInfo = 'Device: ' + device.name;
          {
            timeseriesKeys && timeseriesKeys.forEach((key) => {
              {
                lastestValue && lastestValue.forEach(value => {
                  if (key === value.key)
                    deviceInfo = deviceInfo + "\n" + key + ": " + value.value + "\n";
                })
              }
            })
          }
          return (deviceInfo)
        })
        }
      </collections.Box>
    </>
  );
}

FetchDeviceTelemetry.propTypes = {
  selectedRoom: PropTypes.object.isRequired
}