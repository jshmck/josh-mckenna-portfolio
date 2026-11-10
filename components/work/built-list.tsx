import type { BuiltItem } from "@/lib/projects";

/**
 * A "What I built" list: one short line per deliverable, label on the left,
 * detail on the right. On phones each item runs in, label then detail on the
 * same line, so the list doesn't double in length. Read from `project.built`,
 * so the project page and any private page that shows the same project read
 * exactly the same text.
 */
export function BuiltList({ items, className = "" }: { items: BuiltItem[]; className?: string }) {
  return (
    <div className={className}>
      <p className="type-label text-ink">What I built</p>
      <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-[9rem_1fr] sm:gap-y-3">
        {items.map((item) => (
          <div key={item.item} className="sm:contents">
            <dt className="type-label mr-2 inline text-ink-muted sm:mr-0">{item.item}</dt>
            <dd className="inline font-body text-[15px] font-medium text-ink">{item.detail}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
