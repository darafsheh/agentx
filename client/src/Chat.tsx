import { useRef, useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import "./App.css";
import path from "path";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";


type TextResponse = {
    text: string;
    user: string;
    attachments?: { url: string; contentType: string; title: string }[];
};

export default function Chat() {
    const { user, isLoaded, isSignedIn } = useUser();

    // Wait for user data to be loaded
    if (!isLoaded) {
        return <div>Loading...</div>;  // Show loading indicator while data is being fetched
    }

    console.log("Signed in? ");
    console.log(isSignedIn);
    //User must be logged in to view this page
    if (!isSignedIn) {
        return <Navigate to="/login" />;  // Adjust the path to your login route
    }

    const { agentId } = useParams();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<TextResponse[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);


    // At the top of Chat.tsx, add new state
    const [sessionInitialized, setSessionInitialized] = useState(false);
    const [sessionIds, setSessionIds] = useState<{userId: string, roomId: string} | null>(null);

    const hasInitialized = useRef(false);

    //focus on message input
    const focusInput = () => {
        console.log("Focus attempt - inputRef is:", inputRef.current);
        inputRef.current?.focus();
    };

    //auto scroll messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (user) {
            hasInitialized.current = true;
            initMutation.mutate(); // Only runs once
        }
    }, []);

    // focus on input on load
    useEffect(() => {
        if (sessionInitialized) {
            focusInput();
        }
    }, [sessionInitialized]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]); // Runs whenever messages change

    const initMutation = useMutation({
        mutationFn: async () => {
            if (!user) throw new Error("No user found");

            const res = await fetch(`/api/${agentId}/init-session`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: user.id,
                    name: user.fullName || user.username,
                    email: user.primaryEmailAddress?.emailAddress
                }),
            });
            const data = await res.json();
            if (data.success) {
                return { userId: user.id, roomId: data.roomId };
            }
            throw new Error('Failed to initialize session');
        },
        onSuccess: (data) => {
            setSessionInitialized(true);
            setSessionIds(data);
        },
    });

    const mutation = useMutation({
        mutationFn: async (text: string) => {
            if (!user) throw new Error("User not initialized");


            const formData = new FormData();
            formData.append("text", text);
            formData.append("userId", user.id);  // Using Clerk user ID
            formData.append("roomId", `default-room-${agentId}`);
            //formData.append("userId", "user");
            //formData.append("roomId", `default-room-${agentId}`);

            if (selectedFile) {
                formData.append("file", selectedFile);
            }

            const res = await fetch(`/api/${agentId}/message`, {
                method: "POST",
                body: formData,
            });
            return res.json() as Promise<TextResponse[]>;
        },
        onSuccess: (data) => {
            setMessages((prev) => [...prev, ...data]);
            setSelectedFile(null);
            // Add focus here after mutation completes
            setTimeout(() => focusInput(), 0);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() && !selectedFile) return;

        // Add user message immediately to state
        const userMessage: TextResponse = {
            text: input,
            user: "user",
            attachments: selectedFile ? [{ url: URL.createObjectURL(selectedFile), contentType: selectedFile.type, title: selectedFile.name }] : undefined,
        };
        setMessages((prev) => [...prev, userMessage]);

        mutation.mutate(input);
        setInput("");
        focusInput();
    };

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
        }
    };

    return (
        <>
        <SignedOut>
            <SignInButton />
        </SignedOut>
        <SignedIn>
            <div className="bg-gray-900 flex flex-col h-screen max-h-screen w-full">
                {!sessionInitialized ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                        {initMutation.isPending ? "Initializing chat..." : "Failed to initialize chat"}
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex-1 min-h-0">
                        <div className="h-full overflow-y-auto p-4">
                            <div className="max-w-3xl mx-auto space-y-4">
                                {messages.length > 0 ? (
                                    messages.map((message, index) => (
                                        <div
                                            key={index}
                                            className={`text-left flex ${
                                                message.user === "user"
                                                    ? "justify-end"
                                                    : "justify-start"
                                            }`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                                    message.user === "user"
                                                        ? "bg-blue-500 text-primary-foreground"
                                                        : "bg-gray-700 text-gray-200"
                                                }`}
                                            >
                                                {message.text}
                                                {message.attachments?.map((attachment, i) => (
                                                    attachment.contentType.startsWith('image/') && (
                                                        <img
                                                            key={i}
                                                            src={message.user === "user"
                                                                ? attachment.url
                                                                : attachment.url.startsWith('http')
                                                                    ? attachment.url
                                                                    : `http://localhost:3000/media/generated/${attachment.url.split('/').pop()}`
                                                            }
                                                            alt={attachment.title || "Attached image"}
                                                            className="mt-2 max-w-full rounded-lg"
                                                        />
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-muted-foreground text-gray-300">
                                        Start a conversation!
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                    </div>

                    <div className="h-20 sticky bottom-0 w-full bg-gray-900 border-t border-gray-600	 p-4">
                        <div className="max-w-3xl mx-auto">
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="block text-sm/6 font-medium text-white border-gray-500 active:border-blue-500 focus:border-blue-500 focus-visible:border-b-4"
                                    disabled={mutation.isPending}
                                    ref={inputRef}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={handleFileSelect}
                                    disabled={mutation.isPending}
                                >
                                    <ImageIcon className="h-4 w-4" />
                                </Button>
                                <Button type="submit" disabled={mutation.isPending} className="bg-blue-500 hover:bg-blue-600 pl-10 pr-10">
                                    {mutation.isPending ? "..." : "Send"}
                                </Button>
                            </form>
                            {selectedFile && (
                                <div className="mt-2 text-sm text-muted-foreground">
                                    Selected file: {selectedFile.name}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            </div>
        </SignedIn>
        </>


    );
}
