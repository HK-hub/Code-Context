declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[]
    filename?: string
    image?: {
      type?: string
      quality?: number
    }
    html2canvas?: {
      scale?: number
      useCORS?: boolean
      logging?: boolean
      letterRendering?: boolean
    }
    jsPDF?: {
      unit?: string
      format?: string | number[]
      orientation?: string
    }
    pagebreak?: {
      mode?: string | string[]
      before?: string | string[]
      after?: string | string[]
      avoid?: string | string[]
    }
  }

  interface Html2Pdf {
    set(options: Html2PdfOptions): Html2Pdf
    from(element: HTMLElement | string): Html2Pdf
    save(): Promise<void>
    toPdf(): Html2Pdf
    get(): Promise<Blob>
    outputPdf(type?: string): Promise<string | Blob>
    then(callback: (pdf: unknown) => void): Html2Pdf
  }

  function html2pdf(): Html2Pdf
  export default html2pdf
}

declare module 'markdown-it' {
  interface MarkdownItOptions {
    html?: boolean
    xhtmlOut?: boolean
    breaks?: boolean
    langPrefix?: string
    linkify?: boolean
    typographer?: boolean
    quotes?: string
    highlight?: (str: string, lang: string) => string
  }

  interface MarkdownIt {
    render(src: string, env?: unknown): string
    parse(src: string, env?: unknown): unknown[]
    parseInline(src: string, env?: unknown): unknown[]
    renderInline(src: string, env?: unknown): string
    set(options: MarkdownItOptions): MarkdownIt
    configure(presets: string): MarkdownIt
    enable(list: string | string[], strict?: boolean): MarkdownIt
    disable(list: string | string[], strict?: boolean): MarkdownIt
    use(plugin: unknown, ...params: unknown[]): MarkdownIt
  }

  interface MarkdownItConstructor {
    new (options?: MarkdownItOptions): MarkdownIt
    (options?: MarkdownItOptions): MarkdownIt
  }

  const MarkdownIt: MarkdownItConstructor
  export default MarkdownIt
}