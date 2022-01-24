// Modify host, port item, such as : thingsboard.io, 443
export const serverConfig = {
    host:'localhost',
    port:'8080',
};

// Modify api_url
export const api_url = 'http://' + serverConfig.host + ':' +
                          serverConfig.port + '/login/';