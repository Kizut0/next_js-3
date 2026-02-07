import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function OPTIONS() {
    return new Response(null, { status: 200, headers: corsHeaders });
}

// UPDATE: PATCH /api/user/:id
export async function PATCH(req, { params }) {
    const { id } = await params;

    try {
        const data = await req.json();

        // Build partial update (only fields that exist in request body)
        const update = {};
        if (data.fullName != null) update.fullName = String(data.fullName).trim();
        if (data.email != null) update.email = String(data.email).trim();
        if (data.role != null) update.role = String(data.role).trim();
        if (data.status != null) update.status = String(data.status).trim();
        update.updatedAt = new Date();

        const client = await getClientPromise();
        const db = client.db("wad-01");

        const result = await db.collection("user").updateOne(
            { _id: new ObjectId(id) },
            { $set: update }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { message: "User not found" },
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

// DELETE: DELETE /api/user/:id
export async function DELETE(req, { params }) {
    const { id } = await params;

    try {
        const client = await getClientPromise();
        const db = client.db("wad-01");

        const result = await db.collection("user").deleteOne({
            _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { message: "User not found" },
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