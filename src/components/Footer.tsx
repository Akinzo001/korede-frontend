const platformLinks = ["Explore Cases", "Hospital Partners", "Verification Process"];
const trustLinks = ["Privacy Policy", "Terms of Service", "Security Disclosure"];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-100 px-6 py-14">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1fr_auto_auto]">
        <div className="max-w-md">
          <h2 className="text-xl font-bold text-teal-950">Korede</h2>
          <p className="mt-5 text-sm leading-6 text-slate-600">
            A blockchain-powered healthcare fintech ensuring every donation
            fulfills its mission. Built on Sui for speed, trust, and
            zero-compromise transparency.
          </p>
          <p className="mt-8 text-sm text-slate-500">
            © {currentYear} Korede. Secured by Sui. CAC Certified.
          </p>
        </div>

        <FooterColumn title="Platform" links={platformLinks} />
        <FooterColumn title="Legal & Trust" links={trustLinks} />
      </div>
    </footer>
  );
}

type FooterColumnProps = {
  title: string;
  links: string[];
};

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-950">
        {title}
      </h3>
      <ul className="mt-5 space-y-4 text-sm text-slate-600">
        {links.map((link) => (
          <li key={link}>
            <a href="#" className="transition hover:text-teal-800">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
