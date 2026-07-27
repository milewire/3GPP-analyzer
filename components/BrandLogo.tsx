export default function BrandLogo({
  width,
  height,
  className,
  priority = false,
}: {
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}) {
  const imgProps = {
    alt: "3GPP Analyzer",
    width,
    height,
    decoding: "async" as const,
    ...(priority ? { fetchPriority: "high" as const } : {}),
  };

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-mark.png"
        className={`dark:hidden ${className || ""}`}
        {...imgProps}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-mark-dark.png"
        className={`hidden dark:block ${className || ""}`}
        {...imgProps}
      />
    </>
  );
}
