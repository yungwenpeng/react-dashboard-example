import React, { useState } from "react";
import useToken from '../../useToken';
import jwt_decode from "jwt-decode";
import { styled } from "@mui/material/styles";
import drawerImage from '../../images/siderbar_bg.png';
import * as collections from '../../collections';

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

const StyledList = styled(collections.List)({
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
      <collections.Drawer
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
          Hi, {decoded['sub'].slice(0, decoded['sub'].lastIndexOf("@"))}
        </DrawerHeader>
        <collections.Divider />
        <StyledList>
          <collections.List>
            <collections.ListItem onClick={() => setOpenDrawer(false)}>
              <collections.ListItemButton component="a" href="/">
                <collections.ListItemIcon><collections.HomeIcon /></collections.ListItemIcon>
                <collections.ListItemText primary='Home' />
              </collections.ListItemButton>
            </collections.ListItem>
            <collections.ListItem onClick={() => setOpenDrawer(false)}>
              <collections.ListItemButton component="a" href="/devices">
                <collections.ListItemIcon><collections.DevicesOtherIcon /></collections.ListItemIcon>
                <collections.ListItemText primary='Devices' />
              </collections.ListItemButton>
            </collections.ListItem>
            <collections.ListItem onClick={() => setOpenDrawer(false)}>
              <collections.ListItemButton component="a" href="/dashboard">
                <collections.ListItemIcon><collections.DashboardIcon /></collections.ListItemIcon>
                <collections.ListItemText primary='Dashboard' />
              </collections.ListItemButton>
            </collections.ListItem>
          </collections.List>
          <collections.Divider />
          {
            token &&
            <collections.List>
              <collections.ListItem onClick={() => setOpenDrawer(false)}>
                <collections.ListItemButton component="a" href="/" onClick={signoutSubmit}>
                  <collections.ListItemIcon><collections.LogoutIcon /></collections.ListItemIcon>
                  <collections.ListItemText primary='Logout' />
                </collections.ListItemButton>
              </collections.ListItem>
            </collections.List>
          }
        </StyledList>

      </collections.Drawer>
      <collections.IconButton onClick={() => setOpenDrawer(!openDrawer)} style={{ color: "white", alignItems: 'center' }}>
        <collections.Tooltip title="Navigation menu">
          <collections.MenuIcon />
        </collections.Tooltip>
      </collections.IconButton>
    </>
  );
}
export default DrawerComponent;