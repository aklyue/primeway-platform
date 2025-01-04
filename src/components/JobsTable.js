// JobsTable.jsx
import React from 'react';
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

function JobsTable({ data, columns, actions }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [menuJobId, setMenuJobId] = React.useState(null);

  const handleMenuClick = (event, jobId) => {
    setAnchorEl(event.currentTarget);
    setMenuJobId(jobId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuJobId(null);
  };

  return (
    <TableContainer component={Paper}>
      <Table aria-label="jobs table">
        <TableHead sx={{ '& .MuiTableCell-root': { color: 'black' } }}>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.field || column.id}>{column.label}</TableCell>
            ))}
            {actions && actions.length > 0 && <TableCell>Действия</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody
          sx={{
            '& .MuiTableCell-root': { color: '#6e6e80', textAlign: 'center' },
          }}
        >
          {data.map((job) => (
            <TableRow key={job.job_id}>
              {columns.map((column) => {
                const value = job[column.field];
                return (
                  <TableCell key={column.field || column.id}>
                    {column.render ? column.render(value, job) : value}
                  </TableCell>
                );
              })}
              {actions && actions.length > 0 && (
                <TableCell>
                  <IconButton
                    onClick={(event) => handleMenuClick(event, job.job_id)}
                    aria-controls={menuJobId === job.job_id ? 'action-menu' : undefined}
                    aria-haspopup="true"
                  >
                    <MoreVertIcon />
                  </IconButton>
                  {/* Меню действий */}
                  <Menu
                    id="action-menu"
                    anchorEl={anchorEl}
                    open={menuJobId === job.job_id}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    {actions.map((action, index) => (
                      <MenuItem
                        key={index}
                        onClick={() => {
                          handleMenuClose();
                          action.onClick(job);
                        }}
                      >
                        <ListItemIcon>{action.icon}</ListItemIcon>
                        <ListItemText>{action.label}</ListItemText>
                      </MenuItem>
                    ))}
                  </Menu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default JobsTable;