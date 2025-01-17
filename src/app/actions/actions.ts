"use server";

import { db } from "@/server/db";
import { auth } from "@/server/auth";

export async function gameFailure(){
    // check if logged in with next auth
    const session = await auth()
    // if not logged in, show login button
    if (!session || !session.user) return;
    // change attempt today success to false
    await db.result.updateMany({
        where: {
            userId: session.user.id,
            attemptDate: {
                gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
        },
        data: {
            success: false,
            attempts: {
                increment: 1
            }
        }
    })
}

export async function gameGetAttempts(){
    // check if logged in with next auth
    const session = await auth()
    // if not logged in, show login button
    if (!session || !session.user) return;
    // change attempt today success to false
    const result = await db.result.findFirst({
        where: {
            userId: session.user.id,
            attemptDate: {
                gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
        }
    })
    return result?.attempts;
}

export async function gameSuccess(){
    // check if logged in with next auth
    const session = await auth()
    // if not logged in, show login button
    if (!session || !session.user) return;
    // change attempt today success to false
    await db.result.updateMany({
        where: {
            userId: session.user.id,
            attemptDate: {
                gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
        },
        data: {
            success: true
        }
    })
    // get account of user
    const account = await db.account.findFirst({
        where: {
            userId: session.user.id
        }
    })

    const accessToken = account?.access_token;
    const providerId = account?.providerAccountId;

    if (!accessToken || !providerId) return;

    const response = await fetch("https://discord.com/api/v9/guilds/1326286227481165864/members/" + providerId, {
        method: "PUT",
        headers: {
            "Authorization": `Bot ${process.env.DISCORD_BOT_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            access_token: accessToken,
        })
    });

    if (!response.ok) {
        console.error(await response.text());
    }
}