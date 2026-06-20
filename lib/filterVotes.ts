import {
  type VoteResult,
  type ClientFingerprint,
  type BackendFingerprint,
  SuspicionSignalEnum,
  VoteWithRelations,
  SuspicionSignal,
} from "./types";
import { differenceInDays } from "date-fns";

// ─── Tuneable thresholds ────────────────────────────────────────────────────

/**
 * Accounts created on Discord less than this many days ago are treated
 * as "new" and considered suspicious.
 */
const DISCORD_ACCOUNT_MIN_AGE_DAYS = 30;

/**
 * Accounts that joined the contest server less than this many days ago
 * are treated as "new" and considered suspicious.
 */
const SERVER_JOIN_MIN_AGE_DAYS = 7;

/**
 * A vote is rejected when its total suspicion score reaches this value.
 * Each signal contributes a weight defined in SIGNAL_WEIGHTS below.
 */
const SUSPICION_THRESHOLD = 2;

/**
 * Weight of each signal toward the suspicion score.
 * A weight of Infinity means the signal alone is enough to reject the vote.
 */

//* Types

const SIGNAL_WEIGHTS: Record<SuspicionSignalEnum, number> = {
  [SuspicionSignalEnum.DUPLICATE_VISITOR_ID]: Infinity, // same device, certain
  [SuspicionSignalEnum.NEW_DISCORD_ACCOUNT]: Infinity, // policy violation alone
  [SuspicionSignalEnum.NEW_SERVER_MEMBER]: Infinity, // policy violation alone
  [SuspicionSignalEnum.DUPLICATE_CANVAS_HASH]: 1,
  [SuspicionSignalEnum.DUPLICATE_AUDIO_HASH]: 1,
  [SuspicionSignalEnum.DUPLICATE_GPU]: 1,
  [SuspicionSignalEnum.DUPLICATE_GEO_ASN]: 1,
  [SuspicionSignalEnum.DUPLICATE_BROWSER_OS]: 1,
};

//* Helpers

const daysSince = (isoDate: string): number => {
  return differenceInDays(new Date(), new Date(isoDate));
};

const gpuKey = (fp: Partial<ClientFingerprint>): string | null =>
  fp.gpu ? `${fp.gpu.vendor}|${fp.gpu.renderer}` : null;

const geoAsnKey = (fp: BackendFingerprint): string =>
  [fp.geo.country, fp.geo.region, fp.geo.city, fp.asn.asn].join("|");

const browserOsKey = (fp: BackendFingerprint): string =>
  [fp.browser.name, fp.browser.version, fp.os.name, fp.os.version].join("|");

//* Per-field duplicate detectors

/**
 * Returns a set of vote IDs that share a fingerprint value with at least
 * one other vote in the same contest.
 */
const buildDuplicateSet = <T extends VoteWithRelations>(
  votes: T[],
  keyFn: (vote: T) => string | null | undefined,
): Set<string> => {
  const keyToVoteIds = new Map<string, string[]>();

  for (const vote of votes) {
    const key = keyFn(vote);
    if (!key) continue;

    const existing = keyToVoteIds.get(key) ?? [];
    existing.push(vote.id);
    keyToVoteIds.set(key, existing);
  }

  const duplicates = new Set<string>();
  for (const ids of keyToVoteIds.values()) {
    if (ids.length > 1) ids.forEach((id) => duplicates.add(id));
  }
  return duplicates;
};

//* Signal collectors

const collectClientFingerprintSignals = (
  vote: VoteWithRelations,
  duplicateSets: Record<string, Set<string>>,
): SuspicionSignal[] => {
  const signals: SuspicionSignal[] = [];

  if (duplicateSets.visitorId.has(vote.id))
    signals.push({
      type: SuspicionSignalEnum.DUPLICATE_VISITOR_ID,
      description: "Visitor ID matches another vote in this contest",
    });

  if (duplicateSets.canvasHash.has(vote.id))
    signals.push({
      type: SuspicionSignalEnum.DUPLICATE_CANVAS_HASH,
      description: "Canvas fingerprint hash matches another vote",
    });

  if (duplicateSets.audioHash.has(vote.id))
    signals.push({
      type: SuspicionSignalEnum.DUPLICATE_AUDIO_HASH,
      description: "Audio fingerprint hash matches another vote",
    });

  if (duplicateSets.gpu.has(vote.id))
    signals.push({
      type: SuspicionSignalEnum.DUPLICATE_GPU,
      description: "GPU vendor/renderer matches another vote",
    });

  return signals;
};

