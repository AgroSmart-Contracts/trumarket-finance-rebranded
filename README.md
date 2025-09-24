# Trumarket Finance - Next.js Version

This is a Next.js version of the Trumarket Finance application, using MongoDB instead of ICP (Internet Computer Protocol) for data storage.

## Features

- **Shipment Management**: View and manage trade finance deals
- **Milestone Tracking**: Track shipment progress through various stages
- **Activity Logging**: Monitor all activities related to shipments
- **Finance Integration**: Mock finance section for investment tracking
- **Responsive Design**: Modern UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Icons**: Phosphor Icons
- **UI Components**: Material-UI

## Setup Instructions

### Prerequisites

- Node.js 16+
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:
   Create a `.env.local` file in the root directory:

```
DATABASE_URL=mongodb://localhost:27017/trumarket-api

# AWS Configuration (optional, for file uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=trumarket-files

# ICP Configuration (for blockchain data)
ICP_CANISTER_ID=uibem-miaaa-aaaal-qr7qq-cai
ICP_RPC_PROVIDER=https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io
```

This uses the same database URL pattern as the main trumarket project.

3. Start MongoDB:
   You can either:

   **Option A: Use the same MongoDB instance as trumarket project:**

   ```bash
   cd /path/to/trumarket
   docker-compose up mongo
   ```

   **Option B: Start a local MongoDB instance:**

   ```bash
   mongod
   ```

4. Seed the database (optional):

```bash
curl -X POST http://localhost:3000/api/seed
```

5. Seed the database with sample data:

```bash
curl -X POST http://localhost:3000/api/deals/seed
```

This will populate the database with sample deals matching the trumarket schema.

6. Sync data from ICP canister (optional):

```bash
curl -X POST http://localhost:3000/api/sync/icp
```

This will sync data from the ICP canister to MongoDB.

7. Start the development server:

```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### ICP Canister Data

- `GET /api/icp/shipments` - Get shipments directly from ICP canister
- `GET /api/icp/shipments/[id]` - Get specific shipment from ICP canister
- `GET /api/icp/shipments/[id]/activities` - Get activities from ICP canister
- `GET /api/test/icp` - Test ICP connectivity and configuration

### Combined Data (MongoDB + ICP)

- `GET /api/combined/shipments` - Get shipments from both MongoDB and ICP
- `GET /api/combined/shipments/[id]` - Get specific shipment with combined data
- `GET /api/combined/shipments/[id]/activities` - Get activities from both sources
- `POST /api/sync/icp` - Sync data from ICP canister to MongoDB

### Deals (MongoDB Only)

- `GET /api/deals` - Get all deals (with filtering options)
- `POST /api/deals` - Create a new deal
- `GET /api/deals/[id]` - Get a specific deal
- `PUT /api/deals/[id]` - Update a deal
- `DELETE /api/deals/[id]` - Delete a deal
- `GET /api/deals/[id]/logs` - Get deal logs/activities
- `POST /api/deals/seed` - Seed the database with sample deals

### Legacy Shipments (for backward compatibility)

- `GET /api/shipments` - Get all shipments
- `POST /api/shipments` - Create a new shipment
- `GET /api/shipments/[id]` - Get shipment by ID
- `PUT /api/shipments/[id]` - Update shipment
- `GET /api/shipments/[id]/activities` - Get shipment activities
- `POST /api/shipments/[id]/activities` - Create activity
- `POST /api/seed` - Seed database with sample data

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── shipments/[id]/    # Dynamic shipment details page
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Scaffold.tsx       # Layout component
│   ├── ShipmentsList.tsx  # Shipments list page
│   ├── ShipmentDetails.tsx # Shipment details page
│   ├── RecentActivity.tsx # Activity list component
│   └── FinanceSection.tsx # Finance component
├── lib/                   # Utility functions
│   ├── mongodb.ts         # Database connection
│   ├── static.tsx         # Static data (milestones, etc.)
│   └── sampleData.ts      # Sample data for seeding
├── models/                # Mongoose models
│   ├── ShipmentDetails.ts # Shipment model
│   └── ShipmentActivity.ts # Activity model
└── types/                 # TypeScript types
    └── shipment.ts        # Shipment-related types
```

## Key Differences from ICP Version

1. **Database**: Uses MongoDB instead of ICP's stable storage
2. **API**: RESTful API routes instead of ICP canister methods
3. **Authentication**: Simplified (no ICP-specific auth)
4. **Deployment**: Standard Next.js deployment instead of ICP deployment
5. **Dependencies**: Standard npm packages instead of ICP-specific libraries

## Development

The application includes sample data that can be loaded using the seed endpoint. The finance section is currently mocked for demonstration purposes.

## License

This project is part of the Trumarket Finance platform.
