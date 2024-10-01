import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Button, IconButton, Box, Modal, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import LogsIcon from '@mui/icons-material/Description';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

function CompletedJobs() {
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false); // For modal state
  const [currentJobLogs, setCurrentJobLogs] = useState(''); // Logs for the current job
  const [logsLoading, setLogsLoading] = useState(false); // Logs loading state
  const [isCopied, setIsCopied] = useState(false); // State for handling copy status

  const token = "visionx-nlOm2e3vwv_rjakw286mzg"; // Use your hardcoded token here

  useEffect(() => {
    // Fetch completed jobs from the backend
    axios.get('http://localhost:8888/api/jobs?status=completed', {
      headers: {
        Authorization: `Bearer ${token}`, // Add the Bearer token to the request
      },
    })
      .then(response => {
        setCompletedJobs(response.data); // Set the data to the state
        setLoading(false); // Set loading to false once data is fetched
      })
      .catch(error => {
        console.error('Error fetching completed jobs:', error);
        setError('Error fetching completed jobs');
        setLoading(false);
      });
  }, [token]);

  const downloadData = (jobId) => {
    // Simulate data download or implement real API call to download job data
    alert(`Data for job ${jobId} has been downloaded.`);
  };

  const handleOpenModal = (jobId) => {
    setOpenModal(true);
    setLogsLoading(true);
    setIsCopied(false); // Reset copied status when opening new modal
    axios.get(`http://localhost:8888/api/resume-logs/${jobId}?stream=false`, {
      headers: {
        Authorization: `Bearer ${token}`, // Add the Bearer token to the request
      },
    })
      .then(response => {
        console.log('Fetched job logs:', response.data);
        setCurrentJobLogs(response.data); // Set the fetched logs
        setLogsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching job logs:', error);
        setCurrentJobLogs('Error fetching logs');
        setLogsLoading(false);
      });
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentJobLogs(''); // Reset logs when modal is closed
    setIsCopied(false); // Reset copy status
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(currentJobLogs);
    setIsCopied(true); // Mark as copied
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <div>
      <h2>Completed Jobs</h2>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',  // Set to column layout for cards
          gap: '16px',  // Space between cards
        }}
      >
        {completedJobs.map((job) => (
          <Card key={job.job_id} sx={{ width: '100%' }}>  {/* Each card takes full width */}
            <CardContent>
              <Typography variant="h6" component="div">{job.job_id}</Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                {/* Column 1 */}
                <Box sx={{ flex: '1' }}>
                  <Typography color="textSecondary">Created at: {new Date(job.created_at).toLocaleString()}</Typography>
                  <Typography>GPU Type: {job.gpu_type}</Typography>
                </Box>

                {/* Column 2 */}
                <Box sx={{ flex: '1' }}>
                  <Typography>GPU Count: {job.gpu_count}</Typography>
                  <Typography>CPU Count: {job.cpu_count}</Typography>
                </Box>

                {/* Column 3 */}
                <Box sx={{ flex: '1' }}>
                  <Typography>Memory: {job.memory} GB</Typography>
                  <Typography>Disk Space: {job.disk_space} GB</Typography>
                </Box>

                {/* Column 4 */}
                <Box sx={{ flex: '1' }}>
                  <Typography>Total Cost: ${job.total_cost}</Typography>
                  <Typography>Completed at: {new Date(job.completed_at).toLocaleString()}</Typography>
                </Box>
              </Box>
            </CardContent>

            <CardContent>
              {/* Button to open logs modal */}
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => handleOpenModal(job.job_id)} 
                startIcon={<LogsIcon />}
              >
                View Logs
              </Button>
              <IconButton 
                color="primary" 
                onClick={() => downloadData(job.job_id)}
                aria-label="download"
              >
                <DownloadIcon />
              </IconButton>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Modal for viewing logs */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Job Logs
          </Typography>
          {logsLoading ? (
            <CircularProgress />
          ) : (
            <>
              <Box
                sx={{
                  maxHeight: '300px',  // Restrict the height
                  overflowY: 'auto',  // Add vertical scroll if logs exceed the height
                  backgroundColor: '#f5f5f5',  // Background color for the logs area
                  padding: '16px',  // Padding around the logs
                  marginTop: '16px',
                  borderRadius: '4px',
                }}
              >
                <Typography id="modal-modal-description" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                  {currentJobLogs || 'No logs available.'}
                </Typography>
              </Box>

              {/* Copy message and action buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                {isCopied ? (
                  <Button
                    variant="outlined"
                    disabled
                    sx={{ color: 'green', borderColor: 'green', "&.Mui-disabled": { color: 'green', borderColor: 'green' } }}
                  >
                    Copied
                  </Button>
                ) : (
                  <Button onClick={handleCopyLogs} variant="outlined" startIcon={<ContentCopyIcon />}>
                    Copy Logs
                  </Button>
                )}
                <Button onClick={handleCloseModal} variant="contained" color="secondary">
                  Close
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
}

// Modal styles
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
};

export default CompletedJobs;
