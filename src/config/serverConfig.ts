/**
 * Server-side configuration
 * Used by API routes, services, and server-side code only
 * NOT exposed to the client
 */
export const serverConfig = {
    databaseUrl: process.env.NEXT_PUBLIC_DATABASE_URL || '',
    env: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'debug',
    prettyLogs: process.env.PRETTY_LOGS === 'true',
    version: process.env.COMMIT_HASH || 'v0.0.0',
    appDomain: process.env.APP_DOMAIN || 'http://localhost:3000',
    // Development mode: use 'test' database, Production: use 'prod' database
    isDevelopment: process.env.IS_DEVELOPMENT === 'true' || process.env.NODE_ENV === 'development',
    databaseName: (process.env.IS_DEVELOPMENT === 'true' || process.env.NODE_ENV === 'development') ? 'test' : 'prod',
};

