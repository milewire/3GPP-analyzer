import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { getTechnologies } from "@/lib/api";

export const revalidate = 3600;

export default async function TechnologiesPage() {
  const { technologies } = await getTechnologies();

  return (
    <div className="container-page py-10">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Technologies" }]} />

      <div className="mb-8 text-center">
        <h1 className="section-heading">Technologies</h1>
        <p className="mt-2 text-secondary">
          Explore the radio access, core network, and service-layer technologies defined across 3GPP
          releases.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {technologies.map((tech) => (
          <Link
            key={tech.slug}
            href={`/technology/${tech.slug}/`}
            className="rounded-lg border border-bordera bg-white p-5 transition hover:border-primary hover:shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-3xl">{tech.icon}</span>
              {tech.generation && (
                <span className="rounded-full border border-borderb bg-offwhite px-2.5 py-0.5 text-xs font-semibold text-secondary">
                  {tech.generation}
                </span>
              )}
            </div>
            <h2 className="text-base font-semibold text-darktext">{tech.name}</h2>
            <p className="mt-1 text-sm text-secondary line-clamp-2">{tech.description}</p>
            {tech.intro_release && (
              <p className="mt-3 text-xs font-medium text-primary">Introduced {tech.intro_release}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
