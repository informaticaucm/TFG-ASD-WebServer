import { messagingLogger } from '@informaticaucm/seguimiento-logger';
import { getApiBaseUrl } from '@informaticaucm/seguimiento-base-config';
import { uiConfig } from './config/server.js';
import { buildClient } from '@informaticaucm/seguimiento-api-client';

const apiClient = buildClient(getApiBaseUrl(), uiConfig.apiClient, uiConfig.apiSecret, messagingLogger);

export async function getFromApi(req_path, server_response, omit_error) {
    return apiClient.getFromApi(req_path, server_response, omit_error);
}

export async function sendToApiJSON(json, req_path, server_response, omit_error) {
    return apiClient.sendToApiJSON(json, req_path, server_response, omit_error);
}
