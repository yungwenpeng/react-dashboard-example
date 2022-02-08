import { useState } from 'react';
import { Typography, Box, TextField, Button, IconButton } from "@material-ui/core";
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import LockIcon from '@material-ui/icons/Lock';
import SendIcon from '@material-ui/icons/Send';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import './Login.css';
import PropTypes from 'prop-types';
import { api_url } from '../../environment/environment';

async function loginUser(credentials) {
  console.log('loginUser:', credentials['username']);
  let login_data = '{"username":"' + credentials['username'] 
                            + '", "password":"'+ credentials['password'] + '"}'

  return fetch(api_url + 'auth/login', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }),
    body: login_data
  })
    .then(data => data.json())
}


function Login({ setToken }) {
  const[eye,seteye] = useState(true);
  const[textFieldType,setTextFieldType] = useState("password");
  const [username, setUserName] = useState();
  const [password, setPassword] = useState();

  const handleSubmit = async e => {
    e.preventDefault();
    const token = await loginUser({
      username,
      password
    });
    setToken(token);
  }

  const Eye = () => {
    if(textFieldType === "password"){
      setTextFieldType("text");
      seteye(false);
    } else{
      setTextFieldType("password");
      seteye(true);
    }
  }

  return (
    <>
      <header className='App-header'>
        <Typography variant="h4">Welcome to demo homepage</Typography>
      </header>
      <form className="login-header" onSubmit={handleSubmit}>
        <div className="card">
          <p>Enter your credentials to access your account.</p>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccountCircleIcon fontSize='inherit' sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            <TextField 
              type="text"
              className="input-text" 
              id="input-with-email"
              label="Enter your email"
              variant="outlined"
              onChange={e => setUserName(e.target.value)}
            />
          </Box>
          <Box className="input-text" sx={{ display: 'flex', alignItems: 'center' }}>
            <LockIcon fontSize='inherit' sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            <TextField
              type={textFieldType}
              className="input-text" 
              id="input-with-password"
              label="Enter your password"
              InputProps={{
                endAdornment: (
                  <IconButton onClick={Eye}>
                    {eye ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                )
              }}
              variant="outlined"
              onChange={e => setPassword(e.target.value)}
            />
          </Box>
          <div className="buttons">
            <Button className='button' variant="outlined" endIcon={<SendIcon />} type="submit">Sign In</Button>
          </div>
        </div>
      </form>
    </>
  );
}

export default Login;

Login.propTypes = {
  setToken: PropTypes.func.isRequired
}