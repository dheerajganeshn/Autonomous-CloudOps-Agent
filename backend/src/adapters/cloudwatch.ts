export async function fetchCloudWatchAlerts(): Promise<{ message: string; severity: string }[]> {
  // TODO: replace with AWS SDK calls
  return [{ message: 'ALB TargetResponseTime p95 > 1.5s', severity: 'medium' }];
}