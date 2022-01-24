import React, { useState } from "react";
import { 
  Divider, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, makeStyles
} from "@material-ui/core";
import HomeIcon from '@material-ui/icons/Home';
import { Link } from 'react-router-dom';

import MenuIcon from "@material-ui/icons/Menu";
import DashboardIcon from '@material-ui/icons/Dashboard';
import useToken from '../../useToken';
import jwt_decode from "jwt-decode";
import LogoutIcon from '@mui/icons-material/Logout';

const useStyles = makeStyles(()=>({
    welcome:{
      color: "blue",
      fontSize: "18px",
      textAlign: 'center',
      padding: '10px'
    },
    link:{
        textDecoration:"none",
        color: "black",
        fontSize: "15px",
    },
    icon:{
        color: "white"
    }
}));

function DrawerComponent() {
  const classes = useStyles();
  const [openDrawer, setOpenDrawer] = useState(false);
  const { token } = useToken();
  let decoded = jwt_decode(token);
  const signoutSubmit = (e) => {
    e.preventDefault();
    let n = sessionStorage.length;
    while(n--) {
      let key = sessionStorage.key(n);
      sessionStorage.removeItem(key);
    }
    window.location.reload(false);
  }


  return (
    <>
      <Drawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      >
        <i className={classes.welcome}> Hi, {decoded['name'].slice(0, decoded['name'].lastIndexOf("@"))}</i>
        <List>
          <ListItem onClick={() => setOpenDrawer(false)}>
            <ListItemIcon><HomeIcon/></ListItemIcon>
            <ListItemText>
              <Link to="/" className={classes.link}>Home</Link>
            </ListItemText>
          </ListItem>
          <Divider/>
        </List>
        <List>
          <ListItem onClick={() => setOpenDrawer(false)}>
            <ListItemIcon><DashboardIcon/></ListItemIcon>
            <ListItemText>
              <Link to="/dashboard" className={classes.link}>Dashboard</Link>
            </ListItemText>
          </ListItem>
          <Divider/>
        </List>
        {
          (token) ? (
            <List>
              <ListItem onClick={() => setOpenDrawer(false)}>
                <ListItemIcon><LogoutIcon/></ListItemIcon>
                <ListItemText onClick={signoutSubmit}>
                  <Link to="/" className={classes.link}>Sign out</Link>
                </ListItemText>
              </ListItem>
          <Divider/>
            </List>
          ) : ('')
        }
      </Drawer>
      <IconButton onClick={() => setOpenDrawer(!openDrawer)} className={classes.icon}>
        <MenuIcon />
      </IconButton>
    </>
  );
}
export default DrawerComponent;