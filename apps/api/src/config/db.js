import dotenv from 'dotenv';
dotenv.config();
import { configApi } from '../config/api.js';
import dbConfig from './db.cjs';
import { Sequelize } from 'sequelize';
import { logger } from '../../../../packages/logger/src/logger.js';

export function getConnection() {
    const config = dbConfig[configApi.env];
    const sequelize = new Sequelize(config.database, config.username, config.password, config);
    return sequelize;
}

export async function connect(sequelize) {
  const modelLogger = logger.child({"process": "model_creation"});
  try {
    await sequelize.authenticate();
    modelLogger.info("Connected to database successfully");
    return sequelize;
  }
  catch (err) {
    modelLogger.fatal("Couldn't connect to database");
    throw Error("Couldn't connect to database", { cause: err });
  }
}