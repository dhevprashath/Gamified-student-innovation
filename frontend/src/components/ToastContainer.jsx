import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Trophy, X, Zap } from 'lucide-react';

const ToastContainer = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const { id, title, description, type, xpBonus } = toast;

        let icon = <CheckCircle2 className="w-5 h-5 text-[#E58A4E] shrink-0" />;
        let borderColor = 'border-[#E58A4E]/30';
        let bgStyle = 'bg-white';

        if (type === 'achievement') {
          icon = <Trophy className="w-5 h-5 text-[#E58A4E] shrink-0" />;
          borderColor = 'border-[#E58A4E]/40';
          bgStyle = 'bg-[#F8E8DB]/60';
        } else if (type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />;
          borderColor = 'border-red-200';
          bgStyle = 'bg-red-50/80';
        } else if (type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
          borderColor = 'border-amber-200';
          bgStyle = 'bg-amber-50/80';
        } else if (type === 'info') {
          icon = <Info className="w-5 h-5 text-[#E58A4E] shrink-0" />;
          borderColor = 'border-[#E58A4E]/30';
        }

        return (
          <div
            key={id}
            className={`pointer-events-auto flex items-start justify-between p-3.5 rounded-2xl border ${borderColor} ${bgStyle} shadow-lg shadow-black/5 animate-toast-slide relative overflow-hidden`}
          >
            <div className="flex items-start space-x-3 pr-2">
              <div className="mt-0.5">{icon}</div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold text-[#171717]">{title}</h4>
                  {xpBonus && (
                    <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-full bg-[#F8E8DB] text-[#E58A4E] text-[10px] font-extrabold">
                      <Zap className="w-2.5 h-2.5" />
                      <span>+{xpBonus} XP</span>
                    </span>
                  )}
                </div>
                {description && (
                  <p className="text-[11px] text-[#6B6B65] mt-0.5 leading-snug">{description}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => onDismiss(id)}
              className="text-[#6B6B65] hover:text-[#171717] p-1 rounded-lg transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
