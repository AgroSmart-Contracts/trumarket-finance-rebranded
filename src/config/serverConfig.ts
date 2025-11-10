/**
 * Server-side configuration
 * Used by API routes, services, and server-side code only
 * NOT exposed to the client
 */
export const serverConfig = {
    databaseUrl: process.env.DATABASE_URL || 'mongodb+srv://trumarket-finance-next:TA5V%4022Q5TVh8rn@trumarket-dev.6dtepsu.mongodb.net/?retryWrites=true&w=majority&appName=TruMarket-dev',
    env: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'debug',
    prettyLogs: process.env.PRETTY_LOGS === 'true',
    version: process.env.COMMIT_HASH || 'v0.0.0',
    appDomain: process.env.APP_DOMAIN || 'http://localhost:3000',
};

