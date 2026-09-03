import React from 'react';
import { CheckCircle2, Circle, Zap, ArrowRight } from 'lucide-react';

const JourneyTimeline = ({ stages = [], onCompleteStage, completingStage }) => {
  return (
    <div className="relative space-y-6">
      {/* Visual Timeline Line */}
      <div className="hidden md:block absolute left-[28px] top-6 bottom-6 w-0.5 bg-slate-700/60 -z-0" />

      <div className="grid gap-4">
        {stages.map((stage, idx) => {
          const isDone = stage.is_completed;
          const isPending = completingStage === stage.stage_name;

          return (
            <div 
              key={stage.stage_name}
              className={`relative z-10 flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border transition-all ${
                isDone 
                  ? 'bg-slate-900/90 border-emerald-800/60 shadow-md' 
                  : 'bg-slate-900/60 border-slate-700/80 hover:border-amber-500/40'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  isDone 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {isDone ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : (idx + 1)}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className={`font-bold text-sm ${isDone ? 'text-emerald-300' : 'text-white'}`}>
                      {stage.stage_name} Stage
                    </h4>
                    <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50 flex items-center space-x-0.5">
                      <Zap className="w-2.5 h-2.5" />
                      <span>+{stage.xp_reward} XP</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isDone ? `Completed on ${new Date(stage.completed_at).toLocaleDateString()}` : `Complete stage milestone to unlock XP & badges.`}
                  </p>
                </div>
              </div>

              <div className="mt-3 md:mt-0 flex items-center space-x-3 self-end md:self-auto">
                {isDone ? (
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-800">
                    Completed ✓
                  </span>
                ) : (
                  <button
                    onClick={() => onCompleteStage(stage.stage_name)}
                    disabled={isPending}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition-all flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <span>{isPending ? 'Updating...' : 'Mark Completed'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JourneyTimeline;
