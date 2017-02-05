export const log = (msg, isError = false) => {
  if (process.env.NODE_ENV === 'test') return;

  if (isError) console.error('[ERROR]', msg);
  else console.log('[INFO]', msg);
};

export const error = (msg) => {
  log(msg, true);
};

export const logAndCreateError = (err, msg) => {
  error(err);
  return new Error(msg);
};

export const toIsoDateStr = (dateStr) => {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? '' :
    new Date(date - (date.getTimezoneOffset() * 60000)).toISOString();
};
