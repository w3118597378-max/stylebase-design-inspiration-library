import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

import { createCatalog } from "../src/db.mjs";

const HASH_A = "a".repeat(64);
const HASH_B = "b".repeat(64);
const HASH_C = "c".repeat(64);

function makeRecord(overrides = {}) {
  return {
    sha256: HASH_A,
    relativePath: "inbox/one.png",
    fileName: "one.png",
    mimeType: "image/png",
    fileSize: 1024,
    mtimeMs: 1_700_000_000_000,
    ...overrides,
  };
}

async function withCatalog(run) {
  const root = await mkdtemp(path.join(os.tmpdir(), "stylebase-trash-"));
  const dbPath = path.join(root, "data", "library.db");
  const catalog = createCatalog(dbPath);
  try {
    await run(catalog, root);
  } finally {
    catalog.close();
    await rm(root, { recursive: true, force: true, maxRetries: 5 });
  }
}

function seed(catalog, records) {
  return records.map((record) => catalog.upsertAsset(record).asset);
}

test("fresh schema includes rating and deleted_at columns", async () => {
  await withCatalog((catalog) => {
    const asset = catalog.upsertAsset(makeRecord()).asset;
    assert.equal(asset.rating, 0);
    assert.equal(asset.deletedAt, null);
  });
});

test("migration upgrades a v1 database with missing columns", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "stylebase-trash-"));
  const dbPath = path.join(root, "data", "library.db");
  try {
    mkdirSync(path.dirname(dbPath), { recursive: true });
    const legacy = new DatabaseSync(dbPath);
    legacy.exec(`
      CREATE TABLE assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sha256 TEXT NOT NULL UNIQUE,
        relative_path TEXT NOT NULL,
        file_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        width INTEGER,
        height INTEGER,
        file_size INTEGER NOT NULL DEFAULT 0,
        mtime_ms REAL NOT NULL DEFAULT 0,
        source_url TEXT,
        source_domain TEXT,
        rights_note TEXT,
        title TEXT NOT NULL DEFAULT '',
        notes TEXT NOT NULL DEFAULT '',
        favorite INTEGER NOT NULL DEFAULT 0,
        file_status TEXT NOT NULL DEFAULT 'available',
        analysis_status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      PRAGMA user_version = 1;
    `);
    legacy.close();

    const catalog = createCatalog(dbPath);
    try {
      const asset = catalog.upsertAsset(makeRecord()).asset;
      assert.equal(asset.rating, 0);
      assert.equal(asset.deletedAt, null);
      // Migrating an already-migrated database is idempotent.
      catalog.close();
      const reopened = createCatalog(dbPath);
      try {
        assert.equal(reopened.upsertAsset(makeRecord()).asset.rating, 0);
      } finally {
        reopened.close();
      }
    } finally {
      if (!catalog.closed) catalog.close();
    }
  } finally {
    await rm(root, { recursive: true, force: true, maxRetries: 5 });
  }
});

test("updateAsset accepts rating 0-5 and rejects out-of-range values", async () => {
  await withCatalog((catalog) => {
    const asset = catalog.upsertAsset(makeRecord()).asset;
    assert.equal(catalog.updateAsset(asset.id, { rating: 3 }).rating, 3);
    assert.equal(catalog.updateAsset(asset.id, { rating: 0 }).rating, 0);
    assert.equal(catalog.updateAsset(asset.id, { rating: 5 }).rating, 5);
    assert.throws(() => catalog.updateAsset(asset.id, { rating: 6 }), TypeError);
    assert.throws(() => catalog.updateAsset(asset.id, { rating: -1 }), TypeError);
    assert.throws(() => catalog.updateAsset(asset.id, { rating: 1.5 }), TypeError);
  });
});

test("deleted assets disappear from default list and appear in trashed view", async () => {
  await withCatalog((catalog) => {
    const [one, two] = seed(catalog, [
      makeRecord({ sha256: HASH_A, relativePath: "inbox/one.png" }),
      makeRecord({ sha256: HASH_B, relativePath: "inbox/two.png" }),
    ]);
    catalog.deleteAsset(one.id);

    const active = catalog.listAssets({ sort: "newest" });
    assert.deepEqual(
      active.items.map((item) => item.id),
      [two.id],
    );
    const trashed = catalog.listAssets({ trashed: true, sort: "newest" });
    assert.deepEqual(
      trashed.items.map((item) => item.id),
      [one.id],
    );
    assert.ok(trashed.items[0].deletedAt);

    const direct = catalog.getAsset(one.id);
    assert.ok(direct.deletedAt);
  });
});

test("restore brings a deleted asset back to the active list", async () => {
  await withCatalog((catalog) => {
    const asset = catalog.upsertAsset(makeRecord()).asset;
    catalog.deleteAsset(asset.id);
    assert.equal(catalog.listAssets().total, 0);
    const restored = catalog.restoreAsset(asset.id);
    assert.equal(restored.deletedAt, null);
    assert.equal(catalog.listAssets().total, 1);
  });
});

test("double delete and restore of a live asset are rejected", async () => {
  await withCatalog((catalog) => {
    const asset = catalog.upsertAsset(makeRecord()).asset;
    catalog.deleteAsset(asset.id);
    assert.throws(() => catalog.deleteAsset(asset.id), /already deleted/);
    assert.equal(catalog.restoreAsset(asset.id).deletedAt, null);
    assert.throws(() => catalog.restoreAsset(asset.id), /not deleted/);
  });
});

