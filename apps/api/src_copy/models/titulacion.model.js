import { DataTypes } from 'sequelize';

export function model(sequelize) {

    const Titulacion = sequelize.define('Titulacion', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },      
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        siglas: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        freezeTableName: true,
        createdAt: 'creadoEn',
        updatedAt: 'actualizadoEn'
    });

    Titulacion.associate = function (models) {
        models.Titulacion.hasMany(models.Plan, { as: 'con_planes', foreignKey: 'titulacion_id'}); //Una titulación ofrece uno o más planes
    };

    return Titulacion;
}
