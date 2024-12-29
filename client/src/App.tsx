import "./App.css";
import Agents from "./Agents";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'


function App() {
    return (
        <header>
        <SignedOut>
            <SignInButton />
        </SignedOut>
        <SignedIn>
            <UserButton />
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <Agents />
            </div>
        </SignedIn>
        </header>

    );
}

export default App;
