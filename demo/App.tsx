import { useCallback, useState } from "react";
import { CommentSection } from "@/components/comment-section";
import type { Attachment, Comment } from "@/index";
import { initialComments } from "./mock-data";

const DEMO_USER = {
  name: "Guest User",
  avatar: "/placeholder.svg?height=36&width=36",
};

export default function App() {
  const [comments, setComments] = useState<Comment[]>(initialComments);

  const handleLike = useCallback((id: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
          : c,
      ),
    );
  }, []);

  const handleLikeReply = useCallback((commentId: string, replyId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: c.replies.map((r) =>
                r.id === replyId
                  ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 }
                  : r,
              ),
            }
          : c,
      ),
    );
  }, []);

  const handleSubmit = useCallback(
    (text: string, attachment?: Attachment, replyTo?: string) => {
      const newComment: Comment = {
        id: Date.now().toString(),
        name: DEMO_USER.name,
        avatar: DEMO_USER.avatar,
        text: replyTo ? `@${replyTo} ${text}` : text,
        likes: 0,
        liked: false,
        timestamp: "now",
        replies: [],
        image: attachment?.type === "image" ? attachment.url : undefined,
        sticker: attachment?.type === "sticker" ? attachment.url : undefined,
      };
      setComments((prev) => [newComment, ...prev]);
    },
    [],
  );

  return (
    <main
      className="tcm:min-h-svh tcm:flex tcm:items-stretch tcm:lg:tcm:items-center tcm:justify-center tcm:lg:tcm:p-4"
      style={{ background: "oklch(0.10 0.004 285.82)" }}
    >
      <div
        className="tcm:relative tcm:w-full tcm:flex tcm:flex-col tcm:h-svh tcm:lg:tcm:h-[min(92svh,800px)] tcm:lg:tcm:max-w-2xl tcm:lg:tcm:rounded-2xl tcm:overflow-hidden"
        style={{ background: "var(--background)" }}
      >
        <CommentSection
          comments={comments}
          currentUser={DEMO_USER}
          onSubmit={handleSubmit}
          onLike={handleLike}
          onLikeReply={handleLikeReply}
        />
      </div>
    </main>
  );
}
