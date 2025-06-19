import React from 'react'
import ConfigureModelForm from '../ConfigureModelForm'
import { Box, Typography } from '@mui/material'

function ModelCreate({ isMobile, isCreate }) {
  return (
    <Box style={{ border: "1px solid lightgray", borderRadius: isMobile? "10px" : "30px", overflow: "hidden", maxHeight: "74dvh" }}>
      <Box sx={{
        px: 3,
        py: 2,
        borderBottom: "1px solid lightgray",
        backgroundColor: "rgba(102, 179, 238, 0.1)"
      }}>
        <Typography variant='h7'>
          СОЗДАНИЕ НОВОЙ МОДЕЛИ
        </Typography>
      </Box>
      <ConfigureModelForm isCreate={isCreate} />
    </Box>
  )
}

export default ModelCreate