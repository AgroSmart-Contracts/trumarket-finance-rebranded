export interface Attachment {
    _id: string;
    url: string;
    description: string;
}

export interface MilestoneDetails {
    docs: Attachment[];
    id: string;
    fundsDistribution: number;
}

export interface ShippingDetails {
    id: string;
    name: string;
    status: string;
    origin: string;
    destination: string;
    presentation: string;
    variety: string;
    docs: Attachment[];
    portOfDestination: string;
    portOfOrigin: string;
    shippingStartDate: string;
    expectedShippingEndDate: string;
    currentMilestone: number;
    milestones: MilestoneDetails[];
    quality: string;
    offerUnitPrice: number;
    quantity: number;
    transport: string;
    description: string;
    investmentAmount: number;
    nftID: number;
    mintTxHash: string;
    vaultAddress: string;
    createdAt: string;
    updatedAt: string;
}

export interface ShipmentActivity {
    id: string;
    shipmentId: string;
    activityType: string;
    createdAt: string;
    description: string;
    txHash: string;
}
