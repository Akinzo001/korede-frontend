import { liveLedgerItems } from "../data/campaigns";

export function LiveLedger() {
  const tickerItems = [...liveLedgerItems, ...liveLedgerItems];

  return (
    <div className="overflow-hidden bg-slate-950 py-3 text-xs font-medium text-white sm:text-sm">
      <div className="flex w-max animate-ledger-scroll gap-8 whitespace-nowrap px-4 hover:[animation-play-state:paused] sm:gap-10 sm:px-6">
        {tickerItems.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
