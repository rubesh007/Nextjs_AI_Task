"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Save, Sparkles, Wand2, Tags } from "lucide-react";
import { toast } from "sonner";

interface Note {
  id?: number;
  title: string;
  content: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface NoteEditorProps {
  note?: Note;
  onSave: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onCancel: () => void;
  onAISummary?: (content: string) => Promise<string>;
  onAIImprove?: (content: string) => Promise<string>;
  onAITags?: (content: string) => Promise<string[] | string>;
}

export function NoteEditor({
  note,
  onSave,
  onCancel,
  onAISummary,
  onAIImprove,
  onAITags,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  // ✅ Sync props with local state when editing an existing note
  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setTags(note.tags || []);
    }
  }, [note]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setIsSaving(true);
    try {
      await onSave({ title, content, tags });
      toast.success(note ? "Note updated" : "Note created");
    } catch (error) {
      toast.error("Failed to save note");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleAISummary = async () => {
    if (!content.trim() || !onAISummary) return;

    setIsProcessingAI(true);
    try {
      const summary = await onAISummary(content);
      setContent(summary);
      toast.success("Summary generated");
    } catch (error) {
      toast.error("Failed to generate summary");
      console.error(error);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleAIImprove = async () => {
    if (!content.trim() || !onAIImprove) return;

    setIsProcessingAI(true);
    try {
      const improved = await onAIImprove(content);
      setContent(improved);
      toast.success("Content improved");
    } catch (error) {
      toast.error("Failed to improve content");
      console.error(error);
    } finally {
      setIsProcessingAI(false);
    }
  };

  // ✅ Type-safe & stable AI tags handler
  const handleAITags = async () => {
    if (!content.trim() || !onAITags) return;

    setIsProcessingAI(true);
    try {
      const generatedTags = await onAITags(content);
      console.log("Generated Tags:", generatedTags);

      let normalizedTags: string[] = [];

      if (Array.isArray(generatedTags)) {
        normalizedTags = generatedTags;
      } else if (typeof generatedTags === "string") {
        normalizedTags = generatedTags
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean);
      } else {
        normalizedTags = [];
      }

      setTags((prev) => [...new Set([...prev, ...normalizedTags])]);
      toast.success("Tags generated");
    } catch (error) {
      toast.error("Failed to generate tags");
      console.error(error);
    } finally {
      setIsProcessingAI(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{note ? "Edit Note" : "Create New Note"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold"
          />
        </div>

        <div>
          <Textarea
            placeholder="Write your note here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[300px] resize-none"
          />
        </div>

        {/* AI Actions */}
        <div className="flex flex-wrap gap-2">
          {onAISummary && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAISummary}
              disabled={!content.trim() || isProcessingAI}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              AI Summary
            </Button>
          )}
          {onAIImprove && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAIImprove}
              disabled={!content.trim() || isProcessingAI}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              AI Improve
            </Button>
          )}
          {onAITags && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAITags}
              disabled={!content.trim() || isProcessingAI}
            >
              <Tags className="mr-2 h-4 w-4" />
              {isProcessingAI ? "Generating..." : "AI Tags"}
            </Button>
          )}
        </div>

        {/* Tags Section */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Add tags..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={handleAddTag}>
              Add
            </Button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isProcessingAI}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Note"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
