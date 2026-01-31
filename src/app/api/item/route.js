import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function OPTIONS() {
    return new Response(null, { status: 200, headers: corsHeaders });
}

/**
 * GET /api/item?page=1&limit=5
 */
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const page = Math.max(1, Number(searchParams.get("page") || 1));
        const limit = Math.max(1, Math.min(50, Number(searchParams.get("limit") || 5)));
        const skip = (page - 1) * limit;

        const client = await getClientPromise();
        const db = client.db("wad-01");
        const col = db.collection("item");

        const total = await col.countDocuments({});
        const items = await col
            .find({})
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        return NextResponse.json(
            {
                items,
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            { headers: corsHeaders }
        );
    } catch (e) {
        return NextResponse.json(
            { message: e.toString() },
            { status: 400, headers: corsHeaders }
        );
    }
}

/**
 * POST /api/item
 * body: { itemName, itemCategory, itemPrice, status }
 */
export async function POST(req) {
    try {
        const data = await req.json();

        const itemName = (data.itemName ?? "").trim();
        const itemCategory = (data.itemCategory ?? "").trim();
        const itemPrice = data.itemPrice;
        const status = (data.status ?? "ACTIVE").trim();

        if (!itemName) {
            return NextResponse.json(
                { message: "itemName is required" },
                { status: 400, headers: corsHeaders }
            );
        }
        if (!itemCategory) {
            return NextResponse.json(
                { message: "itemCategory is required" },
                { status: 400, headers: corsHeaders }
            );
        }
        if (itemPrice === "" || itemPrice == null || Number.isNaN(Number(itemPrice))) {
            return NextResponse.json(
                { message: "itemPrice must be a number" },
                { status: 400, headers: corsHeaders }
            );
        }

        const client = await getClientPromise();
        const db = client.db("wad-01");

        const result = await db.collection("item").insertOne({
            itemName,
            itemCategory,
            itemPrice: Number(itemPrice),
            status,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return NextResponse.json(
            { id: result.insertedId },
            { status: 200, headers: corsHeaders }
        );
    } catch (e) {
        return NextResponse.json(
            { message: e.toString() },
            { status: 400, headers: corsHeaders }
        );
    }
}