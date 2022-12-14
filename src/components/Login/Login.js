import { useState, useEffect } from 'react';
import * as collections from '../../collections';
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
    let login_data = '{"username":"' + credentials['username']
      + '", "password":"' + credentials['password'] + '"}'

    try {
      const res = await fetch(api_url + 'auth/login', {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }),
        body: login_data
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
      var passwordValid = password.length >= 8;
      if (!emailValid) {
        setPostResult('Email is invalid');
      } else if (!passwordValid) {
        setPostResult('Password: minimum character length is 8');
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
      <collections.AppBar position="static">
        <collections.Toolbar>
          <collections.Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
            Login
          </collections.Typography>
        </collections.Toolbar>
      </collections.AppBar>

      <form className="login-header" onSubmit={handleSubmit}>
        <div className="card">
          <p>Enter your credentials to access your account.</p>
          <collections.Box sx={{ display: 'flex', alignItems: 'center' }}>
            <collections.AccountCircleIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            <collections.TextField
              type="text"
              className="input-text"
              id="input-with-email"
              label="Enter your email"
              variant="outlined"
              onChange={e => setUserName(e.target.value)}
            />
          </collections.Box>
          <collections.Box className="input-text" sx={{ display: 'flex', alignItems: 'center' }}>
            <collections.LockIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            <collections.TextField
              type={textFieldType}
              className="input-text"
              id="input-with-password"
              label="Enter your password"
              InputProps={{
                endAdornment: (
                  <collections.IconButton onClick={Eye}>
                    {eye ? <collections.VisibilityIcon /> : <collections.VisibilityOffIcon />}
                  </collections.IconButton>
                )
              }}
              variant="outlined"
              onChange={e => setPassword(e.target.value)}
            />
          </collections.Box>
          <div className="buttons">
            <collections.Button className='button' variant="outlined" endIcon={<collections.SendIcon />} type="submit">Login</collections.Button>
          </div>
          {postResult &&
            <div className="alert alert-secondary mt-2" role="alert">
              <collections.ErrorIcon fontSize='larger' />
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