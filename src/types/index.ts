// =============================================================================
// CORE DATA TYPES
// =============================================================================

// Document/File attachment type
export interface Attachment {
    _id: string;
    url: string;
    description: string;
    seenByUsers?: string[];
    publiclyVisible?: boolean;
}

// Milestone type for deals
export interface MilestoneDetails {
    _id: string;
    id: string; // For backward compatibility
    description: string;
    fundsDistribution: number;
    approvalStatus: string;
    docs: Attachment[];
}

// Main deal/shipment data structure (matches MongoDB schema)
export interface DealDetails {
    _id: string;
    id: string; // For backward compatibility with UI components
    name: string;
    description: string;
    contractId: number;
    origin: string;
    destination: string;
    portOfOrigin: string;
    portOfDestination: string;
    transport: string;
    presentation: string;
    variety: string;
    quality: string;
    offerUnitPrice: number;
    quantity: number;
    shippingStartDate: string;
    expectedShippingEndDate: string;
    currentMilestone: number;
    milestones: MilestoneDetails[];
    status: string;
    isPublished: boolean;
    investmentAmount: number;
    revenue: number;
    netBalance: number;
    roi: number;
    buyers: any[];
    suppliers: any[];
    buyerCompany: any;
    supplierCompany: any;
    newDocuments: boolean;
    docs: Attachment[];
    whitelist: any[];
    createdAt: string;
    updatedAt: string; // Made required for UI compatibility
    __v: number;
    mintTxHash: string;
    nftID: number;
    vaultAddress: string;
}

// Activity/Log type for deal activities
export interface Activity {
    activityType: string;
    createdAt: string;
    description: string;
    txHash: string;
}

// Deal log type for database operations
export interface DealLog {
    id: string;
    dealId: number;
    event: string;
    args: any;
    blockNumber: number;
    blockTimestamp: Date;
    txHash: string;
    message: string;
}


// =============================================================================
// DISPLAY/UI TYPES
// =============================================================================
// Note: ShippingDetails has been merged into DealDetails above

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
