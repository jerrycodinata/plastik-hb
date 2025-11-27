"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllerWrapper = controllerWrapper;
function controllerWrapper(routeHandler) {
    return async (req, res, next) => {
        try {
            const result = await routeHandler(req, res, next);
            if (res.headersSent)
                return;
            const status = result.status || 200;
            res.status(status).json(result);
        }
        catch (error) {
            next(error);
        }
    };
}
