import assert from "node:assert/strict";
import test from "node:test";

import {
  queueKindForStatus,
  queueProgress,
  queueRoleForStatus,
} from "../public/queue-role.js";

const WAITING = "/assets/illustrations/queue-roles-v1/queue-role-waiting.png";
const ANALYZING = "/assets/illustrations/queue-roles-v1/queue-role-analyzing.png";
const COMPLETE = "/assets/illustrations/queue-roles-v1/queue-role-complete.png";
const ERROR = "/assets/illustrations/queue-roles-v1/queue-role-error.png";

test("queue role maps waiting statuses to the confirmed waiting asset", () => {
  assert.equal(queueRoleForStatus("queued"), WAITING);
  assert.equal(queueRoleForStatus("pending"), WAITING);
});

test("queue role maps active and other in-progress statuses to the confirmed analyzing asset", () => {
  for (const status of ["running", "processing", "analyzing", "needs_review", "stale_analysis"]) {
    assert.equal(queueRoleForStatus(status), ANALYZING);
  }
});

test("queue role maps completed statuses to the confirmed complete asset", () => {
  for (const status of ["complete", "completed", "ready"]) {
    assert.equal(queueRoleForStatus(status), COMPLETE);
  }
});

test("queue role maps failure statuses to the confirmed error asset", () => {
  for (const status of ["failed", "needs_setup"]) {
    assert.equal(queueRoleForStatus(status), ERROR);
  }
});

test("queue role normalizes input and defaults unknown states to the analyzing asset", () => {
  assert.equal(queueRoleForStatus("  COMPLETED  "), COMPLETE);
  assert.equal(queueRoleForStatus(), ANALYZING);
});

test("queue kind stays in sync with the asset mapping", () => {
  assert.equal(queueKindForStatus("queued"), "waiting");
  assert.equal(queueKindForStatus("pending"), "waiting");
  assert.equal(queueKindForStatus("running"), "analyzing");
  assert.equal(queueKindForStatus("processing"), "analyzing");
  assert.equal(queueKindForStatus("analyzing"), "analyzing");
  assert.equal(queueKindForStatus("needs_review"), "analyzing");
  assert.equal(queueKindForStatus("complete"), "complete");
  assert.equal(queueKindForStatus("completed"), "complete");
  assert.equal(queueKindForStatus("ready"), "complete");
  assert.equal(queueKindForStatus("failed"), "error");
  assert.equal(queueKindForStatus("needs_setup"), "error");
  assert.equal(queueKindForStatus("  PENDING  "), "waiting");
  assert.equal(queueKindForStatus(), "analyzing");
  assert.equal(queueKindForStatus("missing"), "analyzing");
});

test("complete without progress shows 100 and never indeterminate", () => {
  for (const status of ["complete", "completed", "ready"]) {
    assert.deepEqual(queueProgress(status, null), { value: 100, indeterminate: false });
  }
});

test("complete keeps 100 even when the payload carries a stale partial number", () => {
  assert.deepEqual(queueProgress("complete", 42), { value: 100, indeterminate: false });
});

test("waiting without progress shows 0 and is never indeterminate", () => {
  for (const status of ["queued", "pending"]) {
    assert.deepEqual(queueProgress(status, null), { value: 0, indeterminate: false });
  }
});

test("analyzing without progress is indeterminate", () => {
  assert.deepEqual(queueProgress("analyzing", null), { value: null, indeterminate: true });
  assert.deepEqual(queueProgress("running", undefined), { value: null, indeterminate: true });
  assert.deepEqual(queueProgress("processing", ""), { value: null, indeterminate: true });
});

test("error without progress shows 0 and is never indeterminate", () => {
  for (const status of ["failed", "needs_setup"]) {
    assert.deepEqual(queueProgress(status, null), { value: 0, indeterminate: false });
  }
});

test("fractional progress is scaled to percent", () => {
  assert.deepEqual(queueProgress("analyzing", 0), { value: 0, indeterminate: false });
  assert.deepEqual(queueProgress("analyzing", 0.5), { value: 50, indeterminate: false });
  assert.deepEqual(queueProgress("analyzing", 1), { value: 100, indeterminate: false });
});

test("percent progress passes through", () => {
  assert.deepEqual(queueProgress("analyzing", 50), { value: 50, indeterminate: false });
  assert.deepEqual(queueProgress("analyzing", 100), { value: 100, indeterminate: false });
});

test("out-of-range progress is clamped to 0–100", () => {
  assert.deepEqual(queueProgress("analyzing", -12), { value: 0, indeterminate: false });
  assert.deepEqual(queueProgress("analyzing", 173), { value: 100, indeterminate: false });
  assert.deepEqual(queueProgress("analyzing", -0.5), { value: 0, indeterminate: false });
  assert.deepEqual(queueProgress("analyzing", 1.9), { value: 2, indeterminate: false });
});

test("waiting with a real value shows it (yellow keeps the static bar)", () => {
  assert.deepEqual(queueProgress("queued", 0.62), { value: 62, indeterminate: false });
});

test("error keeps the last known progress", () => {
  assert.deepEqual(queueProgress("failed", 0.33), { value: 33, indeterminate: false });
});
