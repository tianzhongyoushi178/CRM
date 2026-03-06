"use client";

import { useState, useEffect, useCallback } from "react";

interface Author {
  id: string;
  name: string;
}

interface Comment {
  id: string;
  body: string;
  authorId: string;
  createdAt: string;
  author: Author;
}

interface Like {
  id: string;
  postId: string;
  userId: string;
}

interface Post {
  id: string;
  body: string;
  type: string;
  authorId: string;
  createdAt: string;
  author: Author;
  comments: Comment[];
  likes: Like[];
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  if (diffHour < 24) return `${diffHour}時間前`;
  if (diffDay < 7) return `${diffDay}日前`;
  return date.toLocaleDateString("ja-JP");
}

export default function ChatterFeed({ currentUserId }: { currentUserId: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostBody, setNewPostBody] = useState("");
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/chatter");
      if (!res.ok) throw new Error("取得失敗");
      const data = await res.json() as { posts: Post[] };
      setPosts(data.posts);
    } catch (err) {
      console.error("投稿の読み込みに失敗:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const handleCreatePost = async () => {
    if (!newPostBody.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/chatter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newPostBody }),
      });
      if (!res.ok) throw new Error("投稿失敗");
      const post = await res.json() as Post;
      setPosts((prev) => [post, ...prev]);
      setNewPostBody("");
    } catch (err) {
      console.error("投稿の作成に失敗:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/chatter/${postId}/like`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("いいね失敗");
      const result = await res.json() as { liked: boolean };
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          if (result.liked) {
            return {
              ...p,
              likes: [
                ...p.likes,
                { id: "temp", postId, userId: currentUserId },
              ],
            };
          } else {
            return {
              ...p,
              likes: p.likes.filter((l) => l.userId !== currentUserId),
            };
          }
        })
      );
    } catch (err) {
      console.error("いいねに失敗:", err);
    }
  };

  const handleComment = async (postId: string) => {
    const text = commentTexts[postId]?.trim();
    if (!text) return;
    try {
      const res = await fetch(`/api/chatter/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (!res.ok) throw new Error("コメント失敗");
      const comment = await res.json() as Comment;
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return { ...p, comments: [...p.comments, comment] };
        })
      );
      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
      setExpandedComments((prev) => ({ ...prev, [postId]: true }));
    } catch (err) {
      console.error("コメントに失敗:", err);
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-[#706E6B] text-sm">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* パブリッシャー（投稿フォーム） */}
      <div className="bg-white rounded-xl shadow-sm border border-[#DDDBDA] p-4">
        <textarea
          value={newPostBody}
          onChange={(e) => setNewPostBody(e.target.value)}
          placeholder="共有する内容を入力..."
          className="w-full rounded-lg border border-[#DDDBDA] px-3 py-2 text-sm focus:border-[#0070D2] focus:ring-1 focus:ring-[#0070D2] focus:outline-none resize-none"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleCreatePost}
            disabled={!newPostBody.trim() || isSubmitting}
            className="bg-[#0070D2] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#005FB2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "投稿中..." : "共有"}
          </button>
        </div>
      </div>

      {/* フィード投稿一覧 */}
      {posts.length === 0 ? (
        <div className="text-center py-12 text-[#706E6B] text-sm">
          まだ投稿がありません。最初の投稿を作成しましょう！
        </div>
      ) : (
        posts.map((post) => {
          const isLiked = post.likes.some((l) => l.userId === currentUserId);
          const isExpanded = expandedComments[post.id] ?? false;
          return (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-sm border border-[#DDDBDA] p-4"
            >
              {/* ヘッダー */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0070D2] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {getInitial(post.author.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-sm text-[#3E3E3C] hover:text-[#0070D2] cursor-pointer">
                      {post.author.name}
                    </span>
                    <span className="text-xs text-[#706E6B]">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                  {/* 本文 */}
                  <p className="mt-2 text-sm text-[#3E3E3C] whitespace-pre-wrap">
                    {post.body}
                  </p>
                </div>
              </div>

              {/* フッター */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#DDDBDA]">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`text-sm flex items-center gap-1 transition-colors ${
                    isLiked
                      ? "text-[#0070D2] font-medium"
                      : "text-[#706E6B] hover:text-[#0070D2]"
                  }`}
                >
                  <span>&#128077;</span>
                  <span>いいね！</span>
                  {post.likes.length > 0 && (
                    <span className="text-xs">({post.likes.length})</span>
                  )}
                </button>
                <button
                  onClick={() => toggleComments(post.id)}
                  className="text-sm text-[#706E6B] hover:text-[#0070D2] flex items-center gap-1 transition-colors"
                >
                  <span>&#128172;</span>
                  <span>コメント</span>
                  {post.comments.length > 0 && (
                    <span className="text-xs">({post.comments.length})</span>
                  )}
                </button>
              </div>

              {/* コメント入力欄 */}
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="text"
                  value={commentTexts[post.id] || ""}
                  onChange={(e) =>
                    setCommentTexts((prev) => ({
                      ...prev,
                      [post.id]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleComment(post.id);
                    }
                  }}
                  placeholder="コメントを記入する..."
                  className="flex-1 rounded-lg border border-[#DDDBDA] px-3 py-2 text-sm focus:border-[#0070D2] focus:ring-1 focus:ring-[#0070D2] focus:outline-none"
                />
                <button
                  onClick={() => handleComment(post.id)}
                  disabled={!commentTexts[post.id]?.trim()}
                  className="bg-[#0070D2] text-white rounded-lg px-3 py-2 text-sm hover:bg-[#005FB2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  送信
                </button>
              </div>

              {/* コメント一覧 */}
              {isExpanded && post.comments.length > 0 && (
                <div className="mt-3 space-y-2 pl-4 border-l-2 border-[#DDDBDA]">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#0070D2] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {getInitial(comment.author.name)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-xs text-[#3E3E3C]">
                            {comment.author.name}
                          </span>
                          <span className="text-xs text-[#706E6B]">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-[#3E3E3C] mt-0.5">
                          {comment.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
