import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react'
import "./App.css";

type Agent = {
    id: string;
    name: string;
};

function Agents() {
    const { isSignedIn } = useUser();
    console.log(isSignedIn);

    const navigate = useNavigate();
    const { data: agents, isLoading } = useQuery({
        queryKey: ["agents"],
        queryFn: async () => {
            const res = await fetch("/api/agents");
            const data = await res.json();
            return data.agents as Agent[];
        },
    });

    return (
        <header>
            <SignedOut>
                <SignInButton />
            </SignedOut>
            <SignedIn>
                <UserButton />
                <div className="min-h-screen flex flex-col items-center justify-center p-4">
                    <h1 className="text-2xl font-bold mb-8">yo! Select your agent:</h1>

                    {isLoading ? (
                        <div>Loading agents...</div>
                    ) : (
                        <div className="grid gap-4 w-full max-w-md">
                            {agents?.map((agent) => (
                                <Button
                                    key={agent.id}
                                    className="w-full text-lg py-6"
                                    onClick={() => {
                                        navigate(`/${agent.id}`);
                                    }}
                                >
                                    {agent.name}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </SignedIn>
        </header>

    );
}

export default Agents;
