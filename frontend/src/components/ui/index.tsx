import React from 'react';

// --- ClayCard ---
interface ClayCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  flat?: boolean;
}
export const ClayCard: React.FC<ClayCardProps> = ({ children, className = '', flat = false, ...props }) => {
  return (
    <div
      className={`clay-card ${flat ? 'clay-card-flat' : ''} bg-white p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// --- ClayButton ---
interface ClayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'success';
  className?: string;
  ariaLabel?: string;
}
export const ClayButton: React.FC<ClayButtonProps> = ({
  children,
  variant = 'secondary',
  className = '',
  ariaLabel,
  ...props
}) => {
  let styleClass = 'text-text';
  if (variant === 'primary') styleClass = 'clay-btn-primary';
  else if (variant === 'accent') styleClass = 'clay-btn-accent';
  else if (variant === 'danger') {
    styleClass = 'bg-danger text-white border-danger/20 shadow-[6px_6px_12px_rgba(239,68,68,0.25),-6px_-6px_12px_#ffffff]';
  } else if (variant === 'success') {
    styleClass = 'bg-success text-white border-success/20 shadow-[6px_6px_12px_rgba(34,197,94,0.25),-6px_-6px_12px_#ffffff]';
  }

  return (
    <button
      className={`clay-btn ${styleClass} focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-2 ${className}`}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
};

// --- ClayInput ---
interface ClayInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  id?: string;
}
export const ClayInput = React.forwardRef<HTMLInputElement, ClayInputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || React.useId();
    return (
      <div className="flex flex-col gap-1 w-full text-left">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-text/80 pl-1">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`clay-input focus:ring-2 focus:ring-primary focus:outline-none ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <span id={`${inputId}-error`} className="text-xs text-danger font-medium pl-1" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);
ClayInput.displayName = 'ClayInput';

// --- ClaySelect ---
interface ClaySelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  className?: string;
  id?: string;
}
export const ClaySelect = React.forwardRef<HTMLSelectElement, ClaySelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const selectId = id || React.useId();
    return (
      <div className="flex flex-col gap-1 w-full text-left">
        {label && (
          <label htmlFor={selectId} className="text-sm font-semibold text-text/80 pl-1">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`clay-input bg-[#f0f4f8] cursor-pointer appearance-none focus:ring-2 focus:ring-primary focus:outline-none ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <span id={`${selectId}-error`} className="text-xs text-danger font-medium pl-1" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);
ClaySelect.displayName = 'ClaySelect';

// --- ClayAlert ---
interface ClayAlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}
export const ClayAlert: React.FC<ClayAlertProps> = ({
  children,
  variant = 'info',
  className = '',
}) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800 shadow-[inset_2px_2px_4px_rgba(59,130,246,0.1)]',
    success: 'bg-green-50 border-green-200 text-green-800 shadow-[inset_2px_2px_4px_rgba(34,197,94,0.1)]',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 shadow-[inset_2px_2px_4px_rgba(245,158,11,0.1)]',
    error: 'bg-red-50 border-red-200 text-red-800 shadow-[inset_2px_2px_4px_rgba(239,68,68,0.1)]',
  };

  return (
    <div
      role="alert"
      className={`p-4 rounded-2xl border text-sm flex gap-2 items-center ${styles[variant]} ${className}`}
    >
      {children}
    </div>
  );
};

// --- ClayModal ---
interface ClayModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
export const ClayModal: React.FC<ClayModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    >
      <ClayCard className="w-full max-w-lg shadow-[24px_24px_48px_rgba(0,0,0,0.15)] flex flex-col gap-4 animate-pulse-soft max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 id="modal-title" className="text-xl font-bold font-heading">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-text/50 hover:text-text font-bold text-lg select-none px-2 py-1 focus:ring-2 focus:ring-primary focus:outline-none rounded-lg"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </ClayCard>
    </div>
  );
};

// --- SkeletonLoader ---
export const SkeletonLoader: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-3 animate-pulse ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-200 rounded-full"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
};
