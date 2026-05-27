import { BadgeCheck } from "lucide-react";
import type { Campaign } from "../data/campaigns";

type CampaignCardProps = {
  campaign: Campaign;
};

export function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
      <div className="relative h-48 sm:h-56">
        <img
          src={campaign.imageUrl}
          alt={campaign.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute left-4 top-4 flex max-w-[calc(100%-2rem)] items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-teal-950 shadow-sm">
          <BadgeCheck className="h-4 w-4 shrink-0" />
          <span className="truncate">{campaign.hospital}</span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <h3 className="text-xl font-semibold text-slate-950 sm:text-2xl">
          {campaign.title}
        </h3>
        <p className="mt-3 min-h-16 text-sm leading-6 text-slate-600">
          {campaign.description}
        </p>

        <div className="mt-7 flex items-center justify-between gap-3 text-xs sm:text-sm">
          <span className="font-bold text-teal-950">
            {campaign.raised} raised
          </span>
          <span className="text-slate-600">{campaign.funded}% funded</span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-teal-100">
          <div
            className={`h-2 rounded-full bg-teal-800 ${campaign.progressClass}`}
          />
        </div>

        <button className="mt-6 w-full rounded-md bg-teal-800 px-5 py-4 text-sm font-bold text-white transition hover:bg-teal-900">
          View Case & Donate
        </button>
      </div>
    </article>
  );
}
