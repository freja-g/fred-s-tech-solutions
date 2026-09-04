
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const SENSITIVE_KEYS = ['password', 'token', 'access_token', 'refresh_token', 'credit_card', 'email', 'phone'];

const scrubData = (data: any): any => {
  if (!data) return data;
  if (typeof data !== 'object') return data;

  const scrubbed = Array.isArray(data) ? [...data] : { ...data };

  for (const key in scrubbed) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      scrubbed[key] = '***SCRUBBED***';
    } else if (typeof scrubbed[key] === 'object') {
      scrubbed[key] = scrubData(scrubbed[key]);
    }
  }

  return scrubbed;
};

export const logger = {
  log: (level: LogLevel, message: string, data?: any) => {
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: scrubData(data),
    };

    if (import.meta.env.PROD) {
      // In production, we would ship this to ElasticSearch / Grafana Loki
      // For now, we'll just log structured JSON as per blueprint Standard #12
      console.log(JSON.stringify(payload));
    } else {
      console[level](`[${payload.timestamp}] ${message}`, payload.data || '');
    }
  },
  info: (message: string, data?: any) => logger.log('info', message, data),
  warn: (message: string, data?: any) => logger.log('warn', message, data),
  error: (message: string, data?: any) => logger.log('error', message, data),
  debug: (message: string, data?: any) => logger.log('debug', message, data),
};
