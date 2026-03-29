import { Link } from "wouter";
import { Scale, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Scale className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="font-display text-4xl font-bold text-foreground mb-2">404</h1>
        <p className="text-muted-foreground mb-6">This page does not exist.</p>
        <Link href="/">
          <Button className="bg-primary text-primary-foreground">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
