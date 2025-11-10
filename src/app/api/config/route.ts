import { NextResponse } from 'next/server';
import { BlockchainConfig } from '@/config/types';

/**
 * API endpoint to provide blockchain configuration to the client
 * Returns configuration from environment variables
 */
export async function GET() {
    const config: BlockchainConfig = {
        evmChainId: process.env.NEXT_PUBLIC_EVM_CHAIN_ID || '0x1',
        blockchainExplorer: process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER || 'https://etherscan.io',
        investmentTokenAddress: process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_CONTRACT_ADDRESS || '',
        investmentTokenSymbol: process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_SYMBOL || 'USDC',
        investmentTokenDecimals: process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_DECIMALS || '18',
        dealsManagerAddress: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || '',
    };

    return NextResponse.json(config);
}

