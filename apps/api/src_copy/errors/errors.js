/* Adaptación de: 
- https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/useonlythebuiltinerror.md
- https://javascript.info/custom-errors
- https://futurestud.io/tutorials/node-js-create-your-custom-error
*/
export class AppError extends Error {
    constructor(message, httpCode, cause) {
        super(message, { cause });
        this.name = this.constructor.name;
        this.status = httpCode;
    }
}

export function notFoundError(message, cause) {
    throw new AppError(message, 404, cause);
}

export function notExpectedError({message = 'Ooops, Error no esperado', cause = undefined} = {}) {
    throw new AppError(message, 500, cause);
}

export function errorValidacion(message, cause) {
    throw new AppError(message, 400, cause);
}