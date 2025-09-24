import type { ActorMethod } from '@dfinity/agent';

export interface DocumentFile {
    _id: string;
    url: string;
    description: string;
}

export interface Milestone {
    id: string;
    docs: DocumentFile[];
    fundsDistribution: number;
}

export interface ShipmentDetails {
    id: string;
    status: string;
    destination: string;
    expectedShippingEndDate: string;
    docs: DocumentFile[];
    quality: string;
    offerUnitPrice: number;
    name: string;
    origin: string;
    transport: string;
    vaultAddress: [] | [string];
    description: string;
    investmentAmount: number;
    portOfOrigin: string;
    nftID: number;
    currentMilestone: number;
    quantity: number;
    mintTxHash: string;
    presentation: string;
    shippingStartDate: string;
    variety: string;
    portOfDestination: string;
    milestones: Milestone[];
}

export interface Activity {
    activityType: string;
    createdAt: string;
    description: string;
    txHash: string;
}

export interface MilestoneDetails {
    id: string;
    docs: DocumentFile[];
    fundsDistribution: number;
}

export interface _SERVICE {
    createShipment: ActorMethod<[ShipmentDetails, string], undefined>;
    createShipmentActivity: ActorMethod<[string, Activity, string], undefined>;
    getShipmentActivity: ActorMethod<[string], Activity[]>;
    getShipmentDetails: ActorMethod<[string], ShipmentDetails>;
    getShipmentsList: ActorMethod<[], ShipmentDetails[]>;
    getVersion: ActorMethod<[], string>;
    updateMilestone: ActorMethod<[string, MilestoneDetails, string], undefined>;
}
