import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  body: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmationDialog({ open, title, body, onCancel, onConfirm }: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">{body}</Typography>
      </DialogContent>
      <DialogActions className="dialog-actions">
        <Button className="action-button" onClick={onCancel}>Cancel</Button>
        <Button className="action-button" variant="contained" onClick={onConfirm}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
}
