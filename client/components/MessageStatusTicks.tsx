import type { MessageStatus } from "../types";

type Props = Readonly<{
  status: MessageStatus;
  isSelf: boolean;
}>;

export default function MessageStatusTicks({ status, isSelf }: Props) {
  if (!isSelf) return null;

  const colorClass = isSelf ? "text-slate-400" : "text-slate-500";
  const readColorClass = isSelf ? "text-sky-300" : "text-sky-600";

  if (status === "sending") {
    return (
      <span className={`text-xs ${colorClass}`} aria-label="Sending">
        ○
      </span>
    );
  }

  if (status === "delivered") {
    return (
      <span className={`text-xs ${colorClass}`} aria-label="Delivered">
        ✓
      </span>
    );
  }

  return (
    <span className={`text-xs ${readColorClass}`} aria-label="Read">
      ✓✓
    </span>
  );
}
