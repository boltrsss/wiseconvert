// components/tool-page/ToolHero.tsx
import React from "react";

type BreadcrumbItem = {
  label: string;
  href?: string; // optional, can be plain text for now
};

type ToolHeroProps = {
  title: string;
  description?: string;

  // Optional breadcrumbs (FreeConvert-like)
  breadcrumbs?: BreadcrumbItem[];

  // Optional small badges (e.g., "Free", "Online", "Secure")
  badges?: string[];

  // Optional right-side content (e.g., share buttons later)
  right?: React.ReactNode;

  className?: string;
};

export default function ToolHero({
  title,
  description,
  breadcrumbs,
  badges,
  right,
  className,
}: ToolHeroProps) {
  return (
    <section className={["w-full", className || ""].join(" ")}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav className="text-xs text-gray-500">
          <ol className="flex flex-wrap items-center gap-1">
            {breadcrumbs.map((item, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <li key={`${item.label}-${idx}`} className="flex items-center gap-1">
                  {item.href && !isLast ? (
                    <a
                      href={item.href}
                      className="hover:text-gray-700 hover:underline"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className={isLast ? "text-gray-700" : ""}>
                      {item.label}
                    </span>
                  )}
                  {!isLast ? <span className="text-gray-400">/</span> : null}
                </li>
              );
            })}
          </ol>
        </nav>
      ) : null}

      <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        {/* Left */}
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            {title}
          </h1>

          {badges && badges.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {badges.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600"
                >
                  {b}
                </span>
              ))}
            </div>
          ) : null}

          {description ? (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
              {description}
            </p>
          ) : null}
        </div>

        {/* Right */}
        {right ? (
          <div className="shrink-0 lg:pt-1">
            {right}
          </div>
        ) : null}
      </div>
    </section>
  );
}
