import React from "react";

import { QuizType } from "../types/QuizType";

import { Card, CardContent } from "@/components/ui/card";

interface QuizCardProps {
  /**
   * Card data — only the fields the shared chrome reads. Parents may
   * pass a fuller `QuizType` (TS structural typing accepts it).
   */
  quiz: Pick<QuizType, "_id" | "title" | "description">;
  /**
   * Animation stagger index — feeds the per-card motion delay so a
   * grid populates with a soft cascade. Capped at 0.3s in the math
   * below so very long lists don't drag.
   */
  index: number;
  /**
   * Optional top-row content (e.g. visibility badge + share button).
   * The card wraps it in a flex-between container with consistent
   * spacing. Pass nothing and the row is omitted entirely.
   */
  topBar?: React.ReactNode;
  /**
   * Inline accessory rendered next to the title (edit-pen / remove-X).
   * The card wraps title + accessory in a flex-between row.
   */
  titleAccessory?: React.ReactNode;
  /**
   * When true and `quiz.description` is present, renders it under the
   * title with `line-clamp-2`. Defaults to false.
   */
  showDescription?: boolean;
  /**
   * Free-form meta region. The card renders children verbatim; each
   * parent picks its own layout (horizontal chips vs vertical rows).
   */
  meta: React.ReactNode;
  /**
   * Footer slot — primary + secondary buttons. The card wraps it in
   * `mt-auto flex items-center gap-2 border-t border-border pt-4`.
   */
  footer: React.ReactNode;
}

/**
 * Shared visual chrome for quiz cards across Quiz.tsx and Library.tsx.
 * Owns the outer motion wrapper, hover styles, padding, title, and
 * spacing. Each parent fills the slot props with its own bespoke
 * interior — see `Quiz.tsx` and `Library.tsx` for canonical usage.
 */
const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
  index,
  topBar,
  titleAccessory,
  showDescription,
  meta,
  footer,
}) => {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out fill-mode-backwards motion-reduce:animate-none"
      style={{ animationDelay: `${Math.min(index * 40, 300)}ms` }}
    >
      <Card className="group relative h-full border-border bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 motion-reduce:hover:translate-y-0">
        <CardContent className="flex h-full flex-col p-6">
          {topBar && (
            <div className="mb-3 flex items-center justify-between gap-2">
              {topBar}
            </div>
          )}

          <div className="mb-2 flex items-start justify-between gap-2">
            <h2 className="line-clamp-2 text-lg font-semibold text-foreground">
              {quiz.title}
            </h2>
            {titleAccessory}
          </div>

          {showDescription && quiz.description && (
            <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {quiz.description}
            </p>
          )}

          <div className="flex-1">{meta}</div>

          <div className="mt-auto flex items-center gap-2 border-t border-border pt-4">
            {footer}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizCard;
