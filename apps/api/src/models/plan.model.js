import { DataTypes } from 'sequelize';

export function model(sequelize) {

    const Plan = sequelize.define('Plan', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        año: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        freezeTableName: true,
        createdAt: 'creadoEn',
        updatedAt: 'actualizadoEn'
    });

    Plan.associate = function (models) {
        models.Plan.belongsTo(models.Titulacion, { as: 'de_titulacion', foreignKey: 'titulacion_id', allowNull: false }); //Un plan es ofrecido en una titulación
        models.Plan.hasMany(models.Asignatura, { as: 'con_asignaturas', foreignKey: 'plan_id' }); //Un plan tiene una o más asignaturas
    };

    return Plan;
}
