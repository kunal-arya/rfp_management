import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet, Printer } from 'lucide-react';
import { RFP, SupplierResponse } from '@/apis/types';
import {
  exportRfpToPdf,
  exportRfpListToPdf,
  exportRfpToExcel,
  exportRfpListToExcel,
  exportResponsesToPdf,
  exportResponsesToExcel,
} from '@/utils/export';

interface ExportActionsProps {
  type: 'rfp' | 'rfp-list' | 'responses';
  data: any;
  rfpTitle?: string;
  onPrint?: () => void;
}

export const ExportActions: React.FC<ExportActionsProps> = ({
  type,
  data,
  rfpTitle,
  onPrint,
}) => {
  const handleExportPdf = () => {
    if (type === 'rfp' && !Array.isArray(data)) {
      exportRfpToPdf(data as RFP);
    } else if (type === 'rfp-list' && Array.isArray(data)) {
      exportRfpListToPdf(data as RFP[]);
    } else if (type === 'responses' && Array.isArray(data)) {
      exportResponsesToPdf(data as SupplierResponse[], rfpTitle);
    }
  };

  const handleExportExcel = () => {
    if (type === 'rfp' && !Array.isArray(data)) {
      exportRfpToExcel(data as RFP);
    } else if (type === 'rfp-list' && Array.isArray(data)) {
      exportRfpListToExcel(data as RFP[]);
    } else if (type === 'responses' && Array.isArray(data)) {
      exportResponsesToExcel(data as SupplierResponse[], rfpTitle);
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      // Fallback: print the current page
      window.print();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportPdf}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
