"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useConfirmationDialogStore } from "./page.stores";
import { AlertTriangle } from "lucide-react";

export function ConfirmationDialog() {
  const { isOpen, type, title, message, banReason, onConfirm, closeDialog, setBanReason } = useConfirmationDialogStore();

  const handleConfirm = () => {
    onConfirm?.();
    closeDialog();
  };

  const isBanAction = type === 'ban' || type === 'bulkBan';
  const isBanReasonRequired = isBanAction && (!banReason || banReason.trim().length === 0);

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {message}
          </DialogDescription>
        </DialogHeader>

        {isBanAction && (
          <div className="space-y-2">
            <label htmlFor="banReason" className="text-sm font-medium">
              Ban Reason {isBanAction && '*'}
            </label>
            <Textarea
              id="banReason"
              placeholder="Enter reason for banning..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              rows={3}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isBanReasonRequired}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}