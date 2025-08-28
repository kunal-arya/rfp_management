import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, mockRfp } from '@/test/utils';
import { ExportActions } from '../ExportActions';

// Mock the export utilities
vi.mock('@/utils/export', () => ({
  exportRfpToPdf: vi.fn(),
  exportRfpListToPdf: vi.fn(),
  exportRfpToExcel: vi.fn(),
  exportRfpListToExcel: vi.fn(),
  exportResponsesToPdf: vi.fn(),
  exportResponsesToExcel: vi.fn(),
}));

describe('ExportActions', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render export dropdown', () => {
    render(
      <ExportActions
        type="rfp"
        data={mockRfp as any}
      />
    );

    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  it('should show export options when clicked', async () => {
    render(
      <ExportActions
        type="rfp"
        data={mockRfp as any}
      />
    );

    const exportButton = screen.getByRole('button', { name: /export/i });
    await user.click(exportButton);

    expect(screen.getByText(/export as pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/export as excel/i)).toBeInTheDocument();
  });

  it('should show print option when onPrint is provided', async () => {
    const mockPrint = vi.fn();
    
    render(
      <ExportActions
        type="rfp"
        data={mockRfp as any}
        onPrint={mockPrint}
      />
    );

    const exportButton = screen.getByRole('button', { name: /export/i });
    await user.click(exportButton);

    expect(screen.getByText(/print/i)).toBeInTheDocument();
  });

  it('should not show print option when onPrint is not provided', async () => {
    render(
      <ExportActions
        type="rfp"
        data={mockRfp as any}
      />
    );

    const exportButton = screen.getByRole('button', { name: /export/i });
    await user.click(exportButton);

    expect(screen.queryByText(/print/i)).not.toBeInTheDocument();
  });

  it('should call onPrint when print option is clicked', async () => {
    const mockPrint = vi.fn();
    
    render(
      <ExportActions
        type="rfp"
        data={mockRfp as any}
        onPrint={mockPrint}
      />
    );

    const exportButton = screen.getByRole('button', { name: /export/i });
    await user.click(exportButton);

    const printOption = screen.getByText(/print/i);
    await user.click(printOption);

    expect(mockPrint).toHaveBeenCalledOnce();
  });
});
