import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { ShipmentDetails, Activity, MilestoneDetails } from '@/types/icp';

// Candid interface definition for the canister
const idlFactory = ({ IDL }: { IDL: any }) => {
    const DocumentFile = IDL.Record({
        _id: IDL.Text,
        url: IDL.Text,
        description: IDL.Text,
    });

    const Milestone = IDL.Record({
        id: IDL.Text,
        docs: IDL.Vec(DocumentFile),
        fundsDistribution: IDL.Float64,
    });

    const ShipmentDetails = IDL.Record({
        id: IDL.Text,
        status: IDL.Text,
        destination: IDL.Text,
        expectedShippingEndDate: IDL.Text,
        docs: IDL.Vec(DocumentFile),
        quality: IDL.Text,
        offerUnitPrice: IDL.Float32,
        name: IDL.Text,
        origin: IDL.Text,
        transport: IDL.Text,
        vaultAddress: IDL.Opt(IDL.Text),
        description: IDL.Text,
        investmentAmount: IDL.Float32,
        portOfOrigin: IDL.Text,
        nftID: IDL.Int32,
        currentMilestone: IDL.Int16,
        quantity: IDL.Int32,
        mintTxHash: IDL.Text,
        presentation: IDL.Text,
        shippingStartDate: IDL.Text,
        variety: IDL.Text,
        portOfDestination: IDL.Text,
        milestones: IDL.Vec(Milestone),
    });

    const Activity = IDL.Record({
        activityType: IDL.Text,
        createdAt: IDL.Text,
        description: IDL.Text,
        txHash: IDL.Text,
    });

    const MilestoneDetails = IDL.Record({
        id: IDL.Text,
        docs: IDL.Vec(DocumentFile),
        fundsDistribution: IDL.Float64,
    });

    return IDL.Service({
        createShipment: IDL.Func([ShipmentDetails, IDL.Text], [], []),
        createShipmentActivity: IDL.Func([IDL.Text, Activity, IDL.Text], [], []),
        getShipmentActivity: IDL.Func([IDL.Text], [IDL.Vec(Activity)], ['query']),
        getShipmentDetails: IDL.Func([IDL.Text], [ShipmentDetails], ['query']),
        getShipmentsList: IDL.Func([], [IDL.Vec(ShipmentDetails)], ['query']),
        getVersion: IDL.Func([], [IDL.Text], ['query']),
        updateMilestone: IDL.Func([IDL.Text, MilestoneDetails, IDL.Text], [], []),
    });
};

export class DeployedDataService {
    private canister: Actor;
    private canisterId: string;
    private rpcProvider: string;

    constructor() {
        this.canisterId = process.env.ICP_CANISTER_ID || 'uibem-miaaa-aaaal-qr7qq-cai';
        this.rpcProvider = process.env.ICP_RPC_PROVIDER || 'https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io';

        const agent = new HttpAgent({
            host: this.rpcProvider,
        });

        // Fetch root key for certificate validation during development
        if (process.env.NODE_ENV !== 'production') {
            agent.fetchRootKey().catch((err) => {
                console.warn(
                    'Unable to fetch root key. Check to ensure that your local replica is running',
                );
                console.error(err);
            });
        }

        this.canister = Actor.createActor(idlFactory, {
            agent,
            canisterId: Principal.fromText(this.canisterId),
        });
    }

    async getVersion(): Promise<string> {
        try {
            return await (this.canister as any).getVersion();
        } catch (error) {
            console.error('Error getting ICP version:', error);
            throw error;
        }
    }

    async getShipmentsList(): Promise<ShipmentDetails[]> {
        try {
            return await (this.canister as any).getShipmentsList();
        } catch (error) {
            console.error('Error getting shipments from ICP:', error);
            throw error;
        }
    }

    async getShipmentDetails(id: string): Promise<ShipmentDetails> {
        try {
            return await (this.canister as any).getShipmentDetails(id);
        } catch (error) {
            console.error('Error getting shipment details from ICP:', error);
            throw error;
        }
    }

    async getShipmentActivity(id: string): Promise<Activity[]> {
        try {
            return await (this.canister as any).getShipmentActivity(id);
        } catch (error) {
            console.error('Error getting shipment activity from ICP:', error);
            throw error;
        }
    }

    async createShipment(shipment: ShipmentDetails, signature: string): Promise<void> {
        try {
            await (this.canister as any).createShipment(shipment, signature);
        } catch (error) {
            console.error('Error creating shipment on ICP:', error);
            throw error;
        }
    }

    async createShipmentActivity(
        id: string,
        activity: Activity,
        signature: string
    ): Promise<void> {
        try {
            await (this.canister as any).createShipmentActivity(id, activity, signature);
        } catch (error) {
            console.error('Error creating shipment activity on ICP:', error);
            throw error;
        }
    }

    async updateMilestone(
        id: string,
        milestone: MilestoneDetails,
        signature: string
    ): Promise<void> {
        try {
            await (this.canister as any).updateMilestone(id, milestone, signature);
        } catch (error) {
            console.error('Error updating milestone on ICP:', error);
            throw error;
        }
    }

    // Helper method to create a mock signature for testing
    createMockSignature(): string {
        return '202a9e30f303a8ec8ed0a7d2143100728dae672e3cbcaf12eb7d484329f3e1b026751f93cded7b1a0540fb07d47b50e042f9ff443d9123d4a6a64156a585ef6782704240a9f5124c0682d231c7c12287b22cd96de9ca5f97e968ebb01f2505b8e6d0c617a8b30c65ab457f0ee4f2bed26aa4a0adbf4bf769a30b51291a274ae424f488a726528f9d45f38223db67dd12213ad0d34b96416edb22f676d099f9310b05f24540bb35c7b799d3fc03e3706fa6ed777d0e152c4bb97d5e8f6ca3fa6b37e4d959413e4de5a3330dbef508a44b5bd0371b0cf4114ebd83d0093937625062fcc14fe220a754eb4d6cb5d4063214068048b6c0177e958ad1dc76ca9ee54e';
    }
}

export const deployedDataService = new DeployedDataService();
