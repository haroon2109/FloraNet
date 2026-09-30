/**
 * Minimal ambient declaration for `html2pdf.js` (ships without types).
 * Only the builder API FloraNet uses is described.
 */
declare module "html2pdf.js" {
  interface Html2PdfBuilder {
    set(options: Record<string, unknown>): Html2PdfBuilder;
    from(element: HTMLElement | string): Html2PdfBuilder;
    save(): Promise<void>;
    toPdf(): Html2PdfBuilder;
    outputPdf(type?: "save" | "blob" | "datauristring" | string): Promise<unknown>;
  }
  function html2pdf(): Html2PdfBuilder;
  export default html2pdf;
}
