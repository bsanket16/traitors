import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import type { RoundResult } from '../../shared/types';

export function ResultModal({ result, open, onClose }: { result: RoundResult | null; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open && Boolean(result)} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Round Result</DialogTitle>
      <DialogContent>
        <Typography>{result?.message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>Continue</Button>
      </DialogActions>
    </Dialog>
  );
}
