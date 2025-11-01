# 🌾 TruMarket Finance — Investor Dashboard

**TruMarket Finance** is the investor-facing dashboard of [TruMarket](https://trumarket.tech), a **Web3 AgroTrade & Real-World Asset (RWA)** platform that brings agricultural exports on-chain.  
Through this dashboard, verified investors can seamlessly participate in **tokenized trade deals** created by exporters and earn stable returns backed by real-world assets.

---

## 🚀 Overview

TruMarket Finance enables investors to:

- 💰 **Invest in Tokenized Export Deals** — Access pre-vetted, asset-backed agricultural trade opportunities.
- ⛓️ **Track On-Chain Investments** — Transparent milestone updates and blockchain-verified settlements.
- 📊 **View Portfolio Analytics** — Monitor active deals, earnings, and real-time payment flows.
- 🔐 **Enjoy Secure Non-Custodial Access** — Wallet-based authentication (no centralized fund custody).

---

## 🧩 Key Features

| Feature                              | Description                                                                                    |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| **Deal Tokenization**                | Each export financing deal is tokenized on-chain, allowing fractional participation.           |
| **Milestone Tracking**               | Smart contracts release funds progressively based on verified shipment and payment milestones. |
| **Activity Logging**                 | Real-time monitoring of all shipment activities and financial transactions.                    |
| **Cross-Border Payments**            | Ongoing integration of instant on/off-ramp and multi-currency settlements.                     |
| **Shipment Management**              | Comprehensive view of trade finance deals with detailed status tracking.                       |
| **AI Risk Insights (Upcoming)**      | Machine learning models to evaluate exporter performance and shipment risk.                    |
| **Multi-Chain Liquidity (Upcoming)** | Liquidity pools deployed across XRPL and Flow for yield diversification.                       |

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (React 19 + TypeScript)
- **UI Framework:** Tailwind CSS + Material-UI + shadcn/ui
- **Backend:** Node.js + MongoDB (Mongoose)
- **Blockchain Integrations:**
  - ICP (Internet Computer Protocol) for immutable trade data
  - XRPL (cross-border payments, stablecoin rails)
  - Flow (liquidity pools and staking incentives)
- **Icons:** Phosphor Icons
- **Wallet Support:** MetaMask, WalletConnect, and XUMM (for XRPL)
- **Hosting:** AWS Amplify + CloudFront + S3 (file storage)

---

## 🌍 Current Focus

We are currently working on integrating **cross-border payment features** to enable instant USD↔USDC settlements between exporters and investors, starting with corridors such as **Peru ↔ Europe** and **Egypt ↔ U.S.**

This Next.js version uses **MongoDB for scalable data management** while maintaining ICP integration for blockchain-verified trade data.

---

## 📈 Roadmap

| Quarter | Milestone                                          |
| ------- | -------------------------------------------------- |
| Q4 2025 | Cross-border payments integration (USD↔USDC)       |
| Q1 2026 | Deployment of liquidity pools on XRPL              |
| Q2 2026 | Expansion to Flow blockchain + rewards program     |
| Q3 2026 | Launch of AI-powered exporter risk analytics       |
| Q4 2026 | Multi-country rollout and institutional onboarding |

---

## 🧑‍💼 For Investors

- Minimum deal size: varies per exporter
- Settlement time: <10 seconds (on-chain)
- Typical yield: 12–15% annualized (deal-dependent)
- Deal transparency: verified trade documents and milestone-based fund release

---

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**  
   Create a `.env.local` file in the root directory:

```bash
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

3. **Start MongoDB:**

   **Option A: Use the same MongoDB instance as trumarket project:**

   ```bash
   cd /path/to/trumarket
   docker-compose up mongo
   ```

   **Option B: Start a local MongoDB instance:**

   ```bash
   mongod
   ```

4. **Seed the database with sample data:**

```bash
# Seed deals
curl -X POST http://localhost:3000/api/deals/seed

# Seed legacy shipments (optional)
curl -X POST http://localhost:3000/api/seed
```

5. **Sync data from ICP canister (optional):**

```bash
curl -X POST http://localhost:3000/api/sync/icp
```

6. **Start the development server:**

```bash
npm run dev
```

7. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Testing the System

### Test ICP Connectivity

```bash
curl http://localhost:3000/api/test/icp
```

### Get ICP Shipments

```bash
curl http://localhost:3000/api/icp/shipments
```

### Create Sample Activities for a Shipment

```bash
# First, get a shipment ID from the above command
# Then create sample deal logs (activities) for that shipment
curl -X POST "http://localhost:3000/api/deal-logs/seed?dealId=123"
```

### Get Activities for a Shipment

```bash
# This will now fetch from MongoDB instead of ICP
curl http://localhost:3000/api/icp/shipments/123/activities
```

---

## 📡 API Endpoints

### ICP Canister Data

- `GET /api/icp/shipments` - Get shipments directly from ICP canister
- `GET /api/icp/shipments/[id]` - Get specific shipment from ICP canister
- `GET /api/icp/shipments/[id]/activities` - Get activities from MongoDB (not ICP)
- `GET /api/test/icp` - Test ICP connectivity and configuration

### Deal Logs (MongoDB)

- `GET /api/deal-logs?dealId=[id]` - Get deal logs from MongoDB
- `POST /api/deal-logs` - Create a new deal log
- `POST /api/deal-logs/seed?dealId=[id]` - Seed sample deal logs for testing

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

---

## 📁 Project Structure

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
│   ├── ShipmentDetails.ts # Activity model
└── types/                 # TypeScript types
    └── shipment.ts        # Shipment-related types
```

---

## 🔄 Key Differences from ICP Version

| Aspect             | ICP Version             | Next.js Version                |
| ------------------ | ----------------------- | ------------------------------ |
| **Database**       | ICP stable storage      | MongoDB                        |
| **API**            | ICP canister methods    | RESTful API routes             |
| **Authentication** | ICP-specific auth       | Simplified (wallet-based)      |
| **Deployment**     | ICP canister deployment | Standard Next.js (AWS Amplify) |
| **Dependencies**   | ICP-specific libraries  | Standard npm packages          |

---

## 🧠 Learn More

- Main site: [https://trumarket.tech](https://trumarket.tech)
- Investor dashboard: [https://finance.trumarket.tech](https://finance.trumarket.tech)
- Pitch deck & roadmap: _available on request_

---

## 🤝 Partnerships & Programs

TruMarket is part of:

- **XRPL Accelerator / Grant Program**
- **Flow Blockchain Forte Hackathon 2025**
- **AWS Activate Startup Program**
- **Internet Computer Protocol (ICP) Ecosystem**

---

## 📨 Contact

For investor or partnership inquiries:  
📧 **admin@trumarket.tech**  
🌍 [https://trumarket.tech](https://trumarket.tech)

---

## 💻 Development

This project is part of the [TruMarket](https://trumarket.tech) ecosystem — the comprehensive Web3 AgroTrade platform revolutionizing agricultural export financing.

---

**Built with ❤️ by the TruMarket Team | Part of [https://trumarket.tech](https://trumarket.tech)**
