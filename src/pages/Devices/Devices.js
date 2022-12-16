import { useState, useEffect, useRef } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import useToken from '../../useToken';
import jwt_decode from "jwt-decode";
import * as collections from '../../collections';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { grey } from '@mui/material/colors';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { api_url, websocket_url } from '../../environment/environment';
import DeviceLatestTelemetry from './DeviceLatestTelemetry';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.secondary.light,
        color: theme.palette.common.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 16,
    },
}));

const columns = [
    { id: 'id', label: 'ID', minWidth: 280 },
    { id: 'name', label: 'Name', minWidth: 150 },
    { id: 'profile', label: 'Device Profile', minWidth: 150 },
    { id: 'label', label: 'Label', minWidth: 100 },
    { id: 'customer', label: 'Customer', minWidth: 150 },
];

function createData(id, name, profile, label, customer) {
    return { id, name, profile, label, customer };
}

const StyledBox = styled(collections.Box)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'light' ? '#fff' : grey[800],
}));

function Devices({ setCurrentPath }) {
    const { token } = useToken();
    const websocket = useRef(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [devices, setDevices] = useState(null);
    const [selectDevice, setSelectedDevice] = useState(null);
    const [openDetail, setOpenDetail] = useState(false);
    const [value, setTabValue] = useState('details');

    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - devices.length) : 0;

    useEffect(() => {
        setCurrentPath('devices');
    }, [setCurrentPath]);

    // fetch all devices
    useEffect(() => {
        const getDevices = async () => {
            let decoded = jwt_decode(token);
            console.log('getDevices decoded:', decoded['sub'], ', ', decoded['scopes'][0]);
            let url = decoded['scopes'][0] === 'TENANT_ADMIN' ?
                api_url + 'tenant/deviceInfos?pageSize=100&page=0' :
                api_url + 'customer/' + decoded['customerId'] + '/deviceInfos?pageSize=100&page=0'
            fetch(url, {
                method: 'GET',
                headers: new Headers({
                    'Accept': 'application/json',
                    'X-Authorization': 'Bearer ' + token
                })
            })
                .then(res => res.json())
                .then(data => {
                    console.log('getDevices data:', data['data']);
                    let fetchDevices = [];
                    data['data'].forEach((device) => {
                        fetchDevices.push(createData(
                            device['id']['id'],
                            device['name'],
                            device['deviceProfileName'],
                            device['label'],
                            device['customerTitle'] === null ? '' : device['customerTitle']
                        ));
                    });
                    //console.log('fetchDevices:', fetchDevices);
                    setDevices(fetchDevices);
                });
        };
        getDevices();
    }, [token]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const toggleDetail = (newOpen) => () => {
        setOpenDetail(newOpen);
        setTabValue('details');
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    function showDeviceDetails(device) {
        //console.log('showDeviceDetails - device', device);
        return (
            <collections.List sx={{ top: -20, left: -10, }}>
                <collections.ListItem sx={{p:0, m:0}}>
                    <collections.ListItemText
                        primary='Name'
                        primaryTypographyProps={{ fontSize: 12 }}
                        secondary={device['name']}
                        secondaryTypographyProps={{ fontSize: 18, color: '#228ee0' }} />
                </collections.ListItem>
                <collections.ListItem sx={{p:0, m:0}}>
                    <collections.ListItemText
                        primary='Device profile'
                        primaryTypographyProps={{ fontSize: 12 }}
                        secondary={device['profile']}
                        secondaryTypographyProps={{ fontSize: 18, color: '#228ee0' }} />
                </collections.ListItem>
                <collections.ListItem sx={{p:0, m:0}}>
                    <collections.ListItemText
                        primary='Label'
                        primaryTypographyProps={{ fontSize: 12 }}
                        secondary={device['label'] === '' ? 'no label' : device['label']}
                        secondaryTypographyProps={{ fontSize: 18, color: '#228ee0' }} />
                </collections.ListItem>
                <collections.ListItem sx={{p:0, m:0}}>
                    <collections.ListItemText
                        primary='Customer'
                        primaryTypographyProps={{ fontSize: 12 }}
                        secondary={device['customer'] === '' ? 'no assign customer' : device['customer']}
                        secondaryTypographyProps={{ fontSize: 18, color: '#228ee0' }} />
                </collections.ListItem>
            </collections.List>
        );
    }

    return (
        <>
            <collections.Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <collections.TableContainer sx={{ maxHeight: 440 }}>
                    <collections.Table stickyHeader aria-label="sticky table">
                        <collections.TableHead key='table_header'>
                            <collections.TableRow>
                                {columns.map((column) => (
                                    <StyledTableCell
                                        key={column.id}
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        {column.label}
                                    </StyledTableCell>
                                ))}
                            </collections.TableRow>
                        </collections.TableHead>
                        <collections.TableBody>
                            {devices && devices
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row) => {
                                    return (
                                        <collections.TableRow
                                            hover
                                            role="checkbox"
                                            tabIndex={-1}
                                            key={row.id}
                                            style={{ height: 33 * emptyRows, }}
                                            onClick={() => {
                                                setSelectedDevice(row);
                                                setOpenDetail(true);
                                            }}
                                        >
                                            {columns.map((column) => {
                                                const value = row[column.id];
                                                return (
                                                    <collections.TableCell key={column.id} align={column.align} >
                                                        {column.format && typeof value === 'number'
                                                            ? column.format(value)
                                                            : value}
                                                    </collections.TableCell>
                                                );
                                            })}
                                        </collections.TableRow>
                                    );
                                })}
                        </collections.TableBody>
                    </collections.Table>
                </collections.TableContainer>
                <collections.TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={devices ? devices.length : 0}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </collections.Paper>

            {selectDevice &&
                <SwipeableDrawer
                    anchor="right"
                    open={openDetail}
                    onClose={toggleDetail(false)}
                    onOpen={toggleDetail(true)}
                >
                    <StyledBox
                        sx={{
                            position: 'relative',
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            visibility: 'visible',
                            backgroundColor: 'blue',
                        }}
                    >
                        <collections.Typography sx={{ p: 2, color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                            {selectDevice['name']}
                        </collections.Typography>
                    </StyledBox>
                    <StyledBox sx={{ px: 2, pb: 2, height: '90%', overflow: 'auto', minWidth: '500px'}} >
                        <TabContext value={value}>
                            <collections.Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <TabList
                                    value={value}
                                    onChange={handleTabChange}
                                    textColor='secondary'
                                    indicatorColor='secondary'
                                    centered
                                    aria-label="lab API tabs example">
                                    <Tab label="Details" value="details" />
                                    <Tab label="Latest telemetry" value="telemetry" />
                                </TabList>
                            </collections.Box>
                            <TabPanel value="details">{showDeviceDetails(selectDevice)}</TabPanel>
                            <TabPanel value="telemetry">
                                <DeviceLatestTelemetry selectedDeviceId={selectDevice['id']}/>
                            </TabPanel>
                        </TabContext>
                    </StyledBox>
                </SwipeableDrawer>
            }

        </>
    );
}

export default Devices;

Devices.propTypes = {
    setCurrentPath: PropTypes.func.isRequired
}