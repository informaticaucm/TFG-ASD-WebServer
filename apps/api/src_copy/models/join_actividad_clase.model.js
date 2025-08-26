import { DataTypes } from 'sequelize';

//Tabla de la relación asiste (Clase asiste Actividad)
export function model(sequelize, DataTypes) {
    
    const Join_Actividad_Clase = sequelize.define('Join_Actividad_Clase', {
    }, {
        freezeTableName: true,
        createdAt: 'creadoEn',
        updatedAt: 'actualizadoEn'
    });

    Join_Actividad_Clase.associate = function(models) {
        models.Join_Actividad_Clase.belongsTo(models.Actividad, { as: 'sesion_de', foreignKey: 'actividad_id' }); //Una actividad puede tener varias clases
        models.Join_Actividad_Clase.belongsTo(models.Clase, { as: 'clase_de', foreignKey: 'clase_id' }); //Una clase puede tener varias actividades
    }

    return Join_Actividad_Clase;
}
