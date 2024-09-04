"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MessageSquare, Send, Loader } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { NavBar } from "@/components/nav-bar";
import { useAudioRecorder } from "@/app/hooks/useAudioRecorder";

export function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const { recording, toggleRecording, processingAudio } = useAudioRecorder();

  const handleSend = () => {};

  const InitialScreen = () => (
    <>
      <NavBar
        darkMode={darkMode}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        toggleDarkMode={toggleDarkMode}
      />
      <div className="flex flex-col items-center justify-center h-full space-y-8">
        <Button
          variant="outline"
          size="lg"
          className={`rounded-full p-8 ${
            recording
              ? "bg-red-500 hover:bg-red-500 text-white hover:text-white"
              : ""
          }`}
          onClick={toggleRecording}
        >
          {processingAudio ? <Loader className="h-12 w-12" /> : <Mic className="h-12 w-12" />}
          <span className="sr-only">Activate voice assistant</span>
        </Button>
        <Button size="lg" onClick={() => setShowChat(true)}>
          <MessageSquare className="h-6 w-6 mr-2" />
          Open Chat
        </Button>
      </div>
    </>
  );

  const ChatInterface = () => (
    <>
      <NavBar
        darkMode={darkMode}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        toggleDarkMode={toggleDarkMode}
      />
      {mobileMenuOpen && (
        <div className="md:hidden p-4 border-b">
          <div className="space-y-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  Pricing
                </Button>
              </DialogTrigger>
              <DialogContent>
                {/* Pricing content (same as desktop version) */}
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={toggleDarkMode}
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              More Info
            </Button>
          </div>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r p-4 hidden md:block">
          <h2 className="font-semibold mb-4">Chat History</h2>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                Previous Chat 1
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Previous Chat 2
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Previous Chat 3
              </Button>
            </div>
          </ScrollArea>
        </aside>
        <main className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-lg p-2 max-w-[80%] ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <footer className="p-4 border-t">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyUp={(e) => e.key === "Enter" && handleSend()}
              />
              <Button onClick={handleSend}>
                <Send className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={toggleRecording}>
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </footer>
        </main>
      </div>
    </>
  );

  return (
    <div
      className={`flex flex-col h-screen md:max-h-screen max-h-[calc(100vh-7rem)] overflow-hidden ${
        darkMode ? "dark" : ""
      }`}
    >
      {showChat ? <ChatInterface /> : <InitialScreen />}
    </div>
  );
}
