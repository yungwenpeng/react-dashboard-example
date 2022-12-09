import { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Typography, Box, TextField, Button, IconButton } from "@material-ui/core";
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import LockIcon from '@material-ui/icons/Lock';
import SendIcon from '@material-ui/icons/Send';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import ErrorIcon from '@mui/icons-material/Error';
import './Login.css';
import PropTypes from 'prop-types';
import { api_url } from '../../environment/environment';

function Login({ setToken }) {
  const [eye, seteye] = useState(true);
  const [textFieldType, setTextFieldType] = useState("password");
  const [username, setUserName] = useState();
  const [password, setPassword] = useState();
  const [postResult, setPostResult] = useState(null);

  useEffect(() => {
    if (postResult) {
      setTimeout(() => {
        setPostResult(null);
      }, 1000)
    }
  }, [postResult])

  async function loginUser(credentials) {
    console.log('loginUser:', credentials['username']);
    let login_data = {
      email: credentials['username'],
      password: credentials['password']
    }

    try {
      const res = await fetch(api_url + '/api/login', {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }),
        body: JSON.stringify(login_data)
      })
      if (!res.ok) {
        const message = "Login has failed.(" + res.status + " - " + res.statusText + ")\nDue to Incorrect email/password."
        setPostResult(message);
      }
      const data = await res.json();
      setToken(data);
    } catch (err) {
      console.log('err: ', err.message);
    }
  }

  const handleSubmit = async e => {
    e.preventDefault();
    if (username === undefined) {
      setPostResult('Email is required');
    } else if (password === undefined) {
      setPostResult('Password is required');
    } else {
      var emailValid = username.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
      var passwordValid = password.length >= 6;
      if (!emailValid) {
        setPostResult('Email is invalid');
      } else if (!passwordValid) {
        setPostResult('Password: minimum character length is 6');
      } else {
        await loginUser({
          username,
          password
        });
      }
    }
  }

  const Eye = () => {
    if (textFieldType === "password") {
      setTextFieldType("text");
      seteye(false);
    } else {
      setTextFieldType("password");
      seteye(true);
    }
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
            Login
          </Typography>
        </Toolbar>
      </AppBar>

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
            <Button className='button' variant="outlined" endIcon={<SendIcon />} type="submit">Login</Button>
          </div>
          {postResult &&
            <div className="alert alert-secondary mt-2" role="alert">
              <ErrorIcon fontSize='larger' />
              <pre>{postResult}</pre>
            </div>
          }
        </div>
      </form>
    </>
  );
}

export default Login;

Login.propTypes = {
  setToken: PropTypes.func.isRequired
}