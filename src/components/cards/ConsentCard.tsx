import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';
import { ChevronRight } from 'lucide-react';

interface ConsentCardProps {
  id: string;
  purposeId?: string;
  tenantAbbr: string;
  tenantName: string;
  appName: string;
  title: string;
  purpose: string;
  updatedAt: string;
  status: 'Active' | 'Revoked' | 'Expired' | 'Expiring Soon';
  iconBgColor: string;
  iconTextColor: string;
  onClick: (id: string, purposeId?: string) => void;
}

export function ConsentCard({
  id,
  purposeId,
  tenantAbbr,
  tenantName,
  appName,
  title,
  purpose,
  updatedAt,
  status,
  iconBgColor,
  iconTextColor,
  onClick
}: ConsentCardProps) {

  const getBadgeVariant = (s: string): 'active' | 'expired' | 'pending' | 'neutral' | 'info' => {
    switch (s) {
      case 'Active':       return 'active';
      case 'Revoked':      return 'expired';
      case 'Expired':      return 'neutral';
      case 'Expiring Soon':return 'pending';
      default:             return 'neutral';
    }
  };

  return (
    <div 
      onClick={() => onClick(id, purposeId)}
      className={cn(
        "flex gap-4 p-4 items-center bg-white rounded-[14px]",
        "border border-[#e2e8f0]",
        "shadow-[0_1px_3px_rgba(0,0,0,0.05)]",
        "transition-all duration-250",
        "hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.09)]",
        "hover:border-[#c7d2fe]",
        "group cursor-pointer"
      )}
    >
      {/* Icon */}
      <div 
        className={cn(
          "w-11 h-11 rounded-[12px] flex items-center justify-center font-bold text-sm shrink-0",
          "shadow-[0_2px_6px_rgba(0,0,0,0.08)]",
          "group-hover:scale-105 transition-transform duration-250",
          iconBgColor, iconTextColor
        )}
      >
        {tenantAbbr}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2 mb-0.5">
          <h3 className="font-semibold text-[#0f172a] text-sm truncate group-hover:text-[#4f46e5] transition-colors duration-200">
            {title}
          </h3>
          <Badge variant={getBadgeVariant(status)} dot>
            {status}
          </Badge>
        </div>
        
        <p className="text-xs text-[#64748b] truncate mb-1.5">
          {tenantName} · {appName}
        </p>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-[11px] text-[#94a3b8]">
          <span className="truncate">Purpose: {purpose}</span>
          <span className="shrink-0 font-medium">Updated {updatedAt}</span>
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight
        size={16}
        className="text-[#cbd5e1] group-hover:text-[#4f46e5] group-hover:translate-x-0.5 transition-all duration-200 shrink-0"
      />
    </div>
  );
}
