/**
 * Server-side configuration
 * Used by API routes, services, and server-side code only.
 * NOT exposed to the client — all variables here MUST be plain
 * (non-`NEXT_PUBLIC_`) env vars so Next.js never inlines them into
 * the browser bundle.
 */
export const serverConfig = {
    databaseUrl: process.env.DATABASE_URL || '',
    env: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'debug',
    prettyLogs: process.env.PRETTY_LOGS === 'true',
    version: process.env.COMMIT_HASH || 'v0.0.0',
    appDomain: process.env.APP_DOMAIN || 'http://localhost:3001',
    // Development mode: use 'test' database, Production: use 'prod' database
    isDevelopment: process.env.IS_DEVELOPMENT === 'true' ? true : false,
    databaseName: process.env.IS_DEVELOPMENT === 'true' ? 'test' : 'prod',
};

