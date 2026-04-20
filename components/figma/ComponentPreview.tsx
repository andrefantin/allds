import Image from 'next/image'
import { Grid } from 'react-feather'

interface ComponentPreviewProps {
  figmaFileId?: string
  nodeId?: string
  thumbnailUrl?: string
  name: string
}

export function ComponentPreview({ figmaFileId, nodeId, thumbnailUrl, name }: ComponentPreviewProps) {
  const embedUrl = figmaFileId && nodeId
    ? `https://www.figma.com/embed?embed_host=ds-platform&url=${encodeURIComponent(`https://www.figma.com/file/${figmaFileId}?node-id=${nodeId}`)}`
    : null

  if (embedUrl) {
    return (
      <div className="relative w-full rounded-md overflow-hidden border border-ds-border bg-ds-bg" style={{ height: '480px' }}>
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
    <div className="relative w-full aspect-video rounded-md overflow-hidden border border-ds-border bg-ds-bg flex items-center justify-center">
      {thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt={name}
          fill
          className="object-contain p-4"
          unoptimized
        />
      ) : (
        <div className="flex flex-col items-center gap-3 text-ds-text-muted">
          <Grid size={40} />
          <p className="text-[1.3rem] font-medium">No preview available</p>
          <p className="text-[1.2rem]">Connect Figma to show component previews</p>
        </div>
      )}
    </div>
  )
}
