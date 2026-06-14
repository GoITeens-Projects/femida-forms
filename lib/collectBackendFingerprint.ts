import { UAParser } from "ua-parser-js";
import type { NextRequest } from "next/server";
import { ASNData, BackendFingerprint, Geo } from "./types";

const UNKNOWN = "unknown" as const;

function isPrivateIp(ip: string): boolean {
  return (
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("169.254.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
  );
}

function parseIp(req: NextRequest): string {
  //? Check if Cloudflare provide IP
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    UNKNOWN
  );
}
async function parseGeo(ip: string): Promise<Geo> {
  const fallback: Geo = {
    source: "ip-api.com",
    country: UNKNOWN,
    region: UNKNOWN,
    city: UNKNOWN,
    timezone: UNKNOWN,
  };

  if (!ip || ip === UNKNOWN || isPrivateIp(ip)) return fallback;

  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,countryCode,regionName,city,timezone`,
      { signal: AbortSignal.timeout(3000) },
    );

    if (!res.ok) return fallback;

    const data = await res.json();
    if (data.status !== "success") return fallback;

    return {
      source: "ip-api.com",
      country: data.countryCode ?? UNKNOWN,
      region: data.regionName ?? UNKNOWN,
      city: data.city ?? UNKNOWN,
      timezone: data.timezone ?? UNKNOWN,
    };
  } catch {
    return fallback;
  }
}

async function parseAsn(ip: string): Promise<ASNData> {
  const fallback: ASNData = {
    ip,
    asn: UNKNOWN,
    asn_org: UNKNOWN,
    isp: UNKNOWN,
  };

  if (!ip || ip === UNKNOWN || isPrivateIp(ip)) return fallback;

  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,as,org,isp`,
      { signal: AbortSignal.timeout(3000) },
    );

    if (!res.ok) return fallback;

    const data = await res.json();
    if (data.status !== "success") return fallback;

    const parts = (data.as as string).split(" ");

    return {
      ip,
      asn: parts[0] ?? UNKNOWN,
      asn_org: parts.slice(1).join(" ") || data.org || UNKNOWN,
      isp: data.isp ?? UNKNOWN,
    };
  } catch {
    return fallback;
  }
}

function parseUserAgent(
  req: NextRequest,
): Pick<BackendFingerprint, "browser" | "os"> {
  const ua = req.headers.get("user-agent") ?? "";
  const parser = new UAParser(ua);
  const result = parser.getResult();

  return {
    browser: {
      name: result.browser.name ?? UNKNOWN,
      version: result.browser.version ?? UNKNOWN,
    },
    os: {
      name: result.os.name ?? UNKNOWN,
      version: result.os.version ?? UNKNOWN,
    },
  };
}

export async function collectBackendFingerprint(
  req: NextRequest,
): Promise<BackendFingerprint> {
  const ip = parseIp(req);

  const [geo, asn] = await Promise.all([parseGeo(ip), parseAsn(ip)]);
  const { browser, os } = parseUserAgent(req);

  return {
    asn,
    geo,
    browser,
    os,
    acceptLanguage: req.headers.get("accept-language"),
  };
}
