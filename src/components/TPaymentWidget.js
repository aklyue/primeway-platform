import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Alert } from '@mui/material';

const TPaymentWidget = ({ 
  amount,
  onSuccess,
  onError,
  email = 'customer@example.com',
  phone = '+79991234567',
  description = 'Payment for services'
}) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Initializing Tinkoff Payment Widget');
    console.log('TerminalKey:', process.env.REACT_APP_TINKOFF_TERMINAL_KEY);
    console.log('Company Email:', process.env.REACT_APP_COMPANY_EMAIL);
    
    const script = document.createElement('script');
    script.src = 'https://securepay.tinkoff.ru/html/payForm/js/tinkoff_v2.js';
    script.async = true;
    script.onload = () => {
      console.log('Tinkoff script loaded successfully');
      setIsScriptLoaded(true);
    };
    script.onerror = (e) => {
      console.error('Failed to load Tinkoff script:', e);
      setError('Failed to load payment form');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    try {
      const terminalKey = process.env.REACT_APP_TINKOFF_TERMINAL_KEY;
      const companyEmail = process.env.REACT_APP_COMPANY_EMAIL;

      console.log('TerminalKey:', terminalKey);
      console.log('Company Email:', companyEmail);

      if (!terminalKey || terminalKey.length === 0) {
          throw new Error('TerminalKey is missing.');
      }

      if (terminalKey.length > 64) {
          throw new Error('TerminalKey exceeds 64 characters.');
      }

      if (!companyEmail || companyEmail.length === 0) {
          throw new Error('Company Email is missing.');
      }

      // Generate orderId locally for now
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Generated Order ID:', orderId);

      const amountInKopeks = Math.round(amount * 100);
      console.log('Amount in Kopeks:', amountInKopeks);
      if (amountInKopeks < 100) {
        throw new Error('Сумма должна быть не менее 1 рубля (100 копеек).');
      }
    
      const paymentData = {
        terminalkey: terminalKey,        
        frame: false,                   
        language: 'ru',                  
        amount: amountInKopeks,         
        order: orderId,                 
        description: description,           
        email: email,          
        phone: phone,         
        DATA: `EmailCompany=${companyEmail}|Taxation=osn|Items=[{"Name":"${description}","Price":${amountInKopeks},"Quantity":1,"Amount":${amountInKopeks},"Tax":"none","PaymentMethod":"full_prepayment","PaymentObject":"service","MeasurementUnit":"pc"}]`

      };

      console.log('Payment Data:', paymentData);

      // Check if the global pay function is available
      if (typeof window.pay !== 'function') {
        throw new Error('Tinkoff payment system not initialized properly');
      }

      // Set up payment callbacks
      window.onSuccess = function(data) {
        console.log('Payment Success Callback:', data);
        onSuccess?.(orderId);
      };

      window.onError = function(error) {
        console.error('Payment Error Callback:', error);
        setError('Payment failed: ' + (error.message || 'Unknown error'));
        onError?.(error);
      };

      // Initiate payment
      window.pay(paymentData);

    } catch (err) {
      console.error('Payment Submission Error:', err);
      setError(err.message);
      onError?.(err);
    }
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper>
      <Box sx={{ p: 2 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <div>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Amount</Typography>
              <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                {amount} ₽
              </Box>
            </div>
            
            {email && (
              <div>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Email</Typography>
                <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                  {email}
                </Box>
              </div>
            )}
          </Box>

          <button 
            type="submit"
            disabled={!isScriptLoaded}
            style={{
              width: '100%',
              backgroundColor: !isScriptLoaded ? '#ffd97666' : '#ffd976',
              color: '#1a1a1a',
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              cursor: isScriptLoaded ? 'pointer' : 'default',
              opacity: !isScriptLoaded ? 0.5 : 1,
            }}
          >
            {isScriptLoaded ? 'Pay' : 'Loading...'}
          </button>
        </form>
      </Box>
    </Paper>
  );
};

export default TPaymentWidget;
