// components/tool-page/ToolSeoBlock.tsx
import React from "react";

type FaqItem = {
  question: string;
  answer: React.ReactNode;
};

type ToolSeoBlockProps = {
  title?: string;              // e.g. "How to Crop a PDF"
  description?: string;        // short intro paragraph

  steps?: string[];            // how-to steps
  faqs?: FaqItem[];            // FAQ items

  children?: React.ReactNode;  // escape hatch for custom SEO content
  className?: string;
};

export default function ToolSeoBlock({
  title,
  description,
  steps,
  faqs,
  children,
  className,
}: ToolSeoBlockProps) {
  return (
    <section
      className={[
        "w-full",
        "rounded-2xl border border-gray-200 bg-white",
        "p-6 sm:p-8",
        className || "",
      ].join(" ")}
    >
      {/* Title */}
      {title ? (
        <h2 className="text-xl font-semibold tracking-tight text-gray-900">
          {title}
        </h2>
      ) : null}

      {/* Description */}
      {description ? (
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
          {description}
        </p>
      ) : null}

      {/* Steps */}
      {steps && steps.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-base font-semibold text-gray-900">
            How it works
          </h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-600">
            {steps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>
      ) : null}

      {/* FAQ */}
      {faqs && faqs.length > 0 ? (
        <div className="mt-8">
          <h3 className="text-base font-semibold text-gray-900">
            Frequently Asked Questions
          </h3>
          <div className="mt-4 space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-gray-200 p-4"
              >
                <div className="text-sm font-medium text-gray-900">
                  {faq.question}
                </div>
                <div className="mt-2 text-sm leading-6 text-gray-600">
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Custom content */}
      {children ? (
        <div className="mt-8 text-sm leading-6 text-gray-600">
          {children}
        </div>
      ) : null}

      {/* Footer hint (temporary) */}
      <div className="mt-8 text-xs text-gray-400">
        SEO content will be expanded automatically in Phase 3.
      </div>
    </section>
  );
}