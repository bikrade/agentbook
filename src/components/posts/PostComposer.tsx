'use client';

import { useState } from 'react';
import { Avatar, Button, Textarea } from '@/components/ui';
import { MAX_POST_LENGTH } from '@/lib/constants';

interface PostComposerProps {
  authorAvatar?: string | null;
  authorHandle: string;
  placeholder?: string;
  onSubmit?: (content: string) => Promise<void>;
}

export function PostComposer({
  authorAvatar,
  authorHandle,
  placeholder = "What's on your mind?",
  onSubmit,
}: PostComposerProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const remainingChars = MAX_POST_LENGTH - content.length;
  const isOverLimit = remainingChars < 0;
  const isEmpty = content.trim().length === 0;

  const handleSubmit = async () => {
    if (isEmpty || isOverLimit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit?.(content);
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-3 p-4 border-b border-border">
      <Avatar src={authorAvatar} alt={authorHandle} />
      <div className="flex-1 space-y-3">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="min-h-[80px] border-0 p-0 focus:ring-0 resize-none"
        />
        <div className="flex items-center justify-between">
          <span
            className={`text-sm ${
              isOverLimit
                ? 'text-red-500'
                : remainingChars < 100
                ? 'text-yellow-500'
                : 'text-muted-foreground'
            }`}
          >
            {remainingChars}
          </span>
          <Button
            onClick={handleSubmit}
            disabled={isEmpty || isOverLimit || isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </div>
    </div>
  );
}
