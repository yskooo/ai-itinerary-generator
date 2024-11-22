"use client";

import { useState } from "react";
import { type Message } from "~/types/chat";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MapPin, Hotel, Sun, CloudRain } from 'lucide-react';

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: "Hi! I'm your travel assistant for Lakbay. I can help you plan your perfect trip to the Philippines. What kind of experience are you looking for?"
};

export type TTravelChat = { lat: number; lng: number; title: string; };

export default function TravelChat({ onUpdateMap }: { onUpdateMap: (markers: TTravelChat[]) => void; }) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);

  const handleStartChat = () => {
    setIsChatActive(true);
  };

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
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Lakbay</h1>
          <nav>
            <ul className="flex space-x-4">
              <li><a href="#" className="text-gray-600 hover:text-indigo-600">Home</a></li>
              <li><a href="#" className="text-gray-600 hover:text-indigo-600">About</a></li>
              <li><a href="#" className="text-gray-600 hover:text-indigo-600">Destinations</a></li>
              <li><a href="#" className="text-gray-600 hover:text-indigo-600">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {!isChatActive ? (
          <div className="space-y-12">
            {/* Hero Section */}
            <section className="text-center">
              <h2 className="text-4xl font-extrabold text-indigo-600 mb-4">Welcome to Lakbay</h2>
              <p className="text-xl text-gray-600 mb-8">Your personal travel assistant to explore the beauty of the Philippines.</p>
              <Button onClick={handleStartChat} size="lg">
                Start Planning Your Trip
              </Button>
            </section>

            {/* Features Section */}
            <section>
              <h3 className="text-2xl font-semibold text-indigo-600 mb-6">Why Choose Lakbay?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Personalized Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    Get tailored suggestions based on your preferences and travel style.
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Local Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    Access insider tips and hidden gems from our team of local experts.
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Real-time Assistance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    Get instant help and answers to all your travel questions.
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Team Section */}
            <section>
              <h3 className="text-2xl font-semibold text-indigo-600 mb-6">Meet Our Team</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
                {[{ name: "John Doe", role: "Frontend Developer", image: "/team1.jpg" }, 
                  { name: "Jane Smith", role: "Backend Developer", image: "/team2.jpg" }, 
                  { name: "Maria Perez", role: "Full Stack Developer", image: "/team3.jpg" }, 
                  { name: "James Lee", role: "UX/UI Developer", image: "/team4.jpg" }].map((member, index) => (
                  <div key={index} className="text-center">
                    <img src={member.image} alt={member.name} className="w-24 h-24 rounded-full mx-auto mb-4 shadow-lg"/>
                    <h4 className="font-semibold">{member.name}</h4>
                    <p className="text-gray-500">{member.role}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Travel Assistant</CardTitle>
              <Button variant="ghost" onClick={() => setIsChatActive(false)}>×</Button>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] overflow-y-auto space-y-4 mb-4">
                {messages.map((message, idx) => (
                  <div
                    key={idx}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800"}`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-2 text-gray-800 animate-pulse">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about your Philippine travel plans..."
                    disabled={isLoading}
                    className="w-full"
                  />
                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    Send
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Hotel className="w-4 h-4 mr-2" />
                    Hotels Nearby
                  </Button>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <MapPin className="w-4 h-4 mr-2" />
                    Popular Spots
                  </Button>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Sun className="w-4 h-4 mr-2" />
                    Weather Updates
                  </Button>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <CloudRain className="w-4 h-4 mr-2" />
                    Best Time to Visit
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Lakbay. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
