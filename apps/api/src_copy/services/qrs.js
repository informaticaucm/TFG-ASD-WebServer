import { apiLogger } from '../../../../packages/logger/src/logger.js';
import { configApi } from '../config/api.js';
import { authenticator } from '../config/authenticator.js';
import { configQr } from '../config/qr.js';
import qrcode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';
import fs from 'node:fs';
import path from 'path';
import { notFoundError, validationError } from '../errors/errors.js';

export async function generateQR(req, idEspacio, db) {
    apiLogger.info(`Generating QR for espacio id: ${idEspacio}`);

    // Obtener información del espacio
    const esp_info = await db.sequelize.models.Espacio.findOne({
        attributes: ['tipo', 'numero', 'edificio'],
        where: { id: idEspacio }
    });

    if (!esp_info) {
        throw notFoundError('Espacio no encontrado');
    }

    // Obtener secreto del dispositivo
    const disp_secret = await db.sequelize.models.Dispositivo.findOne({
        attributes: ['secret'],
        where: { espacioId: idEspacio }
    });

    if (!disp_secret) {
        throw notFoundError('Dispositivo asociado al espacio no encontrado');
    }

    // Preparar información para el QR
    const canvas = createCanvas(configQr.cvwidth, configQr.cvheight);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const nombre = `${esp_info.tipo} ${esp_info.numero}`;
    ctx.font = 'bold 48px Sans';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText(nombre, canvas.width / 2, canvas.height / 2 - configQr.qrheight / 2 - 10);
    ctx.fillText(esp_info.edificio, canvas.width / 2, canvas.height / 2 + configQr.qrheight / 2 + 10 + 48);

    const totp = authenticator.generate(disp_secret.secret);
    const filename = path.join(configQr.path, `qr${idEspacio}.png`);

    // Generar el archivo QR
    await new Promise((resolve, reject) => {
        qrcode.toFile(
            filename,
            `${configApi.uiBaseUrl}/formulario-end/?espacio=${idEspacio}&totp=${totp}`,
            {
                errorCorrectionLevel: configQr.errorCorrectionLevel,
                width: configQr.qrwidth,
                height: configQr.qrheight
            },
            (error) => {
                if (error) {
                    apiLogger.error(`Error generating QR code: ${error}`);
                    return reject(validationError(`Error generating QR code: ${error}`));
                }
                resolve();
            }
        );
    });

    // Verificar que el archivo existe
    if (!fs.existsSync(filename)) {
        throw notFoundError(`El archivo QR no se generó correctamente: ${filename}`);
    }

    // Cargar la imagen generada y completarla
    await new Promise((resolve, reject) => {
        loadImage(filename)
            .then((image) => {
                ctx.drawImage(image, canvas.width / 2 - configQr.qrwidth / 2, canvas.height / 2 - configQr.qrheight / 2);

                const out = fs.createWriteStream(filename);
                const stream = canvas.createPNGStream();
                stream.pipe(out);
                out.on('finish', resolve);
            })
            .catch((error) => {
                apiLogger.error(`Error cargando la imagen: ${error}`);
                reject(validationError(`Error cargando la imagen: ${error}`));
            });
    });

    return { filePath: filename };
}
