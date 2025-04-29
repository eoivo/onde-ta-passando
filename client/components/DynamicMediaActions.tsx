"use client";

import dynamic from "next/dynamic";

const MediaActions = dynamic(() => import("@/components/MediaActions"), {
  ssr: false,
  loading: () => (
    <div className="w-28 h-10 bg-gray-800/50 rounded-full animate-pulse"></div>
  ),
});

interface DynamicMediaActionsProps {
  mediaId: string;
  mediaType: "movie" | "tv";
  title?: string;
  name?: string;
  posterPath: string;
}

export default function DynamicMediaActions({
  mediaId,
  mediaType,
  title,
  name,
  posterPath,
}: DynamicMediaActionsProps) {
  return (
    <MediaActions
      mediaId={mediaId}
      mediaType={mediaType}
      title={title}
      name={name}
      posterPath={posterPath}
    />
  );
}
