export interface TemplateFile {
  path: string
  content: string
}
export declare function readTemplate(dir: string): TemplateFile[]
export declare function blockRoutes(source: string): string
export declare function withoutGallery(source: string): string
export declare function templateMarkdown(options: { intro: string; files: TemplateFile[] }): string
export interface TemplateConfig {
  slug: string
  title: string
  blockTitle: string
  description: string
  blockDescription: string
  dependencies: string[]
  transform: (file: TemplateFile) => string
}
export declare const TEMPLATES: TemplateConfig[]
export declare function buildTemplateBlock(options: {
  template: TemplateConfig
  files: TemplateFile[]
  site: string
  author: string
}): ReturnType<typeof buildDashboardBlock>
export declare function buildDashboardBlock(options: {
  files: TemplateFile[]
  site: string
  author: string
}): {
  $schema: string
  name: string
  type: string
  title: string
  description: string
  author: string
  docs: string
  dependencies: string[]
  registryDependencies?: string[]
  files: { path: string; type: string; target: string; content: string }[]
}
