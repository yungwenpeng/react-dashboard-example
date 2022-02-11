// Modify host, port item, such as : thingsboard.io, 443
export const serverConfig = {
    host:'localhost',
    port:'9090',
};

// Modify api_url
export const api_url = 'http://' + serverConfig.host + ':' + serverConfig.port + '/api/';
export const websocket_url = 'ws://' + serverConfig.host + ':' + serverConfig.port + '/api'

// For https client
//export const api_url = 'https://' + serverConfig.host + ':' + serverConfig.port + '/api/';
//export const websocket_url = 'wss://' + serverConfig.host + ':' + serverConfig.port + '/api'