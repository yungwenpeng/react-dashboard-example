import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/Login/Login';
import DrawerComponent from './components/Drawer/Drawer';
import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import UsersList from './pages/Users/Users';
import useToken from './useToken';
import useCurrentPath from './useCurrentPath';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import { Typography, Button } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Tooltip from '@mui/material/Tooltip';
import './App.css';

function App() {

  const { token, setToken } = useToken();
  const { path, setCurrentPath } = useCurrentPath();

  if (!token) {
    return <Login setToken={setToken} />
  }

  const capitalizeFirst = str => {
    var title = str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    return title;
  }

  const signoutSubmit = (e) => {
    e.preventDefault();
    let n = sessionStorage.length;
    while (n--) {
      let key = sessionStorage.key(n);
      sessionStorage.removeItem(key);
    }
    window.location.replace('/');
  }

  return (
    <BrowserRouter>
      <AppBar position="static">
        <Toolbar>
          <Grid item><DrawerComponent /></Grid>
          <Grid item>
            <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
              {capitalizeFirst(path)}
            </Typography>
          </Grid>
          <Grid item xs />
          <Grid item>
            <Tooltip title="Logout">
              <Button color="inherit" className='logout' onClick={signoutSubmit}>Logout</Button>
            </Tooltip>
          </Grid>
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/" element={<Home setCurrentPath={setCurrentPath} />}></Route>
        <Route path="/dashboard" element={<Dashboard setCurrentPath={setCurrentPath} />} />
        <Route path="/users" element={<UsersList setCurrentPath={setCurrentPath} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
