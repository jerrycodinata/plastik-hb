"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.middlewareWrapper = middlewareWrapper;
function middlewareWrapper(middlewareWrapper) {
    return async (req, res, next) => {
        try {
            await middlewareWrapper(req, res, next);
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
