

import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

const uri = "mongodb+srv://priyanshusaini:4R0YNvMQexLyxMaV@cluster0.9g9e8yq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

const client = new MongoClient(uri);

export async function GET() {
    try {
        await client.connect();
        const database = client.db('cbrn');
        const collection = database.collection('hi');
        const query = { _id: ObjectId.createFromHexString("664757f5fa35bada45c03725") };
        const user = await collection.findOne(query);
        console.log(user);

        return NextResponse.json(user);
    } finally {
        await client.close();
    }
}

