"use client";

import { CircleMintService } from "./circleMint";

/**
 * High-level helpers for Circle deposit flows.
 * These wrap the low-level CircleMintService methods and can be used by UI
 * components in the future. They are not currently imported anywhere.
 */

export async function getCircleDepositAddresses() {
  const response = await CircleMintService.getDepositAddresses();
  return response?.data ?? [];
}

export async function generateCircleDepositAddress(
  currency: "USD" | "EUR",
  chain: string
) {
  const response = await CircleMintService.createDepositAddress(currency, chain);
  return response?.data ?? null;
}

export async function getCircleBalance() {
  const response = await CircleMintService.getBalance();
  return response?.data ?? null;
}

