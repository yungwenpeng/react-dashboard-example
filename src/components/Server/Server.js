const express = require('express');
const cors = require('cors')
const app = express();
const jwt = require('jsonwebtoken')

let andyyou = {
  name: 'yourmail@test.com',
  password: '12345678',
  admin: true
}

// JWT access token secret key
ACCESS_TOKEN_SECRET = 'YOUR_SECRET_KEY'
// JWT refresh token secret key (use different secrets for refresh and access tokens)
REFRESH_TOKEN_SECRET = 'YOUR_SECRET_KEY'
// access token expiry (default 15 minutes)
ACCESS_TOKEN_EXPIRY = '15m'
// refresh token expiry (default 7 days)
REFRESH_TOKEN_EXPIRY = '7d'
// refresh token cookie name
REFRESH_TOKEN_COOKIE_NAME = 'jid'

app.use(cors());

app.use('/login', (req, res) => {
  const accessToken = jwt.sign(
    andyyou,
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
  const refreshToken = jwt.sign(
    andyyou,
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
  res.send({
    token: accessToken,
    refreshToken: refreshToken
  });
});

app.listen(8080, () => console.log('API is running on http://localhost:8080/login'));
