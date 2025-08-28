import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, FileDown, Archive, Send } from 'lucide-react';
import { formatBulkOperationMessage, validateBulkOperation } from '@/utils/export';

interface BulkOperationsProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onBulkAction: (action: string, ids: string[]) => void;
  totalItems: number;
  availableActions: Array<{
    value: string;
    label: string;
    icon: React.ReactNode;
    variant?: 'default' | 'destructive';
  }>;
}

export const BulkOperations: React.FC<BulkOperationsProps> = ({
  selectedIds,
  onSelectionChange,
  onBulkAction,
  totalItems,
  availableActions,
}) => {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // This would need to be passed from parent component with all available IDs
      // For now, we'll just clear selection
      onSelectionChange([]);
    } else {
      onSelectionChange([]);
    }
  };

  const handleBulkAction = () => {
    if (!validateBulkOperation(selectedIds, selectedAction)) {
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmBulkAction = () => {
    onBulkAction(selectedAction, selectedIds);
    setShowConfirmDialog(false);
    setSelectedAction('');
    onSelectionChange([]);
  };

  const selectedCount = selectedIds.length;
  const isAllSelected = selectedCount === totalItems && totalItems > 0;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalItems;

  return (
    <>
      <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={isAllSelected}
            ref={(el) => {
              if (el) (el as any).indeterminate = isIndeterminate;
            }}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm font-medium">
            {selectedCount > 0 
              ? `${selectedCount} item${selectedCount > 1 ? 's' : ''} selected`
              : 'Select all'
            }
          </span>
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2 flex-1">
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Choose action..." />
              </SelectTrigger>
              <SelectContent>
                {availableActions.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    <div className="flex items-center gap-2">
                      {action.icon}
                      {action.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleBulkAction}
              disabled={!selectedAction}
              variant={
                availableActions.find(a => a.value === selectedAction)?.variant || 'default'
              }
            >
              Apply to {selectedCount} item{selectedCount > 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
            <AlertDialogDescription>
              {formatBulkOperationMessage(selectedCount, selectedAction)}
              {selectedAction === 'delete' && (
                <span className="block mt-2 text-destructive font-medium">
                  This action cannot be undone.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkAction}
              className={
                selectedAction === 'delete' 
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// Default bulk actions for different contexts
export const getRfpBulkActions = () => [
  {
    value: 'publish',
    label: 'Publish',
    icon: <Send className="h-4 w-4" />,
  },
  {
    value: 'archive',
    label: 'Archive',
    icon: <Archive className="h-4 w-4" />,
  },
  {
    value: 'export',
    label: 'Export',
    icon: <FileDown className="h-4 w-4" />,
  },
  {
    value: 'delete',
    label: 'Delete',
    icon: <Trash2 className="h-4 w-4" />,
    variant: 'destructive' as const,
  },
];

export const getResponseBulkActions = () => [
  {
    value: 'export',
    label: 'Export',
    icon: <FileDown className="h-4 w-4" />,
  },
  {
    value: 'archive',
    label: 'Archive',
    icon: <Archive className="h-4 w-4" />,
  },
];
