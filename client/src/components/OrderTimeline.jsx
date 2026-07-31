import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';

const OrderTimeline = ({ timeline = [], stages = [] }) => {
  const doneMap = {};
  timeline.forEach((t) => {
    doneMap[t.stage] = t;
  });

  const list =
    stages.length > 0
      ? stages.map((stage) => {
          const ev = doneMap[stage];
          return {
            stage,
            title: stage,
            description: ev?.description || '',
            location: ev?.location || '',
            at: ev?.at,
            completed: Boolean(ev),
          };
        })
      : timeline.map((t) => ({ ...t, completed: true }));

  // Also show Cancelled / Refunded if present
  timeline.forEach((t) => {
    if (!stages.includes(t.stage) && !list.find((x) => x.stage === t.stage)) {
      list.push({ ...t, completed: true });
    }
  });

  return (
    <ol className="relative space-y-0">
      {list.map((item, i) => (
        <motion.li
          key={`${item.stage}-${i}`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className="flex gap-4 pb-8 last:pb-0"
        >
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                item.completed
                  ? 'bg-gold text-ink border-gold'
                  : 'border-black/20 dark:border-white/20 text-slate-mute'
              }`}
            >
              {item.completed ? <Check size={14} strokeWidth={3} /> : <Circle size={10} />}
            </div>
            {i < list.length - 1 && (
              <div
                className={`w-px flex-1 min-h-[24px] ${
                  item.completed ? 'bg-gold/50' : 'bg-black/10 dark:bg-white/10'
                }`}
              />
            )}
          </div>
          <div className="pt-1 min-w-0">
            <p className={`font-medium ${item.completed ? 'text-gold' : 'text-slate-mute'}`}>
              {item.title || item.stage}
            </p>
            {item.description && (
              <p className="text-sm text-slate-mute mt-0.5">{item.description}</p>
            )}
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-slate-mute">
              {item.at && (
                <span>
                  {new Date(item.at).toLocaleString('en-PK', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              )}
              {item.location && <span>· {item.location}</span>}
            </div>
          </div>
        </motion.li>
      ))}
    </ol>
  );
};

export default OrderTimeline;
