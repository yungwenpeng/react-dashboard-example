import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/Login/Login';
import DrawerComponent from './components/Drawer/Drawer';
import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import Devices from './pages/Devices/Devices';
import useToken from './useToken';
import useCurrentPath from './useCurrentPath';
import Grid from "@material-ui/core/Grid";
import * as collections from './collections';

function App() {

  const { token, setToken } = useToken();
  const { path, setCurrentPath } = useCurrentPath();

  if(!token) {
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
      <collections.AppBar position="static">
        <collections.Toolbar>
          <Grid item><DrawerComponent /></Grid>
          <Grid item>
            <collections.Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
              {capitalizeFirst(path)}
            </collections.Typography>
          </Grid>
          <Grid item xs />
          <Grid item>
            <collections.Tooltip title="Logout">
              <collections.Button color="inherit" className='logout' onClick={signoutSubmit}>Logout</collections.Button>
            </collections.Tooltip>
          </Grid>
        </collections.Toolbar>
      </collections.AppBar>

        <Routes>
        <Route path="/" element={<Home setCurrentPath={setCurrentPath} />}></Route>
        <Route path="/devices" element={<Devices setCurrentPath={setCurrentPath} />} />
        <Route path="/dashboard" element={<Dashboard setCurrentPath={setCurrentPath} />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
