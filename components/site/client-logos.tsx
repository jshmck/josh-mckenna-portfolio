import { clients, type Client } from "@/lib/about";

/** brightness-0 forces every logo to solid black regardless of its source
 *  colours (a plain grayscale filter still leaves midtones grey) — flat,
 *  no hover-colour reveal, per Josh. Clients without a logo file fall back
 *  to plain text at matching height. Rendered as spans, not list items —
 *  every visual copy of this strip is aria-hidden (the sr-only <ul> in
 *  ClientLogos is the real list), but alt text stays as the visual
 *  fallback should a logo file ever 404. */
function Logo({ client }: { client: Client }) {
  return client.logo ? (
    <span
      className={`flex shrink-0 items-center ${
        client.size === "xl"
          ? "h-9"
          : client.size === "lg" || client.size === "icon"
            ? "h-5"
            : "h-3.5"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG, no responsive sizing needed */}
      <img
        src={client.logo}
        alt={client.name}
        className="h-full w-auto brightness-0"
      />
    </span>
  ) : (
    <span className="flex h-3.5 shrink-0 items-center">
      <span className="font-body text-[10px] text-ink-muted">
        {client.name}
      </span>
    </span>
  );
}

/** One infinitely-scrolling line of logos, leftward, pure CSS — same
 *  two-copies-translate(-50%) trick as components/site/marquee.tsx. The
 *  inter-logo gap rides inside each copy as trailing padding (pr-10 =
 *  gap-x-10) rather than as a flex gap on the track: with a track gap the
 *  seam between the copies is one gap wide but -50% only travels half of
 *  it, so the loop would visibly jump half a gap every cycle. */
function TickerRow({
  items,
  duration,
}: {
  items: Client[];
  /** CSS time, e.g. "34s". Row widths differ, so each row picks its own
   *  duration to keep the px/s pace roughly equal. */
  duration: string;
}) {
  return (
    <div className="ticker-fade-x overflow-hidden">
      <div
        className="flex w-max items-center"
        style={{
          animation: `marquee ${duration} linear infinite`,
          willChange: "transform",
        }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center gap-x-10 pr-10">
            {items.map((client) => (
              <Logo key={client.name} client={client} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** The Selected Clients strip — an animated logo ticker, right to left,
 *  full-bleed (the section in below-hero.tsx keeps its heading inside the
 *  frame and lets this run edge to edge). Two staggered lines at every
 *  width — the first pass ran mobile as one long line, revised to match
 *  desktop ("you can put the clients on two rows in mobile too," per
 *  Josh, along with "make them move a bit faster" — hence 34s/40s, up
 *  from 45s/52s). Slightly different durations stop the rows scrolling
 *  in lockstep.
 *
 *  Reduced motion gets the previous static wrap grid instead — the global
 *  reduced-motion rule would only freeze the ticker on its first frame,
 *  hiding every logo past the viewport edge. Screen readers get neither:
 *  both visual variants are aria-hidden and the sr-only list below is the
 *  one source of client names, read exactly once. */
export function ClientLogos() {
  const half = Math.ceil(clients.length / 2);
  const rows = [clients.slice(0, half), clients.slice(half)];

  return (
    <div>
      <ul className="sr-only">
        {clients.map((client) => (
          <li key={client.name}>{client.name}</li>
        ))}
      </ul>

      <div
        aria-hidden="true"
        className="flex flex-col gap-y-6 motion-reduce:hidden"
      >
        <TickerRow items={rows[0]} duration="34s" />
        <TickerRow items={rows[1]} duration="40s" />
      </div>

      {/* Container padding is re-applied here because the ticker above is
          full-bleed — this fallback is the only variant that needs the
          page gutters back. */}
      <div
        aria-hidden="true"
        className="mx-auto hidden max-w-frame px-6 motion-reduce:block md:px-gutter"
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          {clients.map((client) => (
            <Logo key={client.name} client={client} />
          ))}
        </div>
      </div>
    </div>
  );
}
