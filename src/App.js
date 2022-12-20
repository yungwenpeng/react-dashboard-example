import './App.css';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/Login/Login';
import useToken from './storages/useToken';
import useCurrentPath from './storages/useCurrentPath';
import Grid from "@material-ui/core/Grid";
import * as collections from './collections';
import CircularProgress from '@mui/material/CircularProgress';

const DrawerComponent = lazy(() => import('./components/Drawer/Drawer'));
const Home = lazy(() => import('./pages/Home/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Devices = lazy(() => import('./pages/Devices/Devices'));
const Floor = lazy(() => import('./pages/Dashboard/Floor'));

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
    <Suspense fallback={
      <div className="container">
        <CircularProgress />Loading...
      </div>
    }>
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
          <Route path="/dashboard/:floorId" element={<Floor />} />
        </Routes>
      </BrowserRouter>
    </Suspense>

  );
}

export default App;
