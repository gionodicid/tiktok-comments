import { useState } from "react";
import { CommentSection, type CommentApiPayload } from "@/components/comment-section";

function mapCommentsResponse(raw: unknown): CommentApiPayload {
  return raw as CommentApiPayload;
}

export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  return (
    <main
      className="tcm-min-h-dvh tcm-flex tcm-items-stretch tcm-lg:tcm-items-center tcm-justify-center tcm-lg:tcm-p-4"
      style={{
        background: theme === "dark" ? "oklch(0.10 0.004 285.82)" : "oklch(0.94 0.004 285.82)",
      }}
    >
      <div
        className="tcm-relative tcm-w-full tcm-flex tcm-flex-col tcm-min-h-0 tcm-h-dvh tcm-lg:tcm-h-[min(92dvh,800px)] tcm-lg:tcm-max-w-2xl tcm-lg:tcm-rounded-2xl tcm-overflow-hidden"
        style={{ background: "var(--background)" }}
      >
        <CommentSection
          url="/api/comments"
          response={mapCommentsResponse}
          theme={theme}
          showThemeToggle
          onThemeChange={setTheme}
          onReportSticker={(src) => console.info("[demo] report sticker:", src)}
        />
      </div>
    </main>
  );
}
