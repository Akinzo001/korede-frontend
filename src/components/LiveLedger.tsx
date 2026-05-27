import { liveLedgerItems } from "../data/campaigns";

export function LiveLedger() {
  return (
    <div className="overflow-hidden bg-slate-950 py-3 text-sm font-medium text-white">
      <div className="mx-auto flex max-w-7xl gap-8 whitespace-nowrap px-6">
        {liveLedgerItems.map((item) => (
          <span key={item} className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
