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

function normalizeStatus(status) {
  return String(status ?? "").trim().toLowerCase();
}

/**
 * Visual category for a job status. Single normalization source shared by
 * role selection and progress logic so the asset and the styling never drift.
 */
export function queueKindForStatus(status) {
  const normalized = normalizeStatus(status);
  if (ERROR_STATUSES.has(normalized)) return "error";
  if (COMPLETE_STATUSES.has(normalized)) return "complete";
  if (WAITING_STATUSES.has(normalized)) return "waiting";
  return "analyzing";
}

export function queueRoleForStatus(status) {
  return roleAssets[queueKindForStatus(status)];
}

/**
 * Resolve the displayed progress for a job.
 *
 * Rules:
 * - complete: always 100 (a finished job is finished, even if the payload
 *   carries a stale partial number).
 * - analyzing without a value: indeterminate (scan animation, no fake %).
 * - waiting / error without a value: 0, never indeterminate.
 * - any numeric value: scale 0–1 to 0–100 and clamp to 0–100.
 *
 * Returns { value: number | null, indeterminate: boolean }.
 */
export function queueProgress(status, rawProgress) {
  const kind = queueKindForStatus(status);
  const numeric =
    rawProgress === null || rawProgress === undefined || rawProgress === ""
      ? null
      : Number(rawProgress);
  const hasValue = numeric !== null && Number.isFinite(numeric);

  if (kind === "complete") {
    return { value: 100, indeterminate: false };
  }
  if (!hasValue) {
    return kind === "analyzing"
      ? { value: null, indeterminate: true }
      : { value: 0, indeterminate: false };
  }
  const scaled = numeric <= 1 ? numeric * 100 : numeric;
  return {
    value: Math.min(100, Math.max(0, Math.round(scaled))),
    indeterminate: false,
  };
}
