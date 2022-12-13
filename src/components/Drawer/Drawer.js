import React, { useState } from "react";
import { IconButton } from "@material-ui/core";
import HomeIcon from '@material-ui/icons/Home';
import MenuIcon from "@material-ui/icons/Menu";
import DashboardIcon from '@material-ui/icons/Dashboard';
import useToken from '../../useToken';
import jwt_decode from "jwt-decode";
import LogoutIcon from '@mui/icons-material/Logout';
import Tooltip from '@mui/material/Tooltip';
import { styled } from "@mui/material/styles";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import drawerImage from '../../images/siderbar_bg.png';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'left',
  fontWeight: 'bold',
  fontSize: '130%',
  color: '	#4169E1'
}));

const StyledList = styled(List)({
  // selected and (selected + hover) states
  '&& .Mui-selected, && .Mui-selected:hover': {
    backgroundColor: '#00CED1',
    '&, & .MuiListItemIcon-root': {
      color: 'white',
    },
  },
  // hover states
  '& .MuiListItemButton-root:hover': {
    border: '2px solid rgb(50,205,50)',
    borderRadius: '10px',
    backgroundColor: '#32CD32',
    '&, & .MuiListItemIcon-root': {
      color: 'white',
    },
    '& svg': {
      color: '#FF69B4',
      fontSize: '200%',
      transition: 'fontSize 0.5s'
    },
    '& span': {
      color: '#FF1493',
      fontSize: '120%',
      fontWeight: 'bold',
      transition: 'fontSize 0.5s'
    }
  },
});


function DrawerComponent() {
  const drawerWidth = 240;
  const [openDrawer, setOpenDrawer] = useState(false);
  const { token } = useToken();
  let decoded = jwt_decode(token);

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
    <>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundImage: `url(${drawerImage})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }
        }}
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      >
        <DrawerHeader>
          Hi, {decoded['email'].slice(0, decoded['email'].lastIndexOf("@"))}
        </DrawerHeader>
        <Divider />
        <StyledList>
          <List>
            <ListItem onClick={() => setOpenDrawer(false)}>
              <ListItemButton component="a" href="/">
                <ListItemIcon><HomeIcon /></ListItemIcon>
                <ListItemText primary='Home' />
              </ListItemButton>
            </ListItem>
          </List>
          <List>
            <ListItem onClick={() => setOpenDrawer(false)}>
              <ListItemButton component="a" href="/users">
                <ListItemIcon><SupervisorAccountIcon /></ListItemIcon>
                <ListItemText primary='Users' />
              </ListItemButton>
            </ListItem>
          </List>
          <List>
            <ListItem onClick={() => setOpenDrawer(false)}>
              <ListItemButton component="a" href="/dashboard">
                <ListItemIcon><DashboardIcon /></ListItemIcon>
                <ListItemText primary='Dashboard' />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />
          {
            token && 
              <List>
                <ListItem onClick={() => setOpenDrawer(false)}>
                  <ListItemButton component="a" href="/" onClick={signoutSubmit}>
                    <ListItemIcon><LogoutIcon /></ListItemIcon>
                    <ListItemText primary='Logout' />
                  </ListItemButton>
                </ListItem>
              </List>
          }
        </StyledList>

      </Drawer>
      <IconButton onClick={() => setOpenDrawer(!openDrawer)} style={{ color: "white" }}>
        <Tooltip title="Navigation menu">
          <MenuIcon />
        </Tooltip>
      </IconButton>
    </>
  );
}
export default DrawerComponent;