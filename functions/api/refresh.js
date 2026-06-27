import { onRequest as getStatus } from './status.js';

export async function onRequest(context) {
  return getStatus(context);
}
