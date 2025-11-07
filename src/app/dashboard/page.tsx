"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession, authClient } from "@/lib/auth-client";
import { NoteEditor } from "@/components/NoteEditor";
import { NoteCard } from "@/components/NoteCard";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PlusCircle, LogOut, User, Brain, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateSummary, improveContent, generateTags } from "@/lib/ai";

interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/notes", {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }

      const data = await response.json();
      setNotes(data.notes || []);
      setFilteredNotes(data.notes || []);
    } catch (error) {
      toast.error("Failed to load notes");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchNotes();
    }
  }, [session?.user, fetchNotes]);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);

      if (!query.trim()) {
        setFilteredNotes(notes);
        return;
      }

      try {
        const response = await fetch(`/api/notes/search?q=${encodeURIComponent(query)}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();
        setFilteredNotes(data.notes || []);
      } catch (error) {
        console.error(error);
        const filtered = notes.filter(
          (note) =>
            note.title.toLowerCase().includes(query.toLowerCase()) ||
            note.content.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredNotes(filtered);
      }
    },
    [notes]
  );

  const handleSaveNote = async (noteData: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
    try {
      if (editingNote) {
        const response = await fetch(`/api/notes/${editingNote.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify(noteData),
        });

        if (!response.ok) {
          throw new Error("Failed to update note");
        }
      } else {
        const response = await fetch("/api/notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify(noteData),
        });

        if (!response.ok) {
          throw new Error("Failed to create note");
        }
      }

      setIsEditing(false);
      setEditingNote(undefined);
      fetchNotes();
    } catch (error) {
      throw error;
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditing(true);
  };

  const handleDeleteNote = async (id: number) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      toast.success("Note deleted");
      fetchNotes();
    } catch (error) {
      toast.error("Failed to delete note");
      console.error(error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();

    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    }
  };

  if (isPending || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">AI Notes</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/profile")}
              >
                <User className="h-5 w-5" />
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isEditing ? (
          <div className="max-w-4xl mx-auto">
            <NoteEditor
              note={editingNote}
              onSave={handleSaveNote}
              onCancel={() => {
                setIsEditing(false);
                setEditingNote(undefined);
              }}
              onAISummary={generateSummary}
              onAIImprove={improveContent}
              onAITags={generateTags}
            />
          </div>
        ) : (
          <>
            {/* Search and Actions */}
            <div className="max-w-6xl mx-auto mb-8 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <SearchBar onSearch={handleSearch} />
                </div>
                <Button onClick={() => setIsEditing(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Note
                </Button>
              </div>
            </div>

            {/* Notes Grid */}
            <div className="max-w-6xl mx-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "No notes found matching your search"
                      : "No notes yet. Create your first note!"}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setIsEditing(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Note
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={handleEditNote}
                      onDelete={handleDeleteNote}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}