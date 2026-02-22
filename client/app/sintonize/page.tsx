import { Suspense } from "react";
import SintonizeContent from "./SintonizeContent";
import LoadingReset from "@/components/LoadingReset";

export const metadata = {
    title: "Sintonize seu Gosto | Onde Tá Passando?",
    description: "Encontre filmes e séries com a mesma vibe e DNA das suas obras favoritas.",
};

export default function SintonizePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen pt-32 px-4 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin"></div>
            </div>
        }>
            <LoadingReset />
            <SintonizeContent />
        </Suspense>
    );
}
