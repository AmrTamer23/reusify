"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createTag, updateTag, deleteTag } from "@/app/actions/tags";
import { use } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, X, Save, Tag as TagIcon } from "lucide-react";

export function TagsPageClient({
  tagsPromise,
}: {
  tagsPromise: Promise<
    ({
      _count: {
        snippets: number;
      };
    } & {
      id: string;
      name: string;
      userId: string;
    })[]
  >;
}) {
  const initialTags = use(tagsPromise);
  const [tags, setTags] = useState(initialTags);
  const [isPending, startTransition] = useTransition();
  const [newTagDialogOpen, setNewTagDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [editTagId, setEditTagId] = useState<string | null>(null);
  const [editTagName, setEditTagName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Function to create a new tag
  const handleCreateTag = () => {
    if (!newTagName.trim()) {
      toast.error("Tag name cannot be empty");
      return;
    }

    startTransition(async () => {
      const result = await createTag({ name: newTagName.trim() });

      if (result.success) {
        toast.success("Tag created successfully");
        // Add the new tag to the local state
        if (result.tag) {
          setTags((prevTags) => [
            ...prevTags,
            { ...result.tag, _count: { snippets: 0 } },
          ]);
        }
        setNewTagName("");
        setNewTagDialogOpen(false);
      } else {
        toast.error(`Failed to create tag: ${result.error}`);
      }
    });
  };

  // Function to edit a tag
  const handleEditTag = () => {
    if (!editTagName.trim() || !editTagId) {
      toast.error("Tag name cannot be empty");
      return;
    }

    startTransition(async () => {
      const result = await updateTag({
        id: editTagId,
        name: editTagName.trim(),
      });

      if (result.success) {
        toast.success("Tag updated successfully");
        // Update the tag in the local state
        if (result.tag) {
          setTags((prevTags) =>
            prevTags.map((tag) =>
              tag.id === editTagId ? { ...tag, name: result.tag.name } : tag
            )
          );
        }
        setEditTagId(null);
        setEditTagName("");
      } else {
        toast.error(`Failed to update tag: ${result.error}`);
      }
    });
  };

  // Function to delete a tag
  const handleDeleteTag = (id: string) => {
    startTransition(async () => {
      const result = await deleteTag(id);

      if (result.success) {
        toast.success("Tag deleted successfully");
        // Remove the tag from the local state
        setTags((prevTags) => prevTags.filter((tag) => tag.id !== id));
      } else {
        toast.error(`Failed to delete tag: ${result.error}`);
      }
    });
  };

  // Filter tags based on search query
  const filteredTags = searchQuery
    ? tags.filter((tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tags;

  return (
    <div className="container py-6 md:py-10 mx-auto max-w-4xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <TagIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Manage Tags</h1>
        </div>

        <Dialog open={newTagDialogOpen} onOpenChange={setNewTagDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              New Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tag</DialogTitle>
              <DialogDescription>
                Add a new tag to organize your snippets.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreateTag}
                disabled={isPending || !newTagName.trim()}
              >
                {isPending ? "Creating..." : "Create Tag"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="!pt-0">
        <CardHeader className="bg-muted/20 py-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <CardTitle className="text-xl">Your Tags</CardTitle>
              <CardDescription>
                {tags.length} tag{tags.length !== 1 ? "s" : ""} total
              </CardDescription>
            </div>
            <Input
              placeholder="Search tags..."
              className="max-w-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {filteredTags.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTags.map((tag) => (
                <div
                  key={tag.id}
                  className="border rounded-md p-4 flex  justify-between group flex-col gap-4"
                >
                  <div className="flex items-center justify-between ">
                    <Badge variant="outline" className="px-3 py-1 text-base ">
                      <span>{tag.name}</span>
                    </Badge>
                    <span className="text-foreground/70">
                      {tag._count.snippets}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditTagId(tag.id);
                            setEditTagName(tag.name);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Tag</DialogTitle>
                          <DialogDescription>
                            Update the name of your tag.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Input
                            placeholder="Tag name"
                            value={editTagName}
                            onChange={(e) => setEditTagName(e.target.value)}
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={handleEditTag}
                            disabled={isPending || !editTagName.trim()}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <X className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Tag</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this tag? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTag(tag.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              {tags.length === 0 ? (
                <p className="text-muted-foreground">
                  You do not have any tags yet. Create your first tag to get
                  started.
                </p>
              ) : (
                <p className="text-muted-foreground">
                  No tags found matching your search.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
