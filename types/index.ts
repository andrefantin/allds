// ─── Platform User Types ──────────────────────────────────────────────────────

export interface PlatformUser {
  email: string
  passwordHash: string
  role: 'platform_editor' | 'viewer' | 'editor'
  tenant?: string
}

// ─── Tenant Types ─────────────────────────────────────────────────────────────

export interface Tenant {
  slug: string
  name: string
  description?: string
  createdAt: string
}

// ─── Token Types ────────────────────────────────────────────────────────────

export type TokenType = 'color' | 'dimension' | 'font' | 'shadow' | 'number' | 'string'

export interface Token {
  name: string
  category: string
  type: TokenType
  values: Record<string, string>
  /** Alias names per mode — present when the token references another token */
  aliases?: Record<string, string>
  description?: string
}

export interface TokenCollection {
  name: string
  modes: string[]
  tokens: Token[]
}

export interface TokenMetadata {
  version: string
  lastUpdated: string
  source: string
  description?: string
}

export interface TokenFile {
  metadata: TokenMetadata
  collections: TokenCollection[]
}

// ─── Token History ───────────────────────────────────────────────────────────

export interface TokenHistoryEntry {
  id: string
  timestamp: string
  version: string
  url?: string
  blobUrl?: string
  changesSummary?: {
    added: number
    removed: number
    changed: number
  }
}

// ─── Changelog ───────────────────────────────────────────────────────────────

export interface ChangelogEntry {
  id: string
  timestamp: string
  version: string
  added: string[]
  removed: string[]
  changed: Array<{ name: string; from: string; to: string }>
}

// ─── Figma Types ─────────────────────────────────────────────────────────────

export type ComponentStatus = 'stable' | 'beta' | 'deprecated' | 'new'

export interface FigmaComponent {
  id: string
  key: string
  name: string
  slug: string
  description: string
  thumbnailUrl?: string
  figmaUrl?: string
  status: ComponentStatus
  group: string
  fileType: 'components' | 'modules'
  properties?: ComponentProperty[]
  lastModified?: string
}

export interface ComponentProperty {
  name: string
  type: 'VARIANT' | 'BOOLEAN' | 'TEXT' | 'INSTANCE_SWAP'
  values?: string[]
}

export interface NavigationItem {
  name: string
  slug: string
  status: ComponentStatus
}

export interface NavigationGroup {
  group: string
  items: NavigationItem[]
}

export interface FigmaComponentsData {
  lastSynced: string | null
  components: FigmaComponent[]
  modules: FigmaComponent[]
  navigation: {
    components: NavigationGroup[]
    modules: NavigationGroup[]
  }
}

// ─── Figma Foundation Types ───────────────────────────────────────────────────

export interface FigmaIcon {
  id: string
  name: string
  size: number
  category: string
  svgContent: string
}

export interface FigmaTextStyle {
  id: string
  name: string
  category: string
  fontFamily: string
  fontWeight: number
  fontSize: number
  lineHeightPx: number
  letterSpacingPx: number
  textCase?: string
}

export interface FigmaEffectStyle {
  id: string
  name: string
  category: string
  cssBoxShadow: string
}

export interface FigmaIconSet {
  name: string
  icons: FigmaIcon[]
}

export interface FigmaFoundationData {
  lastSynced: string | null
  icons: FigmaIcon[]
  iconSets?: FigmaIconSet[]
  textStyles: FigmaTextStyle[]
  effectStyles: FigmaEffectStyle[]
}

// ─── Platform Settings ────────────────────────────────────────────────────────

export interface PlatformSettings {
  figmaToken?: string
  figmaFileComponents?: string
  figmaFileModules?: string
  figmaFileFoundation?: string
  figmaIconNodeId?: string
  figmaIconSetName?: string
  figmaIconNodeId2?: string
  figmaIconSetName2?: string
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export type UserRole = 'viewer' | 'editor'

export interface AuthUser {
  email: string
  password: string
  role: UserRole
}

// ─── UI Types ────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string
  href?: string
}
