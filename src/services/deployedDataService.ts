import { DealDetails, Activity } from '@/types';
import { dealLogService } from './dealLogService';
import { MongoClient, ServerApiVersion, Db, ObjectId } from 'mongodb';
import { config } from '@/config';

export class DeployedDataService {
    private mongoClient: MongoClient;
    private mongoDb: Db | null = null;

    constructor() {
        // Initialize MongoDB client
        this.mongoClient = new MongoClient(config.databaseUrl, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });
    }

    private async connect(): Promise<Db> {
        if (this.mongoDb) {
            return this.mongoDb;
        }

        try {
            console.log("Connecting to MongoDB...");
            await this.mongoClient.connect();
            this.mongoDb = this.mongoClient.db('prod');
            console.log("Connected to MongoDB successfully");
            return this.mongoDb;
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
            throw error;
        }
    }


    async getShipmentsList(): Promise<DealDetails[]> {
        try {
            const db = await this.connect();
            const collection = db.collection('deals');

            console.log('Fetching deals from MongoDB deals collection');

            const deals = await collection
                .find({ isPublished: true })
                .toArray();

            console.log(`Found ${deals.length} published deals`);

            // Return deals directly from MongoDB with id field added
            return deals.map(deal => ({
                ...deal,
                id: deal._id.toString()
            })) as unknown as DealDetails[];
        } catch (error) {
            console.error('Error getting deals from MongoDB:', error);
            throw error;
        }
    }

    async getDealDetails(id: string): Promise<DealDetails> {
        try {
            const db = await this.connect();
            const collection = db.collection('deals');

            console.log('Fetching deal details from MongoDB for ID:', id);

            const deal = await collection.findOne({
                _id: new ObjectId(id),
                isPublished: true
            });

            if (!deal) {
                throw new Error('Deal not found');
            }

            console.log('Found deal:', JSON.stringify(deal, null, 2));

            // Return deal directly from MongoDB with id field added
            return {
                ...deal,
                id: deal._id.toString(),
                updatedAt: deal.updatedAt || deal.createdAt
            } as unknown as DealDetails;
        } catch (error) {
            console.error('Error getting deal details from MongoDB:', error);
            throw error;
        }
    }

    async getShipmentActivity(id: number): Promise<Activity[]> {
        try {
            console.log('Fetching activities for shipment ID:', id);

            // Fetch deal logs from MongoDB using the string ID directly
            const dealLogs = await dealLogService.findDealLogsByShipmentId(id);

            // Convert deal logs to activity format
            const activities = dealLogService.convertToShipmentActivities(dealLogs);

            console.log(`Found ${activities.length} activities for shipment ${id}`);
            return activities;
        } catch (error) {
            console.error('Error getting shipment activity from MongoDB:', error);
            throw error;
        }
    }

}

export const deployedDataService = new DeployedDataService();
