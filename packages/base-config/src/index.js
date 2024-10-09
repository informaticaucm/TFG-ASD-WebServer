import dotenv from 'dotenv';
dotenv.config();

const apiHost = (process.env.API_HOST) ? process.env.API_HOST : 'localhost';
export const configBaseApi = {
    host: (process.env.API_HOST) ? process.env.API_HOST : 'localhost',
    port: (process.env.API_PORT) ? process.env.API_PORT : 3001,
    path: (process.env.API_PATH) ? process.env.API_PATH : '/api/v1',
    protocol: (process.env.API_PROTOCOL) ? process.env.API_PROTOCOL : "http",
    port_spec: (process.env.API_PORT_SPECIFICATION === "true" || apiHost == 'localhost') ? true : false,
}

export function getApiBaseUrl() {
    const port_spec = (configBaseApi.port_spec) ? `:${configBaseApi.port}` : '';
    const apiBaseUrl = `${configBaseApi.protocol}://${configBaseApi.host}${port_spec}${configBaseApi.path}`;
    return apiBaseUrl;
}

const uiHost = (process.env.SERVER_HOST) ? process.env.SERVER_HOST : 'localhost';
export const configBaseUi = {
    port_spec: (process.env.SERVER_PORT_SPECIFICATION === "true" || uiHost == 'localhost') ? true : false,
    port: (process.env.SERVER_PORT) ? process.env.SERVER_PORT : 3000,
    host: uiHost,
    protocol: (process.env.SERVER_PROTOCOL) ? process.env.SERVER_PROTOCOL : "http",
    path: (process.env.SERVER_PATH) ? process.env.SERVER_PATH : ''
}

