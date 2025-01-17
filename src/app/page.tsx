import { signIn, auth } from "@/server/auth";
import GamePage, { Shape } from "./game";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import Countdown from "./countdown";

export default async function HomePage(props: {
  searchParams: { callbackUrl: string | undefined }
}) {
  // check if logged in with next auth
  const session = await auth()
  // if not logged in, show login button
  if (!session) {
    return (
      <form action={async () => {
        "use server"
        try {
          await signIn("discord", {
            redirectTo: props.searchParams?.callbackUrl ?? "",
          })
        } catch (error) {
          // Signin can fail for a number of reasons, such as the user
              // not existing, or the user not having the correct role.
              // In some cases, you may want to redirect to a custom error
              if (error instanceof AuthError) {
                return redirect(`/error?message=${error.message}`)
              }
 
              // Otherwise if a redirects happens Next.js can handle it
              // so you can just re-thrown the error and let Next.js handle it.
              // Docs:
              // https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
              throw error
        }
      }}
    >
      <span>You need to login to view this page </span>
      <button type="submit" className="text-blue-500 hover:underline hover:text-blue-700 hover:cursor-pointer">Login Here</button>
      </form>
    )
  }
  // check prisma to see if user made an attempt today
  // if not, show game
  const result = await db.result.findFirst({
    where: {
      userId: session?.user.id,
      attemptDate: {
        gte: new Date(new Date().setHours(0, 0, 0, 0))
      },
    }
  })
  if (result?.success == false) {
    // return a simple countdown page
    const nextTime = new Date(new Date(result.attemptDate).getTime() + 86400000);
    return <Countdown date={ nextTime } />
  } else if (result?.success == true) {
    return <h1>You already and have joined. Stay tuned... there will be a lot more to come !!</h1>
  }
  // if they haven't create a new result with a random shape
   if (!session?.user.id) {
    console.log(session);
    throw new Error("User ID is undefined");
  }

  let shape = result?.shape as Shape;

  if (!result) {
    shape = ["kite", "star", "triangle"][Math.floor(Math.random() * 3)] as Shape;

    await db.result.create({
      data: {
        userId: session.user.id,
        shape: shape,
        attemptDate: new Date(),
      }
    })
  }

  return (
    <GamePage shape={shape}/>
  );
}
