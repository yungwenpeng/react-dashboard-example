import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DrawerComponent from './components/Drawer/Drawer';
import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard/Dashboard';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <DrawerComponent/>
        Menu
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path = "/dashboard" element = {<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
