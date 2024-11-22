"use client";

import { useState } from "react";
import { type Message } from "~/types/chat";

const INITIAL_MESSAGE: Message = {
    role: "assistant",
    content: "Hi! I'm your Philippine travel assistant. I can help you plan your perfect trip to the Philippines. What kind of experience are you looking for?"
};
export type TTravelChat = { lat: number; lng: number; title: string; };
export default function TravelChat({ onUpdateMap }: {
    onUpdateMap: (markers: TTravelChat[]) => void;
}) {
    const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: "user", content: input };
        setMessages(prev => [...prev, userMessage] as Message[]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage]
                })
            });

            const data = await response.json();
            setMessages(prev => [...prev, data.message]);

            // Update map markers if locations are returned
            if (data.locations) {
                onUpdateMap(data.locations);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "I'm sorry, I encountered an error. Please try again."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, idx) => (
                    <div
                        key={idx}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === "user"
                                ? "bg-purple-600 text-white"
                                : "bg-gray-100 text-gray-800"
                                }`}
                        >
                            {message.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg px-4 py-2 text-gray-800">
                            Thinking...
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your Philippine travel plans..."
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-purple-500"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700
                                 transition-colors disabled:bg-purple-400"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}