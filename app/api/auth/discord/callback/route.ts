import { NextRequest, NextResponse } from "next/server";
import { upsertUser } from "@/lib/db";
import { setSession } from "@/lib/auth";

const GUILD_ID = process.env.GUILD_ID;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;
const DISCORD_REDIRECT_URI =
  process.env.DISCORD_REDIRECT_URI ||
  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`;

interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
}

interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
}

interface GuildMember {
  user: DiscordUser;
  nick?: string;
  avatar?: string;
  roles: string[];
  joined_at: string;
}
function getDiscordRegistrationDate(userId: string): string {
  const DISCORD_EPOCH = 1420070400000;
  const timestamp = parseInt(userId) / 4194304 + DISCORD_EPOCH;
  return new Date(timestamp).toISOString();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("state") || "/";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url));
  }

  try {
    // Exchange code for token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", await tokenResponse.text());
      return NextResponse.redirect(
        new URL("/login?error=token_failed", request.url),
      );
    }

    const tokenData: DiscordTokenResponse = await tokenResponse.json();

    // Get user info
    // const memberResponse = await fetch('https://discord.com/api/users/@me', {
    //   headers: {
    //     Authorization: `Bearer ${tokenData.access_token}`,
    //   },
    // })
    const memberResponse = await fetch(
      `https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`,
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      },
    );

    if (!memberResponse.ok) {
      console.error("User fetch failed:", await memberResponse.text());
      return NextResponse.redirect("https://discord.gg/goiteens");
    }

    const discordUser: GuildMember = await memberResponse.json();

    // Check for admin role (first user or specific Discord IDs)
    const adminDiscordIds =
      process.env.ADMIN_DISCORD_ROLES_IDS?.split(",") || [];
    const isAdmin = adminDiscordIds.some((id) =>
      discordUser?.roles?.includes(id),
    );

    // Upsert user in database
    const user = await upsertUser({
      discord_id: discordUser.user.id,
      username: discordUser.nick ?? discordUser.user.username,
      avatar: discordUser.user.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.user.id}/${discordUser.user.avatar}.png`
        : null,
      role: isAdmin ? "ADMIN" : "USER",
      joined_server_at: discordUser.joined_at,
      registered_at_discord: getDiscordRegistrationDate(discordUser.user.id),
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/login?error=db_failed", request.url),
      );
    }

    // Set session
    await setSession(user);

    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch (error) {
    console.error("Discord OAuth error:", error);
    return NextResponse.redirect(new URL("/login?error=unknown", request.url));
  }
}
