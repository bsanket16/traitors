import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { FormEvent, useState } from 'react';

export function FeedbackDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const close = () => {
    if (sending) return;
    setError('');
    setSent(false);
    onClose();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    setError('');
    try {
      const response = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, contact, message }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Could not send feedback.');
      setSent(true);
      setName('');
      setContact('');
      setMessage('');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not send feedback.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="xs">
      <DialogTitle>Send Feedback</DialogTitle>
      <DialogContent>
        {sent ? <Typography color="text.secondary">Thank you — your feedback has been sent.</Typography> : (
          <Stack component="form" id="feedback-form" gap={1.5} mt={0.5} onSubmit={submit}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Name" value={name} onChange={(event) => setName(event.target.value)} required autoFocus />
            <TextField label="Email or phone (optional)" value={contact} onChange={(event) => setContact(event.target.value)} />
            <TextField label="Message" value={message} onChange={(event) => setMessage(event.target.value)} required multiline minRows={4} />
          </Stack>
        )}
      </DialogContent>
      <DialogActions className="dialog-actions feedback-dialog-actions">
        {sent ? <Button className="action-button" variant="contained" onClick={close}>Close</Button> : <Button className="action-button" type="submit" variant="contained" form="feedback-form" disabled={sending || !name.trim() || !message.trim()}>{sending ? 'Sending…' : 'Send Feedback'}</Button>}
        {!sent && <Button className="action-button" onClick={close} disabled={sending}>Cancel</Button>}
      </DialogActions>
    </Dialog>
  );
}
