import { DataTypes } from 'sequelize';

export function model(sequelize) {
    
    const Nfcs = sequelize.define('Nfcs', {
        nfc: {
            type: DataTypes.BIGINT,
            primaryKey: true
        }
    }, {
        freezeTableName: true,
        createdAt: 'creadoEn',
        updatedAt: 'actualizadoEn'
    });

    Nfcs.associate = function (models) {
        models.Nfcs.belongsTo(models.Docente, { as: 'asociado_a', foreignKey: { name: 'usuario_id', allowNull: false }}); //Un nfc pertenece a un solo docente (asociado a)
    };

    return Nfcs;
}
