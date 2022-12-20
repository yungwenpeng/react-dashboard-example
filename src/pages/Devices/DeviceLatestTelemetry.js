import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import useToken from '../../storages/useToken';
import { api_url, websocket_url } from '../../environment/environment';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

const minCellWidths = [170, 150, 100];
const disableCellPaddings = ['normal', 'none', 'none'];

const headCells = [
    {
        id: 'timestamp',
        minWidth: minCellWidths[0],
        disablePadding: disableCellPaddings[0],
        label: 'Last update time',
    },
    {
        id: 'key',
        minWidth: minCellWidths[1],
        disablePadding: disableCellPaddings[1],
        label: 'Key',
    },
    {
        id: 'value',
        minWidth: minCellWidths[2],
        disablePadding: disableCellPaddings[2],
        label: 'Value',
    },
];

function createData(timestamp, key, value) {
    return { timestamp, key, value };
}

function DeviceLatestTelemetry({ selectedDeviceId }) {
    const { token } = useToken();
    const [timeseriesKeys, setTimeseriesKeys] = useState(null);
    const websocket = useRef(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [lastestValue, setlastesValue] = useState();

    useEffect(() => {
        const getTimeseriesKeys = async () => {
            let url = api_url + 'plugins/telemetry/DEVICE/' +
                selectedDeviceId + '/keys/timeseries';
            //console.log('getTimeseriesKeys url:', url);
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: new Headers({
                        'Accept': 'application/json',
                        'X-Authorization': 'Bearer ' + token
                    })
                });
                if (!response.ok) {
                    console.log(`getTimeseriesKeys error: The status is ${response.status}`);
                }
                let keys = await response.json();
                setTimeseriesKeys(keys);
                //console.log('keys: ', keys);
            } catch (err) {
                console.log('getTimeseriesKeys - error:', err.message);
            } finally {
                console.log('getTimeseriesKeys - finally');
            }
        };
        getTimeseriesKeys();
    }, [token, selectedDeviceId]);

    useEffect(() => {
        let fetchTelemetryUrl = websocket_url + "/ws/plugins/telemetry?token=" + token;
        //console.log('WebSocket url:', fetchTelemetryUrl);
        const socket = new WebSocket(fetchTelemetryUrl);
        socket.onopen = () => {
            //console.log('WebSocket Connected');
            let object = {
                tsSubCmds: [{
                    entityType: "DEVICE",
                    entityId: selectedDeviceId,
                    scope: "LATEST_TELEMETRY",
                    cmdId: 10
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
            //console.log("message: " + message);
            //console.log("timeseriesKeys: " + timeseriesKeys);
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
                    data.push(createData(timestamp, key, value));
                    //console.log(key, ' , last timestamp: ', timestamp);
                });
                setlastesValue(data);
            }
        };
        websocket.current = socket;
        return () => {
            socket.close();
        };
    }, [token, selectedDeviceId, timeseriesKeys]);

    return (
        <Table sx={{ minWidth: 450 }} aria-labelledby="tableTitle" size='small' >
            <TableHead sx={{ backgroundColor:'#fff' }}>
                <TableRow>
                    {headCells.map((headCell) => (
                        <TableCell
                            key={headCell.id}
                            align='left'
                            padding={headCell.disablePadding}
                            style={{ minWidth: headCell.minWidth }}
                        >
                            {headCell.label}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {lastestValue && lastestValue
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => {
                        return (
                            <TableRow
                                hover
                                onClick={() => { }}
                                tabIndex={-1}
                                key={row.key}
                            >
                                <TableCell align="left" padding={disableCellPaddings[0]} style={{ minWidth: minCellWidths[0] }}>{row.timestamp}</TableCell>
                                <TableCell align="left" padding={disableCellPaddings[1]} style={{ minWidth: minCellWidths[1] }}>{row.key}</TableCell>
                                <TableCell align="left" padding={disableCellPaddings[2]} style={{ minWidth: minCellWidths[2] }}>{row.value}</TableCell>
                            </TableRow>
                        )
                    })
                }
            </TableBody>

        </Table>

    );
}

export default DeviceLatestTelemetry;

DeviceLatestTelemetry.propTypes = {
    selectedDeviceId: PropTypes.string.isRequired
}