test("purge removes the row and cascades analyses, jobs and collection items", async () => {
  await withCatalog((catalog) => {
    const asset = catalog.upsertAsset(makeRecord()).asset;
    catalog.saveAnalysis(asset.id, {
      analysis: {
        summary: "A teal dashboard",
        detail: "Card-based layout with soft shadows",
        tags: ["dashboard", "teal"],
        prompts: ["teal dashboard prompt"],
      },
    });
    catalog.enqueueAnalysis(asset.id);
    const collection = catalog.createCollection("web");
    catalog.addCollectionItem(collection.id, asset.id);

    catalog.deleteAsset(asset.id);
    catalog.purgeAsset(asset.id);

    assert.equal(catalog.getAsset(asset.id), null);
    assert.equal(catalog.listAssets({ query: "teal" }).total, 0);
    assert.equal(catalog.listJobs().total, 0);
    const after = catalog.getCollection(collection.id);
    assert.equal(after.itemCount, 0);
    assert.deepEqual(after.items, []);
  });
});

test("stats and facets exclude deleted assets", async () => {
  await withCatalog((catalog) => {
    const [one] = seed(catalog, [
      makeRecord({ sha256: HASH_A, relativePath: "inbox/one.png" }),
      makeRecord({
        sha256: HASH_B,
        relativePath: "inbox/two.png",
        sourceUrl: "https://example.com/ref",
      }),
    ]);
    catalog.saveAnalysis(one.id, {
      analysis: { summary: "Poster", tags: ["poster"] },
    });
    catalog.deleteAsset(one.id);

    const stats = catalog.getStats();
    assert.equal(stats.totalAssets, 1);
    assert.equal(stats.trashedAssets, 1);

    const facets = catalog.getFacets();
    const complete = facets.analysisStatuses.find(
      (item) => item.value === "complete",
    );
    assert.equal(complete?.count ?? 0, 0);
    const posterTag = facets.tags.find((item) => item.value === "poster");
    assert.equal(posterTag, undefined);
  });
});

test("collections hide deleted assets", async () => {
  await withCatalog((catalog) => {
    const [one, two] = seed(catalog, [
      makeRecord({ sha256: HASH_A, relativePath: "inbox/one.png" }),
      makeRecord({ sha256: HASH_B, relativePath: "inbox/two.png" }),
    ]);
    const collection = catalog.createCollection("web");
    catalog.addCollectionItem(collection.id, one.id);
    catalog.addCollectionItem(collection.id, two.id);
    assert.equal(catalog.getCollection(collection.id).itemCount, 2);
    assert.equal(catalog.listCollections()[0].itemCount, 2);

    catalog.deleteAsset(one.id);

    assert.equal(catalog.getCollection(collection.id).itemCount, 1);
    assert.equal(catalog.listCollections()[0].itemCount, 1);
  });
});

test("listAssets filters and sorts by rating", async () => {
  await withCatalog((catalog) => {
    const [one, two, three] = seed(catalog, [
      makeRecord({ sha256: HASH_A, relativePath: "inbox/one.png" }),
      makeRecord({ sha256: HASH_B, relativePath: "inbox/two.png" }),
      makeRecord({ sha256: HASH_C, relativePath: "inbox/three.png" }),
    ]);
    catalog.updateAsset(one.id, { rating: 5 });
    catalog.updateAsset(two.id, { rating: 3 });
    // three stays at 0

    const filtered = catalog.listAssets({ rating: 4 });
    assert.deepEqual(
      filtered.items.map((item) => item.id),
      [one.id],
    );
    const allByRating = catalog.listAssets({ sort: "rating" });
    assert.deepEqual(
      allByRating.items.map((item) => item.id),
      [one.id, two.id, three.id],
    );
  });
});

test("re-importing a deleted file does not revive it; restore does", async () => {
  await withCatalog((catalog) => {
    const first = catalog.upsertAsset(makeRecord()).asset;
    catalog.deleteAsset(first.id);

    const again = catalog.upsertAsset(
      makeRecord({ relativePath: "inbox/one.png" }),
    ).asset;
    assert.equal(again.id, first.id);
    assert.ok(again.deletedAt, "scan-style upsert must not revive");

    const restored = catalog.restoreAsset(again.id);
    assert.equal(restored.deletedAt, null);
    assert.equal(catalog.listAssets().total, 1);
  });
});

test("deleted assets cannot be enqueued or retried", async () => {
  await withCatalog((catalog) => {
    const asset = catalog.upsertAsset(makeRecord()).asset;
    catalog.deleteAsset(asset.id);
    assert.throws(() => catalog.enqueueAnalysis(asset.id), /deleted/);
  });
});

test("jobs for deleted assets are skipped by the worker and hidden from lists", async () => {
  await withCatalog((catalog) => {
    const [one, two] = seed(catalog, [
      makeRecord({ sha256: HASH_A, relativePath: "inbox/one.png" }),
      makeRecord({ sha256: HASH_B, relativePath: "inbox/two.png" }),
    ]);
    catalog.enqueueAnalysis(one.id);
    catalog.enqueueAnalysis(two.id);
    catalog.deleteAsset(two.id);

    assert.equal(catalog.listJobs().total, 1);
    const claimed = catalog.claimNextJob();
    assert.equal(claimed.assetId, one.id);
  });
});
