import dotenv from 'dotenv';
dotenv.config();
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

/// TODO: node >= 20.11 import.meta.dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const qrpath = (process.env.QR_FOLDER_PATH) ? resolve(resolve(__dirname, '../../'), process.env.QR_FOLDER_PATH) : resolve(__dirname, '../../qrs/');

//Si no existe la carpeta, la creamos
if (!fs.existsSync(qrpath)) {
    fs.mkdirSync(qrpath);
}

export const configQr = { 
    qrwidth: (process.env.QR_WIDTH) ? Number(process.env.QR_WIDTH) : 300, 
    qrheight: (process.env.QR_HEIGHT) ? Number(process.env.QR_HEIGHT) : 300, 
    cvwidth: (process.env.CANVAS_WIDTH) ? Number(process.env.CANVAS_WIDTH) : 500,
    cvheight: (process.env.CANVAS_HEIGHT) ? Number(process.env.CANVAS_HEIGHT) : 500,
    path: (process.env.QR_FOLDER_PATH) ? resolve(resolve(__dirname, '../../'), process.env.QR_FOLDER_PATH) : resolve(__dirname, '../../qrs/'),
    errorCorrectionLevel: process.env.QR_CORRECTION_LEVEL || 'M'
};
