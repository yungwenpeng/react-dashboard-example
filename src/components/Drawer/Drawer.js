import React, { useState } from "react";
import { 
  Divider, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, makeStyles
} from "@material-ui/core";
import HomeIcon from '@material-ui/icons/Home';
import { Link } from 'react-router-dom';

import MenuIcon from "@material-ui/icons/Menu";

const useStyles = makeStyles(()=>({
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

  return (
    <>
      <Drawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      >
        <List>
          <ListItem onClick={() => setOpenDrawer(false)}>
            <ListItemIcon><HomeIcon/></ListItemIcon>
            <ListItemText>
              <Link to="/" className={classes.link}>Home</Link>
            </ListItemText>
          </ListItem>
          <Divider/>
      </List>
    </Drawer>
    <IconButton onClick={() => setOpenDrawer(!openDrawer)}className={classes.icon}>
      <MenuIcon />
    </IconButton>
  </>
);
}
export default DrawerComponent;