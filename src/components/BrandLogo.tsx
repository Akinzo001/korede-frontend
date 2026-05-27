type BrandLogoProps = {
  size?: "sm" | "md";
};

const logoSize = {
  sm: "h-8 w-8 sm:h-9 sm:w-9",
  md: "h-10 w-10 sm:h-12 sm:w-12",
};

export function BrandLogo({ size = "sm" }: BrandLogoProps) {
  return (
    <span className="inline-flex items-center gap-3">
      <img
        src="/logo.png"
        alt="Korede logo"
        className={`${logoSize[size]} rounded-full object-cover`}
      />
      <span className="font-bold text-teal-950">Korede</span>
    </span>
  );
}
