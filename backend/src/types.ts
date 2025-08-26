
export type AlertInput = {
  source: 'datadog' | 'cloudwatch' | 'mock';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ts?: string;
};

export type Suggestion = {
  actionType: 'restart_pods' | 'rollback' | 'scale_service' | 'noop';
  description: string;
  confidence: number;
};
