"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllerWrapper_1 = require("../utils/controllerWrapper");
const contactController_1 = require("../controllers/contactController");
const authenticate_1 = __importDefault(require("../middlewares/authenticate"));
const router = (0, express_1.Router)();
router.get('/', (0, controllerWrapper_1.controllerWrapper)(contactController_1.getContactInfo));
router.put('/', authenticate_1.default, (0, controllerWrapper_1.controllerWrapper)(contactController_1.putContactInfo));
exports.default = router;
