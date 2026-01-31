import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function OPTIONS() {
    return new Response(null, { status: 200, headers: corsHeaders });
}

export async function GET(req, { params }) {
    const { id } = await params;

    try {
        const client = await getClientPromise();
        const db = client.db("wad-01");

        const item = await db.collection("item").findOne({ _id: new ObjectId(id) });

        if (!item) {
            return NextResponse.json(
                { message: "Item not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json(item, { headers: corsHeaders });
    } catch (e) {
        return NextResponse.json(
            { message: e.toString() },
            { status: 400, headers: corsHeaders }
        );
    }
}

export async function PATCH(req, { params }) {
    const { id } = await params;

    try {
        const data = await req.json();

        const update = {};
        if (data.itemName != null) update.itemName = String(data.itemName).trim();
        if (data.itemCategory != null) update.itemCategory = String(data.itemCategory).trim();
        if (data.itemPrice != null) update.itemPrice = Number(data.itemPrice);
        if (data.status != null) update.status = String(data.status).trim();
        update.updatedAt = new Date();

        const client = await getClientPromise();
        const db = client.db("wad-01");

        const result = await db.collection("item").updateOne(
            { _id: new ObjectId(id) },
            { $set: update }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { message: "Item not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json(result, { status: 200, headers: corsHeaders });
    } catch (e) {
        return NextResponse.json(
            { message: e.toString() },
            { status: 400, headers: corsHeaders }
        );
    }
}

export async function PUT(req, { params }) {
    const { id } = await params;

    try {
        const data = await req.json();

        const itemName = (data.itemName ?? "").trim();
        const itemCategory = (data.itemCategory ?? "").trim();
        const itemPrice = data.itemPrice;
        const status = (data.status ?? "ACTIVE").trim();

        if (!itemName || !itemCategory || itemPrice == null || Number.isNaN(Number(itemPrice))) {
            return NextResponse.json(
                { message: "PUT requires itemName, itemCategory, itemPrice" },
                { status: 400, headers: corsHeaders }
            );
        }

        const client = await getClientPromise();
        const db = client.db("wad-01");

        const result = await db.collection("item").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    itemName,
                    itemCategory,
                    itemPrice: Number(itemPrice),
                    status,
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { message: "Item not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json(result, { status: 200, headers: corsHeaders });
    } catch (e) {
        return NextResponse.json(
            { message: e.toString() },
            { status: 400, headers: corsHeaders }
        );
    }
}

export async function DELETE(req, { params }) {
    const { id } = await params;

    try {
        const client = await getClientPromise();
        const db = client.db("wad-01");

        const result = await db.collection("item").deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { message: "Item not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json(
            { message: "Deleted successfully" },
            { status: 200, headers: corsHeaders }
        );
    } catch (e) {
        return NextResponse.json(
            { message: e.toString() },
            { status: 500, headers: corsHeaders }
        );
    }
}