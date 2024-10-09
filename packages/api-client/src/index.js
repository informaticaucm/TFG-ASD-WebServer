import wretch from 'wretch';

export const valoresAsistencia = ['Asistida', 'Asistida con Irregularidad', 'No Asistida'];

export function buildClient(apiBaseUrl, apiClient, apiSecret, messagingLogger) {
    return new SeguimientoClient(apiBaseUrl, apiClient, apiSecret, messagingLogger);
}

class SeguimientoClient {
    constructor(apiBaseUrl, apiClient, apiSecret, messagingLogger) {
        this.apiClient = wretch(apiBaseUrl);
        this.apiClient = apiClient;
        this.apiSecret = apiSecret;
        this.messagingLogger = messagingLogger;
    }

    async getFromApi(req_path, server_response, omit_error) {
        const getResult = await this.apiClient.headers({"X-Token": `${this.apiClient}:${this.apiSecret}`}).get(req_path)
        .error(response => {
            if (!omit_error && response.status >= 400 && response.status < 500) {
                throw response.status
            }
            else {
                server_response.status(response.status).send(response.text());
                this.messagingLogger.error(`Received status code ${response.status} on a get to ${req_path}`);
                return null;
            }
        }).res(async response => { 
            return (response.headers.get('Content-Type').includes('application/json')) ? response.json() : response.text();
        });
        return getResult;
    }
    
    async sendToApiJSON(json, req_path, server_response, omit_error) {
        
        const postResult = await this.apiClient.headers({"X-Token": `${this.apiClient}:${this.apiSecret}`}).post(json, req_path)
        .error(response => {
            if (!omit_error && response.status >= 400 && response.status < 500) {
                this.messagingLogger.error(`Received status code ${response.status} on a post to ${req_path}`);
                throw response.status
            }
            else {
                server_response.status(500).send("Something went wrong");
                this.messagingLogger.error(`Received status code ${response.status} on a post to ${req_path}`);
                return null;
            }
        }).res(async response => { 
            return (response.headers.get('Content-Type').includes('application/json')) ? response.json() : response.text();
        });
        return postResult;
    }
    
}
