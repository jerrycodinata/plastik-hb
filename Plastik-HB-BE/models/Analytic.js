"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Analytic = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Page_1 = require("./Page");
const Product_1 = require("./Product");
let Analytic = class Analytic extends sequelize_typescript_1.Model {
};
exports.Analytic = Analytic;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        field: "id"
    })
], Analytic.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('PAGE', 'PRODUCT', 'BUTTON'),
        allowNull: false
    })
], Analytic.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
        field: "target_id"
    })
], Analytic.prototype, "targetId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Page_1.Page, {
        foreignKey: 'target_id',
        constraints: false
    })
], Analytic.prototype, "page", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Product_1.Product, {
        foreignKey: 'target_id',
        constraints: false
    })
], Analytic.prototype, "product", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false
    })
], Analytic.prototype, "url", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
        field: "ip_address"
    })
], Analytic.prototype, "ipAddress", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false
    })
], Analytic.prototype, "location", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: "created_at"
    })
], Analytic.prototype, "createdAt", void 0);
exports.Analytic = Analytic = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "analytics",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    })
], Analytic);
