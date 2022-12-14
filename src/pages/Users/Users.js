import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import useToken from '../../useToken';
import jwt_decode from "jwt-decode";
import { api_url, websocket_url } from '../../environment/environment'
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as collections from '../../collections';
import bgImage from '../../images/welcome_bg.png';


const Item = styled(collections.Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

function UsersList({ setCurrentPath }) {
    const { token } = useToken();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const websocket = useRef(null); //useRef doesn't triggers rerenders
    // For Update user data
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [userOldInfo, setUserOldInfo] = useState(null);
    const [userNewName, setUserNewName] = useState(null);
    const [userNewEmail, setUserNewEmail] = useState(null);
    const [userNewPassword, setUserNewPassword] = useState(null);
    const [userNewRole, setUserNewRole] = useState(null);
    const [postResult, setPostResult] = useState(null);
    //console.log('UsersList - loading:', loading, ' , data:', data, ' , error:', error);

    useEffect(() => {
        setCurrentPath('users');
    }, [setCurrentPath]);

    useEffect(() => {
        const getData = async () => {
            let decoded = jwt_decode(token);
            const fetchUsersUrl = decoded['role'] === 'admin' ?
                api_url + '/api/users?query=all' :
                api_url + '/api/users?query=' + decoded['email'];
            try {
                const response = await fetch(
                    fetchUsersUrl, {
                    method: "GET",
                    headers: new Headers({
                        'Accept': 'application/json'
                    }),
                });
                if (!response.ok) {
                    console.log(`This is an HTTP error: The status is ${response.status}`);
                }
                let actualData = await response.json();
                console.log(actualData);
                setData(actualData);
                setError(null);
            } catch (err) {
                setError(err.message);
                setData(null);
            } finally {
                setLoading(false);
            }
        };
        getData();
        return function cleanup() {
            console.log('cleanup');
        }
    }, [token]);

    useEffect(() => {
        const socket = new WebSocket(websocket_url);
        socket.onopen = () => {
            console.log('WebSocket Connected');
        };
        socket.onclose = function (event) {
            console.log("Connection is closed!");
        };
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('onmessage method:', message['method'], 'message: ', message);
            if (message['method'] === 'signup') {
                setData([...data, message]);
            } else if (message['method'] === 'delete') {
                setData(data.filter(user => user.id !== message['id']));
            } else if (message['method'] === 'update') {
                let newData = data.map((user) => {
                    if (user.id === message['id']) {
                        user.userName = message['userName'];
                        user.email = message['email'];
                        user.password = message['password'];
                        user.role = message['role'];
                    }
                    return user;
                });
                setData(newData);
            }
        };
        websocket.current = socket;
        return () => {
            socket.close();
        };
    }, [data]);

    useEffect(() => {
        if (postResult) {
            setTimeout(() => {
                setPostResult(null);
            }, 1000)
        }
    }, [postResult])

    const showEditDialog = user => {
        console.log('Edit user:', user)
        setUserOldInfo(user);
        setOpenEditDialog(true);
    }
    const handleEditSave = user => {
        console.log('handleEditSave New : ', userNewName, ' , ', userNewEmail, ' , ', userNewPassword, ' , ', userNewRole);
        if (userNewName === '' || userNewEmail === '' || userNewRole === '' || userNewPassword === '') {
            setPostResult('Each item is required');
            return;
        } else if (userNewPassword === null || userNewPassword === undefined) {
            setPostResult('Password is required');
            return;
        }
        var editData = {
            "userName": userNewName ? userNewName : user['userName'],
            "email": userNewEmail ? userNewEmail : user['email'],
            "password": userNewPassword ? userNewPassword : user['password'],
            "role": userNewRole ? userNewRole : user['role']
        }
        console.log('handleEditSave - oldUser: ', user['email']);
        console.log('handleEditSave - editData: ', JSON.stringify(editData));
        try {
            fetch(api_url + '/api/users/' + user['email'], {
                method: 'PUT',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }),
                body: JSON.stringify(editData)
            })
                .then(() => console.log('Update successful'));
            setOpenEditDialog(false);
            setUserOldInfo(null);
        } catch (err) {
            console.log(err.message);
        } finally {
            console.log('Update finally');
        }
    }
    const handleEditClose = () => {
        setOpenEditDialog(false);
        setUserOldInfo(null);
    };

    const handleDelete = userEmail => {
        setData(data.filter(user => user.email !== userEmail));
        try {
            fetch(api_url + '/api/users/' + userEmail, { method: 'DELETE', })
                .then(() => console.log('Delete successful'));
        } catch (err) {
            console.log(err.message);
        } finally {
            console.log('delete finally');
        }
    };

    return (
        <>
            <collections.Box sx={{
                width: '98%',
                padding: '1%',
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                minHeight: '60%',
                height: '86vh'
            }}>
                {loading && <div>Fetching users, please wait...</div>}
                {error && (
                    <div>{`There is a problem fetching the post data - ${error}`}</div>
                )}
                <Grid container spacing={2} columns={12} >
                    {jwt_decode(token)['role'] === 'admin' ?
                        data && data.map((user) => (
                            <Grid xs={6} key={user.id}>
                                <Item key={user.id}>
                                    <Grid container spacing={2} columns={8} direction="row">
                                        <Grid xs={2}>
                                            <collections.AccountCircleIcon style={{ color: 'blue', fontSize: '80px' }} />
                                        </Grid>
                                        <Grid xs={4}>
                                            <collections.Typography align='left' display="block" gutterBottom>
                                                {user.userName}
                                            </collections.Typography>
                                            <collections.Typography align='left' display="block" gutterBottom>
                                                {user.email}
                                            </collections.Typography>
                                            <collections.Typography align='left' display="block" gutterBottom>
                                                {user.role}
                                            </collections.Typography>
                                        </Grid>
                                        <Grid xs={2} direction="column">
                                            <collections.IconButton aria-label="edit" onClick={() => showEditDialog(user)}><collections.EditIcon style={{ color: 'black', fontSize: '24px' }} /></collections.IconButton>
                                            <collections.IconButton aria-label="delete" onClick={() => handleDelete(user.email)}><collections.DeleteIcon style={{ color: 'black', fontSize: '24px' }} /></collections.IconButton>
                                        </Grid>
                                    </Grid>
                                </Item>
                            </Grid>
                        )) : data &&
                        <Grid xs={6} key={data['id']}>
                            <Item key={data['id']}>
                                <Grid container spacing={2} columns={8} direction="row">
                                    <Grid xs={2}>
                                        <collections.AccountCircleIcon style={{ color: 'blue', fontSize: '80px' }} />
                                    </Grid>
                                    <Grid xs={4}>
                                        <collections.Typography align='left' display="block" gutterBottom>
                                            {data['userName']}
                                        </collections.Typography>
                                        <collections.Typography align='left' display="block" gutterBottom>
                                            {data['email']}
                                        </collections.Typography>
                                        <collections.Typography align='left' display="block" gutterBottom>
                                            {data['role']}
                                        </collections.Typography>
                                    </Grid>
                                    <Grid xs={2} direction="column">
                                        <collections.IconButton aria-label="edit" onClick={() => showEditDialog(data)}><collections.EditIcon style={{ color: 'black', fontSize: '24px' }} /></collections.IconButton>
                                    </Grid>
                                </Grid>
                            </Item>
                        </Grid>
                    }
                </Grid>
            </collections.Box>
            <collections.Dialog open={openEditDialog} onClose={handleEditClose}>
                <collections.DialogTitle>Edit User data</collections.DialogTitle>
                <collections.Box sx={{ display: 'flex', alignItems: 'center', padding: '10px 15px' }}>
                    <collections.TextField
                        id="input-with-name"
                        label="Name"
                        defaultValue={userOldInfo ? userOldInfo['userName'] : 'Enter your Name'}
                        variant="outlined"
                        onChange={(e) => setUserNewName(e.target.value)} />
                </collections.Box>
                <collections.Box sx={{ display: 'flex', alignItems: 'center', padding: '0 15px' }}>
                    <collections.TextField
                        id="input-with-email"
                        label="Email"
                        defaultValue={userOldInfo ? userOldInfo['email'] : 'Enter your Email'}
                        variant="outlined"
                        onChange={(e) => setUserNewEmail(e.target.value)} />
                </collections.Box>
                <collections.Box sx={{ display: 'flex', alignItems: 'center', padding: '10px 15px' }}>
                    <collections.TextField
                        id="input-with-password"
                        label="Enter your password"
                        variant="outlined"
                        onChange={(e) => setUserNewPassword(e.target.value)} />
                </collections.Box>
                <collections.Box sx={{ display: 'flex', alignItems: 'center', padding: '10px 15px' }}>
                    <collections.TextField
                        id="input-with-authority"
                        label="Authority"
                        defaultValue={userOldInfo ? userOldInfo['role'] : 'user'}
                        variant="outlined"
                        onChange={(e) => setUserNewRole(e.target.value)} />
                </collections.Box>
                <collections.DialogActions>
                    <collections.Button onClick={handleEditClose}>Cancel</collections.Button>
                    <collections.Button onClick={() => handleEditSave(userOldInfo)}>Update</collections.Button>
                </collections.DialogActions>
                {postResult &&
                    <div className="alert alert-secondary mt-2" role="alert">
                        <collections.ErrorIcon fontSize='larger' />
                        <pre>{postResult}</pre>
                    </div>
                }
            </collections.Dialog>
        </>
    );
}

export default UsersList;

UsersList.propTypes = {
    setCurrentPath: PropTypes.func.isRequired
}