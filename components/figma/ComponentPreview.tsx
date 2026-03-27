import Image from 'next/image'

interface ComponentPreviewProps {
  figmaFileId?: string
  nodeId?: string
  thumbnailUrl?: string
  name: string
}

export function ComponentPreview({ figmaFileId, nodeId, thumbnailUrl, name }: ComponentPreviewProps) {
  const embedUrl = figmaFileId && nodeId
    ? `https://www.figma.com/embed?embed_host=fics-platform&url=${encodeURIComponent(`https://www.figma.com/file/${figmaFileId}?node-id=${nodeId}`)}`
    : null

  if (embedUrl) {
    return (
      <div className="relative w-full rounded-md overflow-hidden border border-fics-border bg-fics-bg" style={{ height: '480px' }}>
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
          title={`${name} in Figma`}
        />
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-video rounded-md overflow-hidden border border-fics-border bg-fics-bg flex items-center justify-center">
      {thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt={name}
          fill
          className="object-contain p-4"
          unoptimized
        />
      ) : (
        <div className="flex flex-col items-center gap-3 text-fics-text-muted">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
          <p className="text-[1.3rem] font-medium">No preview available</p>
          <p className="text-[1.2rem]">Connect Figma to show component previews</p>
        </div>
      )}
    </div>
  )
}
