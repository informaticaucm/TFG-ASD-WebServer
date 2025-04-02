import { logger } from '../../../../packages/logger/src/logger.js';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readdir } from 'node:fs/promises';

export async function initializeModels(sequelize) {
    /// TODO: node >= 20.11 import.meta.dirname
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const modelLogger = logger.child({ "process": "model_creation" });

    const modelos = await readdir(`${__dirname}`);
    const modelosPromesas = modelos
        .filter(file => file.endsWith('.model.js'))
        .map(async modelFileDefinition => {
            const modulePath = resolve(__dirname, modelFileDefinition);
            const module = await import(modulePath);
            const model = module['model'](sequelize);
            modelLogger.info(`Detected ${model.name} model`);
            return model;
        });

    const modelosInicializados = await Promise.all(modelosPromesas);

    // Registrar los modelos en sequelize.models
    for (const modelo of modelosInicializados) {
        sequelize.models[modelo.name] = modelo;
    }

    // Configurar asociaciones si existen
    for (const modelo of modelosInicializados) {
        if (modelo.associate) {
            modelo.associate(sequelize.models);
        }
    }

    return { sequelize, models: sequelize.models };
}
