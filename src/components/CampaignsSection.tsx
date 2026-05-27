import { ArrowRight } from "lucide-react";
import { campaigns } from "../data/campaigns";
import { CampaignCard } from "./CampaignCard";

export function CampaignsSection() {
  return (
    <section className="bg-slate-100 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-slate-950">
              Live Campaigns
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Real lives, verified stories, transparent impact.
            </p>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-950 transition hover:text-teal-700"
          >
            View All Active Cases
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </div>
    </section>
  );
}
