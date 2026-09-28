import { Badge } from "@/components/ui/badge";
import type { ParsedItem } from "@/types/Notice";

export default function ParsedItemsTable({ items }: { items: ParsedItem[] }) {
  if (items.length === 0) {
    return <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">No items parsed — check the item/link selectors against the page.</p>;
  }

  const undated = items.filter((i) => !i.published_date_ad).length;

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {items.length} item(s) parsed · {items.filter((i) => i.would_insert).length} would be inserted
        {undated > 0 && <span className="text-amber-700"> · {undated} without a date</span>}
      </p>
      <div className="max-h-80 overflow-auto rounded-lg border">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-gray-50 text-gray-600">
            <tr>
              <th className="p-2">New</th>
              <th className="p-2">Date (BS / AD)</th>
              <th className="p-2">Title</th>
              <th className="p-2">Files</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.url + item.title} className="border-t align-top">
                <td className="p-2">{item.would_insert ? <Badge className="bg-green-100 text-green-700 hover:bg-green-100">new</Badge> : "—"}</td>
                <td className="whitespace-nowrap p-2">
                  {item.published_date_bs ?? <span className="text-amber-700">{item.date_text ? `? ${item.date_text}` : "none"}</span>}
                  <div className="text-muted-foreground">{item.published_date_ad}</div>
                </td>
                <td className="p-2">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">{item.title}</a>
                </td>
                <td className="p-2">{item.attachments.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
