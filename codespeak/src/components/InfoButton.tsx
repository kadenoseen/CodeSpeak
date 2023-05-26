import React from 'react';
import HelpIcon from '@mui/icons-material/Help';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import styles from '../css/InfoButton.module.css';

const theme = createTheme({
  typography: {
    fontFamily: "'Roboto', sans-serif",
  },
});

const InfoButton: React.FC = () => {

    const [showPopup, setShowPopup] = React.useState(false);

    return (
        <ThemeProvider theme={theme}>
          <button
            className={styles.infoButton} 
            onClick={() => setShowPopup(!showPopup)}
          >
            <HelpIcon fontSize="large" color="disabled"/>
          </button>

          <Dialog onClose={() => setShowPopup(false)} open={showPopup} sx={{ '.MuiPaper-root': { borderRadius: '15px' } } }>
            <DialogTitle sx={{ textAlign: 'center', mt: 1, mb: -1,  overflow: "none" }}>⚙️ Modes</DialogTitle>
            <TableContainer sx={{ width: 300, margin: '0 auto'}}>
              <Table sx={{ marginBottom: 4}}>
                <TableHead>
                  <TableRow sx={{marginBottom:-1}}>
                    <TableCell sx={{ paddingBottom: '8px' }}></TableCell>
                    <TableCell sx={{ paddingBottom: '8px' }}>Powerful</TableCell>
                    <TableCell sx={{ paddingBottom: '8px' }}>Fast</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow >
                    <TableCell sx={{ paddingLeft: '28px' }}>Quality</TableCell>
                    <TableCell >💥💥💥</TableCell>
                    <TableCell >💥</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ paddingLeft: '28px' }}>Speed</TableCell>
                    <TableCell >⚡️</TableCell>
                    <TableCell >⚡️⚡️⚡️</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ paddingLeft: '28px' }}>Cost</TableCell>
                    <TableCell >💰💰💰</TableCell>
                    <TableCell >💰</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Dialog>
        </ThemeProvider>
      );
};

export default InfoButton;
