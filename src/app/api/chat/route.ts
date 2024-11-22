import { GoogleGenerativeAI } from "@google/generative-ai";
import { type NextRequest } from "next/server";
import { content } from "tailwindcss/defaultTheme";
import { map } from "zod";
import { env } from "~/env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

interface Location {
    name: string;
    lat: number;
    lng: number;
    description?: string;
    type?: string;
}

const PHILIPPINES_LOCATIONS: Location[] = [
    {
        name: "Boracay",
        lat: 11.9674,
        lng: 121.9246,
        description: "Famous for its white sand beaches",
        type: "beach"
    },
    {
        name: "Palawan Underground River",
        lat: 10.1927,
        lng: 118.9043,
        description: "UNESCO World Heritage site, underground river system",
        type: "nature"
    }
];

const SYSTEM_PROMPT = `You are a helpful Philippine travel assistant. Help users plan their trips to the Philippines by providing personalized recommendations based on their preferences.

When suggesting locations, always use the following format for each location:
LOCATION: [name]
COORDINATES: [lat], [lng]
DESCRIPTION: [brief description]
TYPE: [type of attraction]

Focus on:
- Understanding their travel style, budget, and interests
- Suggesting specific destinations and activities
- Providing practical travel tips
- Only recommend places in the Philippines
- Keep responses concise and friendly
- Format locations as specified above`;

async function searchLocations(query: string): Promise<Location[]> {
    const searchTerms = query.toLowerCase().split(' ');
    return PHILIPPINES_LOCATIONS.filter(location =>
        searchTerms.some(term =>
            location.name.toLowerCase().includes(term) ||
            (location.description?.toLowerCase() ?? '').includes(term) ||
            (location.type?.toLowerCase() ?? '').includes(term)
        )
    );
}

function extractLocations(text: string): Location[] {
    const locations: Location[] = [];
    const locationRegex = /LOCATION: (.*?)\nCOORDINATES: (-?\d+\.?\d*), (-?\d+\.?\d*)\nDESCRIPTION: (.*?)\nTYPE: (.*?)(?=\n\n|\n$|$)/gs;

    let match: RegExpExecArray | null;
    while ((match = locationRegex.exec(text)) !== null) {
        if (match.length >= 6) {
            const [, name, latStr, lngStr, description, type] = match;
            const lat = parseFloat(latStr);
            const lng = parseFloat(lngStr);

            if (!isNaN(lat) && !isNaN(lng) && name) {
                locations.push({
                    name: name.trim(),
                    lat,
                    lng,
                    description: description.trim(),
                    type: type.trim()
                });
            }
        }
    }

    return locations;
}

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        // Validate messages array
        if (!Array.isArray(messages) || messages.length === 0) {
            return Response.json(
                { error: "Invalid messages array" },
                { status: 400 }
            );
        }

        // Filter out the initial assistant message if present
        const userMessages = messages.filter(msg => msg.role === 'user');
        if (userMessages.length === 0) {
            return Response.json(
                { error: "No user messages found" },
                { status: 400 }
            );
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        // Start chat with only user messages
        const chat = model.startChat({
            history: userMessages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            })),
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
            },
        });

        // Get the latest user message
        const userMessage = messages[messages.length - 1].content;

        // Search for relevant locations
        const relevantLocations = await searchLocations(userMessage);

        // Add location context to the prompt
        let contextPrompt = `${SYSTEM_PROMPT}\n\nUser message: ${userMessage}`;
        if (relevantLocations.length > 0) {
            contextPrompt += "\n\nRelevant locations:\n" +
                relevantLocations.map(loc =>
                    `LOCATION: ${loc.name}\nCOORDINATES: ${loc.lat}, ${loc.lng}\nDESCRIPTION: ${loc.description}\nTYPE: ${loc.type}`
                ).join("\n\n");
        }

        // Send message to Gemini
        const result = await chat.sendMessage(contextPrompt);
        const response = await result.response;
        const text = response.text();

        // Extract locations from the response
        const extractedLocations = extractLocations(text);

        // Combine extracted locations with relevant locations
        const allLocations = [...new Map(
            [...extractedLocations, ...relevantLocations]
                .map(loc => [loc.name, loc])
        ).values()];

        return Response.json({
            message: { role: "assistant", content: text },
            locations: allLocations.map(loc => ({
                lat: loc.lat,
                lng: loc.lng,
                title: `${loc.name}${loc.description ? ` - ${loc.description}` : ''}`
            }))
        });
    } catch (error) {
        console.error("Chat error:", error);
        return Response.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}