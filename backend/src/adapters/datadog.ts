export async function fetchDatadogAlerts(): Promise<{ message: string; severity: string }[]> {
  // TODO: replace with real Datadog API calls
  return [
    { message: 'Service api-gateway 5xx > 3% in last 5m', severity: 'high' },
    { message: 'kube-pod OOMKilled in namespace prod-payments', severity: 'high' }
  ];
}