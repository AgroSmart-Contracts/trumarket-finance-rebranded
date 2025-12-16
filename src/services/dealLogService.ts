import { serverConfig } from '@/config/serverConfig';
import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb';
import { DealLog } from '@/types';

export class DealLogService {
    private client: MongoClient;
    private db: Db | null = null;

    constructor() {
        const uri = serverConfig.databaseUrl;

        this.client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });
    }

    private async connect(): Promise<Db> {
        if (this.db) {
            return this.db;
        }

        try {
            console.log("Connecting to MongoDB...");
            const uri = serverConfig.databaseUrl;

            this.client = new MongoClient(uri, {
                serverApi: {
                    version: ServerApiVersion.v1,
                    strict: true,
                    deprecationErrors: true,
                }
            });
            await this.client.connect();
            console.log("Connected to MongoDB successfully");
            console.log("Available databases:", await this.client.db().admin().listDatabases());
            // Use 'test' database for development, 'prod' for production
            const dbName = serverConfig.databaseName;
            this.db = await this.client.db(dbName);
            console.log(`Connected to MongoDB database: ${dbName} (${serverConfig.isDevelopment ? 'development' : 'production'} mode)`);
            return this.db;
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
            throw error;
        }
    }

    async findDealLogs(nftId: number): Promise<DealLog[]> {
        try {
            const db = await this.connect();
            const collection = db.collection('deallogs');

            const logs = await collection
                .find({ dealId: nftId })
                .sort({ blockTimestamp: -1 })
                .toArray();

            return logs.map((log) => ({
                id: log._id.toString(),
                dealId: log.dealId,
                event: log.event,
                args: log.args,
                blockNumber: log.blockNumber,
                blockTimestamp: log.blockTimestamp,
                txHash: log.txHash,
                message: log.message,
            }));
        } catch (error) {
            console.error('Error fetching deal logs:', error);
            throw error;
        }
    }

    async findDealLogsByShipmentId(dealId: number): Promise<DealLog[]> {
        try {
            const db = await this.connect();
            const collection = db.collection('dealslogs');

            console.log(`Querying deallogs collection for dealId: ${dealId}`);

            const logs = await collection
                .find({ dealId: dealId })
                .toArray();

            const mappedLogs = logs.map((log) => ({
                id: log._id.toString(),
                dealId: log.dealId,
                event: log.event,
                args: log.args,
                blockNumber: log.blockNumber,
                blockTimestamp: log.blockTimestamp,
                txHash: log.txHash,
                message: log.message,
            }));

            console.log(`Mapped deal logs:`, JSON.stringify(mappedLogs, null, 2));
            return mappedLogs;
        } catch (error) {
            console.error('Error fetching deal logs by shipment ID:', error);
            throw error;
        }
    }

    async createDealLog(logData: Partial<DealLog>): Promise<DealLog> {
        try {
            const db = await this.connect();
            const collection = db.collection('deallogs');

            const result = await collection.insertOne({
                dealId: logData.dealId,
                event: logData.event,
                args: logData.args,
                blockNumber: logData.blockNumber,
                blockTimestamp: logData.blockTimestamp,
                txHash: logData.txHash,
                message: logData.message,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            return {
                id: result.insertedId.toString(),
                dealId: logData.dealId!,
                event: logData.event!,
                args: logData.args!,
                blockNumber: logData.blockNumber!,
                blockTimestamp: logData.blockTimestamp!,
                txHash: logData.txHash!,
                message: logData.message!,
            };
        } catch (error) {
            console.error('Error creating deal log:', error);
            throw error;
        }
    }

    // Convert deal logs to shipment activities format
    // convertToShipmentActivities(logs: DealLog[]): any[] {
    //     return logs.map(log => ({
    //         activityType: log.event,
    //         description: log.message || `${log.event} occurred`,
    //         createdAt: log.blockTimestamp.toISOString(),
    //         txHash: log.txHash,
    //     }));
    // }

}

export const dealLogService = new DealLogService();


