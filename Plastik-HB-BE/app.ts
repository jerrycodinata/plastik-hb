import express from 'express';
import { Sequelize } from 'sequelize-typescript';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authenticationRouter from './routes/authenticationRoutes';
import { errorHandler } from './utils/errorHandler';
import { User } from './models/User';
import { Analytic } from './models/Analytic';
import { Asset } from './models/Asset';
import { Page } from './models/Page';
import { Product } from './models/Product';
import { Section } from './models/Section';
import { Session } from './models/Session';
import pageRouter from './routes/pageRoutes';
import contactRouter from './routes/contactRoutes';
import productRouter from './routes/productRoutes';
import categoryRouter from './routes/categoryRoutes';
import analyticRouter from './routes/analyticRoutes';
import uploadRoutes from './routes/uploadRoutes';
import { Category } from './models/Category';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;
const frontendUrl = process.env.VITE_FRONTEND_URL;

// Enable CORS with credentials
app.use(cors({
    origin: frontendUrl,
    credentials: true,
}));

// Increase payload limits for file uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve static files from frontend productImage folder
app.use('/images/products', express.static(path.join(__dirname, '../Plastik-HB-FE/src/assets/productImage')));

const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    models: [User, Analytic, Asset, Page, Product, Section, Session, Category],
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

app.get('/api/health', (req, res) => {
    res.status(200).send({ status: 'OK', uptime: process.uptime() });
});

app.use('/api/authentication', authenticationRouter);
app.use('/api/pages', pageRouter);
app.use('/api/contact', contactRouter);
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/analytics', analyticRouter);
app.use('/api/uploads', uploadRoutes);

// ENDS HERE

// Error handling middleware

app.use(errorHandler);
// app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
//     console.error(err.stack);
//     res.status(500).json({ error: 'Something went wrong!' });
// });

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://${process.env.DB_HOST}:${port}`);
    console.log(`You can also access it at http://localhost:${port}`);
});

export default app;