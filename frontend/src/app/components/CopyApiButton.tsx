'use client';

import { useState } from 'react';

type Props = {
  className?: string;
};

export default function CopyApiButton({ className }: Props) {
  const [copied, setCopied] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${apiBase}/api`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Failed to copy API URL:', error);
    }
  };

  return (
    <button className={className} type="button" onClick={handleCopy}>
      {copied ? 'API URL copied' : 'Copy API URL'}
    </button>
  );
}
