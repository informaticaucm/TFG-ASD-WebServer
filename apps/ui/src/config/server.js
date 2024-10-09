import dotenv from 'dotenv';
dotenv.config();
import { configBaseUi } from '@informaticaucm/seguimiento-base-config';

export const uiConfig = {
    ...configBaseUi,
    session_secret: (process.env.SESSION_SECRET) ? process.env.SESSION_SECRET : 'secretoPocoSeguro',
    timezone: (process.env.TZ)? process.env.TZ : 'Europe/Madrid',
    apiClient: process.env.API_CLIENT,
    apiSecret: process.env.API_SECRET,
}
