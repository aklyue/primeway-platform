import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useOrganization } from './OrganizationContext';
import { AuthContext } from '../../AuthContext';  // or wherever your auth context is
import {
  getOrgMembers,
  addOrgMember,
  removeOrgMember
} from '../../api.js';

const OrganizationSettings = () => {
  const { currentOrganization, isCurrentOrgOwner } = useOrganization();
  const { user } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  // Fetch members whenever currentOrganization changes
  useEffect(() => {
    if (currentOrganization) {
      fetchMembers();
    }
  }, [currentOrganization]);

  // Call API to get members for the selected organization
  const fetchMembers = async () => {
    try {
      const response = await getOrgMembers(currentOrganization.id);
      setMembers(response.data); // Ensure your API returns a list of members
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  // Add a new member by email
  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;
    if (!isCurrentOrgOwner()) {
      alert('Only owners can add members.');
      return;
    }
    try {
      await addOrgMember(currentOrganization.id, newMemberEmail.trim());
      setNewMemberEmail('');
      fetchMembers(); // Refresh members list
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  // Remove a member by email
  const handleRemoveMember = async (email) => {
    if (!isCurrentOrgOwner()) {
      alert('Only owners can remove members.');
      return;
    }
    try {
      await removeOrgMember(currentOrganization.id, email);
      fetchMembers(); // Refresh members list
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  if (!currentOrganization) {
    return <Typography>No organization selected.</Typography>;
  }
  console.log("members", members)
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Organization Settings
      </Typography>

      {/* Only show Add Member form if user is the org owner */}
      {isCurrentOrgOwner() && (
        <Box sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
          <TextField
            label="New Member Email"
            variant="outlined"
            size="small"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            sx={{ mr: 2 }}
          />
          <Button variant="contained" onClick={handleAddMember}>
            Add Member
          </Button>
        </Box>
      )}

      <List sx={{ maxWidth: 400 }}>
        {members.map((member) => (
          <ListItem key={member.id}>
            <ListItemText primary={member.email} />
            {/* Only show the delete icon if:
                 1) The current user is an owner
                 2) The member is NOT the current user
             */}
            {isCurrentOrgOwner() && member.user_id !== user.id && member.role !== 'owner' && (
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleRemoveMember(member.email)}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default OrganizationSettings;
