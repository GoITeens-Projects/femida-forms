import { InfoTooltip } from "./info-tooltip";
import { TableHead } from "./table";

export function TableHeadWithTooltip({
  children,
  tooltip,
}: {
  children: React.ReactNode;
  tooltip: string;
}) {
  return (
    <TableHead className="whitespace-nowrap">
      <div className="flex items-center gap-1">
        {children}
        <InfoTooltip textContent={tooltip} />
      </div>
    </TableHead>
  );
}
