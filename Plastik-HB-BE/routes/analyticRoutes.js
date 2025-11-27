"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllerWrapper_1 = require("../utils/controllerWrapper");
const analyticController_1 = require("../controllers/analyticController");
const router = (0, express_1.Router)();
router.get('/', (0, controllerWrapper_1.controllerWrapper)(analyticController_1.getAnalytics));
router.post("/", (0, controllerWrapper_1.controllerWrapper)(analyticController_1.addAnalytics));
exports.default = router;
