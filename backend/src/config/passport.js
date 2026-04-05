import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db } from "../libs/db.js";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { Strategy as GitHubStrategy } from "passport-github2";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/v1/auth/google/callback",
        },
        async (googleAccessToken, googleRefreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;

                if (!email) {
                    return done(new Error("No email from Google"), null);
                }

                //Check if user exists
                let user = await db.user.findFirst({
                    where: {
                        email,
                        OR: [
                            { provider: "GOOGLE" },
                            { provider: "LOCAL" }
                        ]
                    },
                });

                if (user && user.isBanned) {
                    return done(null, false);
                }

                //Create if not exists
                if (!user) {
                    user = await db.user.create({
                        data: {
                            email,
                            name: profile.displayName,
                            provider: "GOOGLE",
                            providerId: profile.id,
                            password: null,
                            image: profile.photos?.[0]?.value || null,
                        },
                    });
                }

                //Generate tokens (same as login)
                const accessTokenJWT = jwt.sign(
                    { id: user.id, role: user.role },
                    process.env.JWT_SECRET,
                    { expiresIn: "15m" }
                );

                const jti = randomUUID();

                const refreshTokenJWT = jwt.sign(
                    { id: user.id, jti },
                    process.env.JWT_REFRESH_SECRET,
                    { expiresIn: "7d" }
                );

                const hashedToken = await bcrypt.hash(refreshTokenJWT, 12);

                await db.session.deleteMany({
                    where: {
                        userId: user.id,
                    },
                });

                await db.session.create({
                    data: {
                        userId: user.id,
                        refreshToken: hashedToken,
                        jti,
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    },
                });

                return done(null, {
                    accessToken: accessTokenJWT,
                    refreshToken: refreshTokenJWT,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        image: profile.photos?.[0]?.value || null,
                    },
                });
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

//Github login strategy
passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: "/api/v1/auth/github/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // GitHub may not always return email directly
                const email =
                    profile.emails?.[0]?.value ||
                    `${profile.username}@github.com`; // fallback

                //Find by provider + providerId
                let user = await db.user.findFirst({
                    where: {
                        provider: "GITHUB",
                        providerId: profile.id,
                    },
                });

                // fallback: link by email
                if (!user) {
                    user = await db.user.findFirst({
                        where: { email },
                    });
                }

                //Ban check
                if (user && user.isBanned) {
                    return done(null, false);
                }

                //Create user if not exists
                if (!user) {
                    user = await db.user.create({
                        data: {
                            email,
                            name: profile.displayName || profile.username,
                            provider: "GITHUB",
                            providerId: profile.id,
                            password: null,
                            image: profile.photos?.[0]?.value || null,
                        },
                    });
                }

                //Clean old sessions
                await db.session.deleteMany({
                    where: { userId: user.id },
                });

                //Generate tokens
                const accessTokenJWT = jwt.sign(
                    { id: user.id, role: user.role },
                    process.env.JWT_SECRET,
                    { expiresIn: "15m" }
                );

                const jti = randomUUID();

                const refreshTokenJWT = jwt.sign(
                    { id: user.id, jti },
                    process.env.JWT_REFRESH_SECRET,
                    { expiresIn: "7d" }
                );

                const hashedToken = await bcrypt.hash(refreshTokenJWT, 12);

                await db.session.create({
                    data: {
                        userId: user.id,
                        refreshToken: hashedToken,
                        jti,
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    },
                });

                return done(null, {
                    accessToken: accessTokenJWT,
                    refreshToken: refreshTokenJWT,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    },
                });
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

export default passport;