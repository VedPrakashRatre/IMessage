import { getAuth } from "@clerk/express";
import { createClerkClient } from "@clerk/backend";
import User from "../models/User.js";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function protectAuth(req,res,next) {
    try {
        const { userId } = getAuth(req);
        if(!userId){
            res.status(401).json({message:"Unauthorized"});
            return;
        }

        // Look the user up by their Clerk id (was typo'd as "cherkId", so every
        // protected route returned 404 and the sidebar never loaded users).
        let user = await User.findOne({ clerkId: userId });

        // Auto-create the user on first login so the app works even when the
        // Clerk webhook is not configured / hasn't fired yet.
        if(!user){
            const clerkUser = await clerkClient.users.getUser(userId);
            const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? "";
            const fullName =
                [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
                email.split("@")[0];

            user = await User.create({
                clerkId: userId,
                email,
                fullName,
                profilePic: clerkUser.imageUrl ?? "",
            });
        } else if(!user.fullName){
            // Backfill profiles created before the fullName field existed,
            // so the sidebar can display a name.
            try {
                const clerkUser = await clerkClient.users.getUser(userId);
                const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? user.email;
                user.fullName =
                    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
                    String(email ?? "").split("@")[0];
                if(!user.profilePic) user.profilePic = clerkUser.imageUrl ?? "";
                await user.save();
            } catch (backfillError) {
                console.error("Error backfilling user profile:", backfillError.message);
            }
        }

        req.user = user; // we parse this so that everybody in our backend have access to it.
        next();
    } catch (error) {
        console.error("Error in protectAuth middleware :", error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}
