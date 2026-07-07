type BrandLogoProps = {
  size?: "sm" | "md" | "lg";
};

const logoSize = {
  sm: "h-8 w-8 sm:h-9 sm:w-9",
  md: "h-10 w-10 sm:h-12 sm:w-12",
  lg: "h-12 w-12 sm:h-14 sm:w-14",
};

const textSize = {
  sm: "text-base",
  md: "text-lg sm:text-xl",
  lg: "text-xl sm:text-2xl",
};

export function BrandLogo({ size = "sm" }: BrandLogoProps) {
  return (
    <span className="inline-flex items-center gap-3">
      <img
        src="/logo.png"
        alt="Korede logo"
        className={`${logoSize[size]} rounded-full object-cover`}
      />
      <span className={`${textSize[size]} font-bold text-teal-950`}>
        Korede
      </span>
    </span>
  );
}
