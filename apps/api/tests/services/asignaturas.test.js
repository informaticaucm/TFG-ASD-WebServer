import { getAsignaturaById } from '../../src_copy/services/asignatura.js';
import { jest } from '@jest/globals'

describe('Pruebas unitarias /services/asignaturas.js', () => {
    let mockDb;

    beforeEach(() => {
        jest.clearAllMocks();

        mockDb = {
            sequelize: {
                models: {
                    Asignatura: {
                        findOne: jest.fn()
                    }
                }
            }
        };
    });

    /////////////// get asignatura by ID ///////////////

    it('Prueba de error al no encontrar asignatura', async () => {
        mockDb.sequelize.models.Asignatura.findOne.mockResolvedValue(undefined);

        await expect(getAsignaturaById(mockDb, 1))
            .rejects
            .toThrow('Asignatura no encontrada');

        /*expect(mockDb.sequelize.models.Asignatura.findOne).toHaveBeenCalledWith({
            attributes: ['id'],
            where: { id: 1 }
        });*/
    });

    it('Prueba de obtener asignatura existente', async () => {
        mockDb.sequelize.models.Asignatura.findOne.mockResolvedValue({ dataValues: { id: 1 } });

        const actividades = await getAsignaturaById(mockDb, 1);

        expect(actividades).toEqual({"dataValues": {"id": 1}});
    });

});
