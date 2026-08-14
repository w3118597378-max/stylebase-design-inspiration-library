import assert from "node:assert/strict";
import test from "node:test";

import { queueRoleForStatus } from "../public/queue-role.js";

test("queue role maps waiting statuses to the confirmed waiting asset", () => {
  assert.equal(
    queueRoleForStatus("queued"),
    "/assets/illustrations/queue-roles-v1/queue-role-waiting.png",
  );
  assert.equal(
    queueRoleForStatus("pending"),
    "/assets/illustrations/queue-roles-v1/queue-role-waiting.png",
  );
});

test("queue role maps active and other in-progress statuses to the confirmed analyzing asset", () => {
  for (const status of ["running", "processing", "analyzing", "needs_review", "stale_analysis"]) {
    assert.equal(
      queueRoleForStatus(status),
      "/assets/illustrations/queue-roles-v1/queue-role-analyzing.png",
    );
  }
});

test("queue role maps completed statuses to the confirmed complete asset", () => {
  for (const status of ["complete", "completed", "ready"]) {
    assert.equal(
      queueRoleForStatus(status),
      "/assets/illustrations/queue-roles-v1/queue-role-complete.png",
    );
  }
});

test("queue role maps failure statuses to the confirmed error asset", () => {
  for (const status of ["failed", "needs_setup"]) {
    assert.equal(
      queueRoleForStatus(status),
      "/assets/illustrations/queue-roles-v1/queue-role-error.png",
    );
  }
});

test("queue role normalizes input and defaults unknown states to the analyzing asset", () => {
  assert.equal(
    queueRoleForStatus("  COMPLETED  "),
    "/assets/illustrations/queue-roles-v1/queue-role-complete.png",
  );
  assert.equal(
    queueRoleForStatus(),
    "/assets/illustrations/queue-roles-v1/queue-role-analyzing.png",
  );
});
