import { Dialog, DialogContent, Stack, Typography, IconButton, Avatar } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const BlurredModal = ({ open, onClose, children }) => (
  <Dialog
    open={open}
    onClose={onClose}
    fullWidth
    maxWidth="sm"
    PaperProps={{
      sx: {
        borderRadius: 3,
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(255, 255, 255, 0.85)",
      },
    }}
    BackdropProps={{
      sx: {
        backdropFilter: "blur(6px)",
        backgroundColor: "rgba(0,0,0,0.3)",
      },
    }}
  >
    <DialogContent sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="flex-end">
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </Stack>
      {children}
    </DialogContent>
  </Dialog>
);
export default BlurredModal;
