import dotenv from 'dotenv';
dotenv.config();
import { configBaseApi } from '@informaticaucm/seguimiento-base-config';

const env = process.env.NODE_ENV || 'development';

export const configApi = {
    ...configBaseApi,
    env: env,
    secrets: (process.env.API_ALLOWED) ? JSON.parse(process.env.API_ALLOWED) : {"app": "","mtb": ""},
    timezone: (process.env.TZ)? process.env.TZ : 'Europe/Madrid',
    uiBaseUrl: (process.env.UI_BASE_URL) ? process.env.UI_BASE_URL : 'http://localhost:3000/',
}