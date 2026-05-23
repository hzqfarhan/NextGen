import { Bill, BillFrequency, AutoPaySafety } from "@/store/useStore";

/**
 * Calculates the next due date based on current due date and frequency.
 */
export function calculateNextDueDate(currentDate: string, frequency: BillFrequency): string {
  const date = new Date(currentDate);
  if (isNaN(date.getTime())) return new Date().toISOString();

  switch (frequency) {
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
    case "one-time":
    default:
      // For one-time, we don't advance
      break;
  }
  return date.toISOString();
}

/**
 * Checks if a bill is due today or overdue.
 */
export function isBillDue(nextDueDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(nextDueDate);
  due.setHours(0, 0, 0, 0);
  return due <= today;
}

/**
 * Determines if AutoPay is safe based on the safety rule.
 */
export function isAutoPaySafe(
  bill: Bill,
  totalBalance: number,
  spendableBalance: number,
  daysUntilNextAllowance: number
): { safe: boolean; reason?: string } {
  const amount = bill.amount;

  if (totalBalance < amount) {
    return { safe: false, reason: "Insufficient total balance" };
  }

  switch (bill.autopaySafety) {
    case "strict":
      // Pay only if spendable balance remains above RM10/day for remaining period
      const remainingSpendable = spendableBalance - amount;
      const days = Math.max(1, daysUntilNextAllowance);
      if (remainingSpendable / days < 10) {
        return { safe: false, reason: "Strict safety: Balance would drop below RM10/day" };
      }
      return { safe: true };

    case "balanced":
      // Pay if the bill is locked/protected and projected month-end balance is not negative.
      // For simplicity in this demo, we check if spendable balance is enough or if it's already locked.
      if (bill.isLocked || spendableBalance >= amount) {
        return { safe: true };
      }
      return { safe: false, reason: "Balanced safety: Bill not locked and spendable balance too low" };

    case "flexible":
    default:
      // Pay if current total balance is enough.
      return { safe: true };
  }
}

/**
 * Masks account number for UI display.
 */
export function maskAccountNumber(acc: string): string {
  if (!acc) return "";
  if (acc.length <= 4) return acc;
  return "****" + acc.slice(-4);
}
