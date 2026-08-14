const QUEUE_ROLE_PATH = "/assets/illustrations/queue-roles-v1";

const roleAssets = Object.freeze({
  analyzing: `${QUEUE_ROLE_PATH}/queue-role-analyzing.png`,
  waiting: `${QUEUE_ROLE_PATH}/queue-role-waiting.png`,
  complete: `${QUEUE_ROLE_PATH}/queue-role-complete.png`,
  error: `${QUEUE_ROLE_PATH}/queue-role-error.png`,
});

const WAITING_STATUSES = new Set(["queued", "pending"]);
const COMPLETE_STATUSES = new Set(["complete", "completed", "ready"]);
const ERROR_STATUSES = new Set(["failed", "needs_setup"]);

export function queueRoleForStatus(status) {
  const normalizedStatus = String(status ?? "").trim().toLowerCase();

  if (ERROR_STATUSES.has(normalizedStatus)) return roleAssets.error;
  if (COMPLETE_STATUSES.has(normalizedStatus)) return roleAssets.complete;
  if (WAITING_STATUSES.has(normalizedStatus)) return roleAssets.waiting;
  return roleAssets.analyzing;
}
