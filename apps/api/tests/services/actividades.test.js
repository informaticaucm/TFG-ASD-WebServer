import { getActividadesOfUsuario } from '../../src_copy/services/actividades.js';
import { jest } from '@jest/globals'

describe('Pruebas unitarias /services/actividades.js', () => {
    let mockDb;

    beforeEach(() => {
        jest.clearAllMocks();

        mockDb = {
            sequelize: {
                models: {
                    Docente: {
                        findOne: jest.fn()
                    },
                    Actividad: {
                        findAll: jest.fn()
                    }
                }
            }
        };
    });

    it('Prueba de error al no encontrar al usuario', async () => {
        mockDb.sequelize.models.Docente.findOne.mockResolvedValue(null);

        await expect(getActividadesOfUsuario(mockDb, 1))
            .rejects
            .toThrow('Usuario no encontrado');

        expect(mockDb.sequelize.models.Docente.findOne).toHaveBeenCalledWith({
            attributes: ['id'],
            where: { id: 1 }
        });
    });

    it('Prueba de usuario existente pero sin actividades', async () => {
        mockDb.sequelize.models.Docente.findOne.mockResolvedValue({ dataValues: { id: 1 } });

        mockDb.sequelize.models.Actividad.findAll.mockResolvedValue([]);

        const actividades = await getActividadesOfUsuario(mockDb, 1);

        expect(actividades).toEqual([]);
    });

    it('Prueba de usuario existente con actividades', async () => {
        mockDb.sequelize.models.Docente.findOne.mockResolvedValue({ dataValues: { id: 1 } });

        mockDb.sequelize.models.Actividad.findAll.mockResolvedValue([
            { dataValues: { id: 101 } },
            { dataValues: { id: 102 } }
        ]);

        const actividades = await getActividadesOfUsuario(mockDb, 1);

        expect(actividades).toEqual([{ id: 101 }, { id: 102 }]);
    });
});
