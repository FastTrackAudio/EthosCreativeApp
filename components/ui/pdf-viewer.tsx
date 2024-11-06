"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface PDFViewerProps {
  url: string;
  fileName: string;
}

export function PDFViewer({ url, fileName }: PDFViewerProps) {
  const pdfUrl = `${url}#pagemode=none`;

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="w-full bg-muted rounded-lg p-4 mb-4">
        <iframe
          src={pdfUrl}
          className="w-full min-h-[800px] rounded-lg border bg-white"
          title={fileName}
        />
      </div>
      <div className="flex justify-end w-full">
        <Button variant="outline" size="sm" asChild>
          <a href={url} download={fileName} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </a>
        </Button>
      </div>
    </div>
  );
}