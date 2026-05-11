"use client";

import { CircleMintService } from "./circleMint";

/**
 * High-level helpers for Circle withdrawal flows.
 * These wrap the low-level CircleMintService methods and can be used by UI
 * components in the future. They are not currently imported anywhere.
 */

export async function getCircleWireBankAccounts() {
  const response = await CircleMintService.getWireBankAccounts();
  return response?.data ?? [];
}

export async function withdrawToVerifiedWallet(params: {
  amount: number;
  address: string;
  chain: string;
}) {
  const idempotencyKey = CircleMintService.generateIdempotencyKey();

  // Step 1: add recipient address
  const addRecipientResponse = await CircleMintService.addRecipientAddress({
    chain: params.chain,
    idempotencyKey: CircleMintService.generateIdempotencyKey(),
    address: params.address,
    currency: "USD",
    description: `Withdrawal to ${params.address.slice(0, 6)}...${params.address.slice(
      -4
    )}`,
  });

  const recipientId = addRecipientResponse.data.id as string;

  // Step 2: create transfer
  const transferResponse = await CircleMintService.createTransfer({
    destination: {
      type: "verified_blockchain",
      addressId: recipientId,
    },
    amount: {
      currency: "USD",
      amount: params.amount.toFixed(2),
    },
    idempotencyKey,
  });

  return transferResponse?.data ?? null;
}

export async function withdrawToBank(params: {
  amount: number;
  bankAccountId: string;
}) {
  const idempotencyKey = CircleMintService.generateIdempotencyKey();

  const payoutResponse = await CircleMintService.createPayout({
    destination: {
      type: "wire",
      id: params.bankAccountId,
    },
    amount: {
      currency: "USD",
      amount: params.amount.toFixed(2),
    },
    idempotencyKey,
  });

  return payoutResponse?.data ?? null;
}

