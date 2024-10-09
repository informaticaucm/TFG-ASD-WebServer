import { apiLogger } from '../../../../packages/logger/src/logger.js';
import { configApi } from '../config/api.js';
import { authenticator } from '../config/authenticator.js';
import { configQr } from '../config/qr.js';
import qrcode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';
import fs from 'node:fs';

export async function generateQR(req, res, next, db) {
  try {
    let idEspacio = Number(req.params.idEspacio);
    if (!Number.isInteger(idEspacio)) {
        let err = {};
        err.status = 400;
        err.message = 'Id suministrado no válido';
        return next(err);
    }
    
    const canvas = createCanvas(configQr.cvwidth, configQr.cvheight);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    let esp_info = await db.sequelize.models.Espacio.findOne({
      attributes: ['tipo', 'numero', 'edificio'],
      where: {
        id: idEspacio
      }
    });

    let disp_secret = await db.sequelize.models.Dispositivo.findOne({ 
      attributes: ['secret'],                             
      where: {
        espacioId: idEspacio
      }
    });

    let nombre = esp_info.tipo + " " + esp_info.numero;
    ctx.font = "bold 48px Sans";
    ctx.textAlign = 'center';
    ctx.fillStyle = "black";

    ctx.fillText(nombre, canvas.width/2, canvas.height/2 - configQr.qrheight/2 - 10);
    ctx.fillText(esp_info.edificio, canvas.width/2, canvas.height/2 + configQr.qrheight/2 + 10 + 48);

    let totp = authenticator.generate(disp_secret.secret);
    let filename = configQr.path + `/qr${idEspacio}.png`;
        
    apiLogger.info(`Generating QR for ${esp_info.nombre}...`);
    qrcode.toFile(filename,
      `${configApi.uiBaseUrl}/formulario-end/?espacio=${idEspacio}&totp=${totp}`, {
        errorCorrectionLevel: configQr.errorCorrectionLevel,  // M sirve para una pantalla de ordenador, para pantallas más pequeñas usar H
        width: configQr.qrwidth,
        height: configQr.qrheight
      }, function(error) {
        if (error) {
          apiLogger.error(`Error generating QR code:${error}`);
          let err = {};
          err.status = 400;
          err.message = error;
          return next(err);
        }
        apiLogger.info('QR code generated!');
          
        // Load the image after it has been generated
        if (fs.existsSync(filename)) { 
          loadImage(filename).then((image) => {
            ctx.drawImage(image, canvas.width/2 - configQr.qrwidth/2, canvas.height/2 - configQr.qrheight/2);
  
            let out = fs.createWriteStream(filename);
            let stream = canvas.createPNGStream();
          stream.pipe(out);
            out.on('finish', () => {
              apiLogger.info('QR image created');
              res.setHeader('Content-Type', 'image/png');
              res.status(200).sendFile(filename);
            });
          }).catch((error) => {
            apiLogger.error('Error cargando la imagen:', error);
            let err = {};
            err.status = 500;
            err.message = `Error cargando la imagen: ${error}`;
            return next(err);
          });
        } else {
          apiLogger.error('El archivo no existe:', filename);
          let err = {};
          err.status = 404;
          err.message = `El archivo no existe: ${error}`;
          return next(err);
        }
      }
    );
  }
  catch (error) {
    apiLogger.error(`Error generating QR code: ${error}`);
    let err = {};
    err.status = 400;
    err.message = error;
    return next(err);
  }
}