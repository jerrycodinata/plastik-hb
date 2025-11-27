"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Asset = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Product_1 = require("./Product");
let Asset = class Asset extends sequelize_typescript_1.Model {
};
exports.Asset = Asset;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        field: "id"
    })
], Asset.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false
    })
], Asset.prototype, "url", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false
    })
], Asset.prototype, "alt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('IMAGE', 'VIDEO'),
        allowNull: false,
    })
], Asset.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
    })
], Asset.prototype, "order", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Product_1.Product),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
    })
], Asset.prototype, "product_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Product_1.Product)
], Asset.prototype, "product", void 0);
exports.Asset = Asset = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "assets",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    })
], Asset);
