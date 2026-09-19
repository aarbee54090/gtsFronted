import Link from "next/link";

interface DashboardLink {
  href: string;
  title: string;
  description: string;
}

interface DashboardGroup {
  title: string;
  links: DashboardLink[];
}

const GROUPS: DashboardGroup[] = [
  {
    title: "Catalog & Orders",
    links: [
      { href: "/admin/products", title: "Products", description: "Manage product sport-variants and their designs" },
      { href: "/admin/main-products", title: "Main Products", description: "Manage top-level product categories" },
      { href: "/admin/addons", title: "Addons", description: "Manage addon styles, pricing, and preview images" },
      { href: "/admin/orders", title: "Orders", description: "Review and approve customer orders" },
      { href: "/admin/payment", title: "Payment", description: "Configure payment methods and QR codes" },
    ],
  },
  {
    title: "GTS Hub Content",
    links: [
      { href: "/admin/hub-images", title: "Hub Card Images", description: "Background image for each GTS Hub landing card" },
      { href: "/admin/portfolio", title: "Portfolio", description: "Real GTS work - completed projects" },
      { href: "/admin/journal", title: "Journal", description: "Guides and behind-the-scenes articles" },
      { href: "/admin/new-arrivals", title: "New Arrivals", description: "Latest designs and collections" },
      { href: "/admin/materials", title: "Materials", description: "Fabrics and materials used in GTS products" },
      { href: "/admin/platforms", title: "Platforms", description: "Social and external platform links" },
    ],
  },
  {
    title: "Site Pages",
    links: [
      { href: "/admin/about", title: "About Us", description: "Edit the About Us page content" },
      { href: "/admin/contact", title: "Contact Us", description: "Edit contact info and view submitted messages" },
    ],
  },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-white">Dashboard</h1>

      <div className="flex flex-col gap-10">
        {GROUPS.map((group) => (
          <section key={group.title}>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-[var(--color-text-gray)]">
              {group.title}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex flex-col gap-1 rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--color-card-dark)]/60 p-6 backdrop-blur-[16px] transition-colors hover:border-[var(--color-brand-green)]"
                >
                  <span className="text-lg font-bold text-white">{link.title}</span>
                  <span className="text-sm text-[var(--color-text-gray)]">{link.description}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
