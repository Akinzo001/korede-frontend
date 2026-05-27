export type Campaign = {
  id: string;
  hospital: string;
  title: string;
  patient: string;
  description: string;
  raised: string;
  funded: number;
  imageUrl: string;
};

export const campaigns: Campaign[] = [
  {
    id: "case-4829",
    hospital: "Lagos State University Hospital",
    title: "Pediatric Heart Surgery for Amara",
    patient: "Amara",
    description:
      "Amara needs urgent corrective surgery for a congenital heart defect. Funds settle directly with the hospital.",
    raised: "N4,500,000",
    funded: 65,
    imageUrl:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "case-8832",
    hospital: "Reddington Hospital",
    title: "Emergency Oncology Care",
    patient: "Ifeanyi",
    description:
      "Ifeanyi requires immediate chemotherapy treatment. All donations are verified and reconciled to the hospital bill.",
    raised: "N850,000",
    funded: 22,
    imageUrl:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "case-6501",
    hospital: "Ikeja Medical Centre",
    title: "Orthopedic Reconstruction",
    patient: "Tunde",
    description:
      "Post-accident reconstructive surgery for an aspiring athlete with direct verification and treatment updates.",
    raised: "N1,400,000",
    funded: 45,
    imageUrl:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80",
  },
];

export const liveLedgerItems = [
  "Anonymous donor contributed N15,000 to Case #104 via Bank Transfer",
  "Tx: 4ZwP...9kLZ verified on-chain",
  "Donor ID: 2938 contributed N50,000 to Case #4029",
  "Hospital settlement escrow updated",
];
