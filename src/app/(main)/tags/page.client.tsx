"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  createTag,
  updateTag,
  removeTagFromUser,
  deleteTag,
  getSnippetsByTag,
} from "@/app/actions/tags";
import { Pencil, Trash, Plus, Tag, Hash } from "lucide-react";
import { toast } from "sonner";

type TagType = {
  id: string;
  name: string;
  count?: number;
};

export function TagsPageClient({
  userTags,
  popularTags,
}: {
  userTags: TagType[];
  popularTags: (TagType & { count: number })[];
}) {
  const router = useRouter();
  const [newTagName, setNewTagName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [tagToEdit, setTagToEdit] = useState<TagType | null>(null);
  const [tagToDelete, setTagToDelete] = useState<TagType | null>(null);
  const [editedTagName, setEditedTagName] = useState("");
  const [tagSearchQuery, setTagSearchQuery] = useState("");

  const filteredTags = userTags.filter((tag) =>
    tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error("Tag name cannot be empty");
      return;
    }

    setIsCreating(true);
    try {
      const result = await createTag(newTagName.trim());
      if (result.success) {
        toast.success("Tag created successfully");
        setNewTagName("");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create tag");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateTag = async () => {
    if (!tagToEdit) return;
    if (!editedTagName.trim()) {
      toast.error("Tag name cannot be empty");
      return;
    }

    try {
      const result = await updateTag(tagToEdit.id, editedTagName.trim());
      if (result.success) {
        toast.success("Tag updated successfully");
        setTagToEdit(null);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update tag");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  const handleRemoveTag = async (id: string) => {
    try {
      const result = await removeTagFromUser(id);
      if (result.success) {
        toast.success("Tag removed successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to remove tag");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  const handleDeleteTag = async () => {
    if (!tagToDelete) return;

    try {
      const result = await deleteTag(tagToDelete.id);
      if (result.success) {
        toast.success("Tag deleted successfully");
        setTagToDelete(null);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete tag");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  const viewSnippetsByTag = async (id: string, name: string) => {
    try {
      const result = await getSnippetsByTag(id);
      if (result.success) {
        // Navigate to a filtered view or display results
        router.push(`/?tag=${id}`);
      } else {
        toast.error(result.error || "Failed to load snippets");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  return (
    <div className="container py-6 max-w-4xl">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manage Tags</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Your tags */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Your Tags
              </CardTitle>
              <CardDescription>
                Manage your personal code snippet tags
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="New tag name"
                  className="flex-1"
                />
                <Button
                  onClick={handleCreateTag}
                  disabled={isCreating || !newTagName.trim()}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              <div className="mb-4">
                <Input
                  value={tagSearchQuery}
                  onChange={(e) => setTagSearchQuery(e.target.value)}
                  placeholder="Search tags..."
                  className="w-full"
                />
              </div>

              {filteredTags.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tag Name</TableHead>
                      <TableHead className="w-[120px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTags.map((tag) => (
                      <TableRow key={tag.id}>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => viewSnippetsByTag(tag.id, tag.name)}
                          >
                            {tag.name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setTagToEdit(tag);
                                setEditedTagName(tag.name);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => setTagToDelete(tag)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  {tagSearchQuery
                    ? "No tags match your search"
                    : "You haven't created any tags yet"}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Popular tags */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Popular Tags
              </CardTitle>
              <CardDescription>
                Most commonly used tags across snippets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {popularTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="cursor-pointer text-sm py-1 px-3"
                      onClick={() => viewSnippetsByTag(tag.id, tag.name)}
                    >
                      {tag.name}
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({tag.count})
                      </span>
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No popular tags found
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit tag dialog */}
      <Dialog
        open={!!tagToEdit}
        onOpenChange={(open) => !open && setTagToEdit(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Update the tag name. This will affect all snippets using this tag.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editedTagName}
              onChange={(e) => setEditedTagName(e.target.value)}
              placeholder="Tag name"
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagToEdit(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTag} disabled={!editedTagName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete tag alert */}
      <AlertDialog
        open={!!tagToDelete}
        onOpenChange={(open) => !open && setTagToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this tag from your collection. It will also be
              removed from any of your snippets that use it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTagToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTag}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
