import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface CardProps {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

export function Card({ className, children, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
        onClick ? "cursor-pointer" : "",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface AddCardProps {
  icon?: ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}

export function AddCard({ icon, title, subtitle, onClick }: AddCardProps) {
  return (
    <Card
      onClick={onClick}
      className="flex items-center gap-4 border border-dashed border-gray-300 bg-white/50 hover:border-gray-400"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </Card>
  );
}

interface FileCardProps {
  icon?: ReactNode;
  fileName: string;
  fileType: string;
  onDelete?: () => void;
  onClick?: () => void;
  badge?: ReactNode;
}

export function FileCard({
  icon,
  fileName,
  fileType,
  onDelete,
  onClick,
  badge,
}: FileCardProps) {
  return (
    <Card onClick={onClick} className="group relative">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
          {icon}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{fileName}</h3>
          <p className="text-sm text-gray-500">{fileType}</p>
        </div>
        {badge && <div className="ml-auto">{badge}</div>}
      </div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2 right-2 hidden rounded p-1 text-gray-400 group-hover:block hover:bg-gray-100 hover:text-gray-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </Card>
  );
}
