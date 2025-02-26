export const config = {
    baseApiUrl: (window as any)._env_?.API_URL || 'http://localhost:8686/api/v1',
    orderCutoffTime: (window as any)._env_?.ORDER_CUTOFF_TIME || '23:30',
    toastDuration: 3000,
    currency: 'VND',
    orderPending: 'P',
    orderCompleted: 'S',
    orderCancelled: 'C',
  };