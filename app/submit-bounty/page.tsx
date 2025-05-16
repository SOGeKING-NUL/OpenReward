"use client";

import { Navbar } from "@/components/main-components/navbar";

const Page =  () => {
    return(
        <div className="relative min-h-screen w-full overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-20 right-20 w-80 h-80 bg-primary/10 rounded-full filter blur-3xl animate-pulse-slow" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl animate-pulse-slow" />
                <div className="noise" />
            </div>
    
            <Navbar />
        <div>hello</div>
        </div>
    )
};

export default Page;