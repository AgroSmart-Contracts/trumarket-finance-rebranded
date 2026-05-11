'use client';

interface PoolBalanceRowProps {
  amountLabel: string;
  onMaxClick: () => void;
  maxDisabled?: boolean;
}

export function PoolBalanceRow({ amountLabel, onMaxClick, maxDisabled = false }: PoolBalanceRowProps) {
  return (
    <div className="mt-2 flex items-center justify-between text-xs text-[#62748E]">
      <span>
        Balance{' '}
        <span className="font-medium text-[#0F172B]">{amountLabel}</span>
      </span>
      <button
        type="button"
        onClick={onMaxClick}
        disabled={maxDisabled}
        className="font-semibold text-[#4E8C37] hover:text-[#3A6A28] disabled:cursor-not-allowed disabled:opacity-40"
      >
        MAX
      </button>
    </div>
  );
}
