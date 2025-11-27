"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sequelize_typescript_1 = require("sequelize-typescript");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const authenticationRoutes_1 = __importDefault(require("./routes/authenticationRoutes"));
const errorHandler_1 = require("./utils/errorHandler");
const User_1 = require("./models/User");
const Analytic_1 = require("./models/Analytic");
const Asset_1 = require("./models/Asset");
const Page_1 = require("./models/Page");
const Product_1 = require("./models/Product");
const Section_1 = require("./models/Section");
const Session_1 = require("./models/Session");
const pageRoutes_1 = __importDefault(require("./routes/pageRoutes"));
const contactRoutes_1 = __importDefault(require("./routes/contactRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const analyticRoutes_1 = __importDefault(require("./routes/analyticRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const Category_1 = require("./models/Category");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 5000;
const frontendUrl = process.env.VITE_FRONTEND_URL;
// Enable CORS with credentials
app.use((0, cors_1.default)({
    origin: frontendUrl,
    credentials: true,
}));
// Increase payload limits for file uploads
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
// Serve static files for uploaded images
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
// Serve static files from frontend productImage folder
app.use('/images/products', express_1.default.static(path_1.default.join(__dirname, '../Plastik-HB-FE/src/assets/productImage')));
const sequelize = new sequelize_typescript_1.Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    models: [User_1.User, Analytic_1.Analytic, Asset_1.Asset, Page_1.Page, Product_1.Product, Section_1.Section, Session_1.Session, Category_1.Category],
});
// Test database connection
sequelize.authenticate()
    .then(() => console.log('Database connected successfully!'))
    .catch(err => {
    console.error('Database connection failed. Please check the credentials and database server:', err);
    process.exit(1);
});
// API routes
app.get('/', (req, res) => {
    res.send('Backend is running!');
});
app.use('/api/authentication', authenticationRoutes_1.default);
app.use('/api/pages', pageRoutes_1.default);
app.use('/api/contact', contactRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
app.use('/api/analytics', analyticRoutes_1.default);
app.use('/api/uploads', uploadRoutes_1.default);
// ENDS HERE
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
//     console.error(err.stack);
//     res.status(500).json({ error: 'Something went wrong!' });
// });
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://${process.env.DB_HOST}:${port}`);
    console.log(`You can also access it at http://localhost:${port}`);
});
exports.default = app;
