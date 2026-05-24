import { NextResponse } from "next/server";

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const DISCORD_REDIRECT_URI =
  process.env.DISCORD_REDIRECT_URI ||
  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`;

export async function GET() {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: "code",
    scope: "identify guilds.members.read",
  });

  return NextResponse.redirect(
    `https://discord.com/api/oauth2/authorize?${params}`,
  );
}
