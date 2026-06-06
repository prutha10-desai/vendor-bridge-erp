import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm',
  message,
  confirmLabel = 'Confirm',
  variant = 'primary',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm leading-relaxed text-muted">{message}</p>
      <div className="mt-6 flex gap-3 justify-end">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant={variant === 'danger' ? 'primary' : variant}
          onClick={onConfirm}
          loading={loading}
          className={variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : ''}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
