// TokenPurchaseModal.tsx

import React, { useState, useContext } from 'react';
import { Slider, Button, Typography, useMediaQuery } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import { loadStripe } from '@stripe/stripe-js';
import { AuthContext } from "../contexts/AuthContext";

interface TokenPurchaseModalProps {
  open: boolean;
  onClose: () => void;
}

const stripePromise = loadStripe('pk_live_51NBlexCvoPTehrPBwpkaUdDKdtfk9myjOAmZ5yTVDFampl6a6ptINWJ2177a0GwdJpnFPaRMUuI8pfZdrf8VFWHg00SfPUeneh');

const TokenPurchaseModal: React.FC<TokenPurchaseModalProps> = ({ open, onClose }) => {
  const [value, setValue] = useState(500);
  const isSmallScreen = useMediaQuery('(max-width:400px)');
  const [processing, setProcessing] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const uid = currentUser?.uid;

  const handleChange = (event: any, newValue: number | number[]) => {
    setValue(newValue as number);
  };

  const handleClick = async () => {
    if(processing) return;
    setProcessing(true);
    const locationResponse = await fetch('https://ipapi.co/json/');
    const locationData = await locationResponse.json();
    const userCountry = locationData.country;
  
    let currency = 'usd';
    if (userCountry === 'US') {
      currency = 'usd';
    } else if (userCountry === 'CA') {
      currency = 'cad';
    }
  
    const response = await fetch("/create-checkout-session", { 
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount: value, currency, uid })
    });
  
    const data = await response.json();
    const sessionId = data.id;
    const stripe = await stripePromise;
  
    if (stripe === null) {
      console.log('Stripe failed to initialize');
      setProcessing(false);
      return;
    }
  
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });
  
    if (error) {
      console.log('Error:', error);
    }
    setProcessing(false);
  };
  
  

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ style: { borderRadius: 15 } }}>
      <Box sx={{
        paddingX: 2,
        paddingY: 4,
        width: isSmallScreen ? 230 : 300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 8,
        overflowX: 'hidden'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 300 }}>
          Purchase Tokens
        </Typography>
        <Slider
          value={value}
          onChange={handleChange}
          aria-labelledby="discrete-slider"
          valueLabelDisplay="auto"
          step={500}
          marks
          min={500}
          max={10000}
          sx={{ 
            width: '90%',
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
        <Typography variant="subtitle1" sx={{ fontWeight: 300 }}>
          {`${value} Tokens`}
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 300 }}>
          {`💲${value / 500}.00`}
        </Typography>
        <Button 
          variant="contained" 
          sx={{ marginTop: 2, fontWeight: 300, backgroundColor: '#2cb2a5', ':hover': { backgroundColor: '#279f94' } }}
          onClick={handleClick}
        >
          {processing ? "Redirecting..." : "Purchase"}
        </Button>
      </Box>
    </Dialog>
  );
};

export default TokenPurchaseModal;
