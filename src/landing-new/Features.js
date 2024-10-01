import React, { useState } from 'react';
import { Tabs, Tab, Typography, Box } from '@mui/material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Typography sx={{ color: 'white', textAlign: 'center' }}>
            {children}
          </Typography>
        </Box>
      )}
    </div>
  );
}

export default function Features() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Tabs for navigation */}
      <Tabs value={value} onChange={handleChange} centered aria-label="Landing Page Feature Tabs">
        <Tab label="GPU Flexibility" />
        <Tab label="Zero Infrastructure" />
        <Tab label="Real-Time Monitoring" />
        <Tab label="Secure Data Handling" />
      </Tabs>

      {/* TabPanel for GPU Flexibility */}
      <TabPanel value={value} index={0} sx>
        Choose from a wide array of GPU types, including options unavailable on other major cloud platforms.
        Our service ensures you have access to the right GPU for your project needs, saving you time and
        ensuring top performance. We offer exclusive options that provide you with a competitive edge.
      </TabPanel>

      {/* TabPanel for Zero Infrastructure Management */}
      <TabPanel value={value} index={1}>
        Focus on your code while we manage everything from resource allocation to remote build processes.
        No need to worry about handling technical infrastructure. This service is fully cost-effective—you
        only pay for what you use—allowing you to concentrate entirely on your project.
      </TabPanel>

      {/* TabPanel for Real-Time Monitoring */}
      <TabPanel value={value} index={2}>
        Stay informed about your job’s progress with live logging and tracking. Ensure your projects run smoothly
        with instant feedback, so you can adjust as needed and maintain full control of your process with real-time insights.
      </TabPanel>

      {/* TabPanel for Secure Data Handling */}
      <TabPanel value={value} index={3}>
        We prioritize your data’s security. All data is encrypted and securely stored, ensuring compliance with
        privacy regulations and giving you the peace of mind that your data is safe and protected.
      </TabPanel>
    </Box>
  );
}
