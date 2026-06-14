import Link from "next/link";
import { Compass } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main
      className="relative min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-md">
        <p className="text-center font-display italic text-[72px] text-[var(--color-brand-400)] leading-none mb-1">404</p>
        <EmptyState
          icon={<Compass size={40} strokeWidth={1.5} />}
          title="Bu sayfa kaybolmuş"
          description="Aradığın Aurion başka bir boyutta olabilir. Seni tanıdık bir yere geri götürelim."
          action={
            <Link href="/">
              <Button size="lg">Ana sayfaya dön</Button>
            </Link>
          }
        />
      </div>
    </main>
  );
}
