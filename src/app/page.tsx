"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Brain, Sparkles, Wand2, Tags, Search, Lock, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">AI Notes</span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <Brain className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight">
            Smart Note-Taking with{" "}
            <span className="text-primary">AI Power</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your notes with AI-powered features. Summarize, improve,
            and organize your thoughts effortlessly.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" asChild>
              <Link href="/register">
                Get Started Free
                <Zap className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powerful AI Features</h2>
          <p className="text-muted-foreground">
            Everything you need to take your note-taking to the next level
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <Sparkles className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI Summary</CardTitle>
              <CardDescription>
                Generate concise summaries of long notes instantly with AI
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Wand2 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI Improve</CardTitle>
              <CardDescription>
                Enhance your writing with grammar fixes and clarity improvements
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Tags className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Auto Tags</CardTitle>
              <CardDescription>
                Automatically generate relevant tags for easy organization
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Search className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Smart Search</CardTitle>
              <CardDescription>
                Find notes quickly with powerful search functionality
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Lock className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your notes are protected with secure authentication
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Brain className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Smart Organization</CardTitle>
              <CardDescription>
                Keep your notes organized with tags and search
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-4xl mx-auto text-center p-8 bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-3xl mb-4">
              Ready to get started?
            </CardTitle>
            <CardDescription className="text-primary-foreground/80 text-lg">
              Join thousands of users who are taking smarter notes with AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">
                Create Free Account
                <Brain className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 AI Notes. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}