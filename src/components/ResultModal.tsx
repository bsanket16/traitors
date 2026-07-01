import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import type { RoundResult } from '../../shared/types';
import { ResultCallout } from './ResultCallout';

export function ResultModal({ result, open, onClose }: { result: RoundResult | null; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open && Boolean(result)} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Round Result</DialogTitle>
      <DialogContent>
        <ResultCallout result={result} />
      </DialogContent>
      <DialogActions className="dialog-actions">
        <Button className="action-button" variant="contained" onClick={onClose}>Continue</Button>
      </DialogActions>
    </Dialog>
  );
}
