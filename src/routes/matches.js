import {Router} from 'express';
import {createMatchSchema, listMatchesQuerySchema} from "../validation/matches.js";
import {db} from "../db/db.js";
import {matches} from "../db/schema.js";
import {getMatchStatus} from "../utils/match-status.js";
import {desc} from "drizzle-orm";

export const matchesRouter = Router();

const MAX_LIMIT = 100;

matchesRouter.get('/', async (req, res) => {
    const parsed = listMatchesQuerySchema.safeParse(req.query);

    if (!parsed.success) {
        return res.status(400).json({error: 'invalid query params', details: parsed.error.issues})
    }

    const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT)

    try {
        const data = await db
            .select()
            .from(matches)
            .orderBy(desc(matches.createdAt))
            .limit(limit);

        res.status(200).json({data})
    } catch (e) {
        res.status(500).json({error: "Failed to fetch matches"})
    }
})

matchesRouter.post('/', async (req, res) => {
    const parsed = createMatchSchema.safeParse(req.body)

    if (!parsed.success) {
        return res.status(400).json({error: 'invalid payload', details: parsed.error.issues})
    }

    const {data: {startTime, endTime, homeScore, awayScore}} = parsed

    try {
        const status = getMatchStatus(startTime, endTime);
        if (!status) {
            return res.status(400).json({error: 'Unable to determine match status from provided times'});
        }
        const [event] = await db.insert(matches).values({
            ...parsed.data,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            homeScore: homeScore ?? 0,
            awayScore: awayScore ?? 0,
            status
        }).returning();

        res.status(201).json({data: event});
    } catch (e) {
        res.status(500).json({error: "Failed to create match"})
    }
})