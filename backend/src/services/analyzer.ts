import { Suggestion } from '../types.js';

type AnalyzerInput = { alerts: { source: string; message: string; severity: string }[] };

export function analyzeIncidents({ alerts }: AnalyzerInput): { title: string; severity: string; suggestions: Suggestion[] } {
  const hasOOM = alerts.some(a => /OOMKilled|OutOfMemory|Killed process/.test(a.message));
  const hasHPA = alerts.some(a => /HPA|scale|replica(s)?/.test(a.message));
  const has5xx = alerts.some(a => /5\d{2}|Internal Server Error|HTTP 5/.test(a.message));

  const suggestions: Suggestion[] = [];
  if (hasOOM) suggestions.push({ actionType: 'restart_pods', description: 'Restart affected pods and check memory limits/requests.', confidence: 0.7 });
  if (hasHPA) suggestions.push({ actionType: 'scale_service', description: 'Scale replicas based on CPU/QPS. Verify HPA signals.', confidence: 0.6 });
  if (has5xx) suggestions.push({ actionType: 'rollback', description: 'Roll back to previous stable release. Check error budget.', confidence: 0.65 });
  if (!suggestions.length) suggestions.push({ actionType: 'noop', description: 'Monitor; insufficient signal for safe action.', confidence: 0.3 });

  const sev = has5xx || hasOOM ? 'high' : hasHPA ? 'medium' : 'low';
  const title = has5xx ? 'Error-rate spike detected' : hasOOM ? 'Pods OOM-killed' : hasHPA ? 'Autoscaler activity' : 'General alert noise';
  return { title, severity: sev, suggestions };
}