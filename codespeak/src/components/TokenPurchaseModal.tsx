// TokenPurchaseModal.tsx

import React, { useState } from 'react';
import { Slider, Button, Typography, useMediaQuery } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';

interface TokenPurchaseModalProps {
  open: boolean;
  onClose: () => void;
}

const TokenPurchaseModal: React.FC<TokenPurchaseModalProps> = ({ open, onClose }) => {
  const [value, setValue] = useState(100);
  const isSmallScreen = useMediaQuery('(max-width:400px)');  // This will be true if the screen width is 400px or less

  const handleChange = (event: any, newValue: number | number[]) => {
    setValue(newValue as number);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <Box sx={{ 
        padding: 2, 
        width: isSmallScreen ? 230 : 300, // Use the isSmallScreen variable to determine the width
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowX: 'hidden'
      }}>
        <Typography variant="h6">
          Purchase Tokens
        </Typography>
        <Slider
          value={value}
          onChange={handleChange}
          aria-labelledby="discrete-slider"
          valueLabelDisplay="auto"
          step={100}
          marks
          min={100}
          max={2000}
          sx={{ 
            width: '90%', // Adjust as needed
            color: '#2cb2a5',
            '& .MuiSlider-track': {
              height: '8px',
            },
            '& .MuiSlider-thumb': {
              height: '24px',
              width: '24px',
              backgroundColor: '#2cb2a5',
            },
          }}
        />
        <Typography variant="subtitle1">
          {`${value} Tokens`}
        </Typography>
        <Typography variant="subtitle1">
          {`Price: $${value / 100}`}
        </Typography>
        <Button 
          variant="contained" 
          sx={{ marginTop: 2, backgroundColor: '#2cb2a5', ':hover': { backgroundColor: '#279f94' } }}
          onClick={onClose}
        >
          Purchase
        </Button>
      </Box>
    </Dialog>
  );
};

export default TokenPurchaseModal;
