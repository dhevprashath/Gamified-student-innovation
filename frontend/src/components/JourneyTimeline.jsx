import React from 'react';
import { CheckCircle2, Zap, ArrowRight, Loader2 } from 'lucide-react';

const JourneyTimeline = ({ stages = [], onCompleteStage, completingStage }) => {
  const currentStageIndex = stages.findIndex(s => !s.is_completed);

  return (
    <div className="relative space-y-6">
      {/* Visual Timeline Line */}
      <div className="hidden md:block absolute left-[28px] top-6 bottom-6 w-0.5 bg-border -z-0" />

      <div className="grid gap-3.5">
        {stages.map((stage, idx) => {
          const isDone = stage.is_completed;
          const isCurrent = idx === currentStageIndex || (currentStageIndex === -1 && idx === stages.length - 1);
          const isPending = completingStage === stage.stage_name;

          return (
            <div
              key={stage.stage_name}
              className={`relative z-10 flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border transition-all card-hover-effect ${
                isDone
                  ? 'bg-surface border-border shadow-xs'
                  : isCurrent
                  ? 'bg-surface border-primary ring-2 ring-primary/20 shadow-sm'
                  : 'bg-bg border-border'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 transition-transform ${
                    isDone
                      ? 'bg-primary-soft text-primary-deep border border-primary/40'
                      : isCurrent
                      ? 'bg-primary-soft text-primary-deep border border-primary animate-subtle-pulse'
                      : 'bg-border text-muted'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5 text-primary" /> : idx + 1}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className={`font-bold text-sm ${isDone ? 'text-primary-deep' : 'text-text'}`}>
                      {stage.stage_name} Stage
                    </h4>
                    {isCurrent && !isDone && (
                      <span className="text-[10px] font-bold text-primary-deep bg-primary-soft px-2 py-0.5 rounded-full border border-primary/30 uppercase tracking-wider">
                        Current Milestone
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-reward-deep bg-reward-soft px-2 py-0.5 rounded-full flex items-center space-x-0.5">
                      <Zap className="w-2.5 h-2.5 text-reward" />
                      <span>+{stage.xp_reward} XP</span>
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    {isDone
                      ? `Completed on ${new Date(stage.completed_at).toLocaleDateString()}`
                      : `Advance project milestones to earn XP & unlock innovation badges.`}
                  </p>
                </div>
              </div>

              <div className="mt-3 md:mt-0 flex items-center space-x-3 self-end md:self-auto">
                {isDone ? (
                  <span className="text-xs font-bold text-primary-deep bg-primary-soft px-3 py-1.5 rounded-xl border border-primary/30 flex items-center space-x-1">
                    <span>Completed</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  </span>
                ) : (
                  <button
                    onClick={() => onCompleteStage(stage.stage_name, stage.xp_reward)}
                    disabled={isPending}
                    className="px-4 py-2 bg-primary hover:opacity-90 text-on-primary rounded-xl text-xs font-semibold btn-primary-effect shadow-xs flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <span>Mark Complete</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
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
