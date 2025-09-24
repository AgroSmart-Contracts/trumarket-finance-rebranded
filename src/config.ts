export const config = {
    databaseUrl: process.env.DATABASE_URL || 'mongodb+srv://trumarket-finance-next:TA5V@22Q5TVh8rn@trumarket-dev.6dtepsu.mongodb.net/?retryWrites=true&w=majority&appName=TruMarket-dev',
    env: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'debug',
    prettyLogs: process.env.PRETTY_LOGS === 'true',
    version: process.env.COMMIT_HASH || 'v0.0.0',
    appDomain: process.env.APP_DOMAIN || 'http://localhost:3000',

    // AWS Configuration
    aws: {
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        s3Bucket: process.env.AWS_S3_BUCKET || 'trumarket-files',
    },

    // ICP Configuration
    icp: {
        canisterId: process.env.ICP_CANISTER_ID || 'uibem-miaaa-aaaal-qr7qq-cai',
        rpcProvider: process.env.ICP_RPC_PROVIDER || 'https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io',
    },
};
