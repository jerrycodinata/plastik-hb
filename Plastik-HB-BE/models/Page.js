"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Page = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Section_1 = require("./Section");
let Page = class Page extends sequelize_typescript_1.Model {
};
exports.Page = Page;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        field: "id"
    })
], Page.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    })
], Page.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    })
], Page.prototype, "slug", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
    })
], Page.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        allowNull: true,
    })
], Page.prototype, "published", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Section_1.Section, {
        foreignKey: 'page_id',
        sourceKey: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
], Page.prototype, "sections", void 0);
exports.Page = Page = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "pages",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    })
], Page);