const collectBackendFingerprintSignals = (
  vote: VoteWithRelations,
  duplicateSets: Record<string, Set<string>>,
): SuspicionSignal[] => {
  const signals: SuspicionSignal[] = [];

  if (duplicateSets.geoAsn.has(vote.id))
    signals.push({
      type: SuspicionSignalEnum.DUPLICATE_GEO_ASN,
      description:
        "Geo location + ASN matches another vote (same network/location)",
    });

  if (duplicateSets.browserOs.has(vote.id))
    signals.push({
      type: SuspicionSignalEnum.DUPLICATE_BROWSER_OS,
      description: "Browser + OS combination matches another vote",
    });

  return signals;
};

const collectAccountAgeSignals = (
  vote: VoteWithRelations,
): SuspicionSignal[] => {
  const signals: SuspicionSignal[] = [];

  if (daysSince(vote.user.registered_at_discord) < DISCORD_ACCOUNT_MIN_AGE_DAYS)
    signals.push({
      type: SuspicionSignalEnum.NEW_DISCORD_ACCOUNT,
      description: `Discord account is less than ${DISCORD_ACCOUNT_MIN_AGE_DAYS} days old`,
    });

  if (daysSince(vote.user.joined_server_at) < SERVER_JOIN_MIN_AGE_DAYS)
    signals.push({
      type: SuspicionSignalEnum.NEW_SERVER_MEMBER,
      description: `User joined the server less than ${SERVER_JOIN_MIN_AGE_DAYS} days ago`,
    });

  return signals;
};

//* Main function

/**
 * Filters an array of votes to detect and flag likely alt ("twink") accounts.
 *
 * A vote is rejected when it accumulates {@link SUSPICION_THRESHOLD} or more
 * signals. Each signal represents an independent piece of evidence that the
 * voter may be the same physical person as another voter in the same contest.
 *
 * Signals checked (client-side fingerprint):
 *   - Identical visitorId
 *   - Identical canvas hash
 *   - Identical audio hash
 *   - Identical GPU vendor + renderer
 *
 * Signals checked (backend fingerprint):
 *   - Identical geo (country/region/city) + ASN — same network origin
 *   - Identical browser name/version + OS name/version
 *
 * Signals checked (account metadata):
 *   - Discord account registered recently (< {@link DISCORD_ACCOUNT_MIN_AGE_DAYS} days)
 *   - Joined the contest server recently (< {@link SERVER_JOIN_MIN_AGE_DAYS} days)
 */
export const filterVotes = (allVotes: VoteWithRelations[]): VoteResult[] => {
  // Pre-compute duplicate sets once for the entire vote list.
  const duplicateSets = {
    visitorId: buildDuplicateSet(
      allVotes,
      (v) => v.client_fingerprint?.visitorId,
    ),
    canvasHash: buildDuplicateSet(
      allVotes,
      (v) => v.client_fingerprint?.canvas_hash,
    ),
    audioHash: buildDuplicateSet(
      allVotes,
      (v) => v.client_fingerprint?.audio_hash,
    ),
    gpu: buildDuplicateSet(allVotes, (v) =>
      v.client_fingerprint ? gpuKey(v.client_fingerprint) : null,
    ),
    geoAsn: buildDuplicateSet(allVotes, (v) =>
      geoAsnKey(v.backend_fingerprint),
    ),
    browserOs: buildDuplicateSet(allVotes, (v) =>
      browserOsKey(v.backend_fingerprint),
    ),
  };

  return allVotes.map((vote): VoteResult => {
    const signals: SuspicionSignal[] = [
      ...collectClientFingerprintSignals(vote, duplicateSets),
      ...collectBackendFingerprintSignals(vote, duplicateSets),
      ...collectAccountAgeSignals(vote),
    ];

    const suspicionScore = signals.reduce(
      (score, signal) => score + SIGNAL_WEIGHTS[signal.type],
      0,
    );

    const isSuspicious = suspicionScore >= SUSPICION_THRESHOLD;

    return {
      vote,
      signals,
      status: isSuspicious
        ? {
            ok: false,
            reason: signals.map((s) => s.description).join("; "),
          }
        : { ok: true },
    };
  });
};
