import React from 'react'
import ModelCreate from '../../components/ModelCreate'
import { useLocation } from 'react-router-dom';
import BackArrow from '../../UI/BackArrow';
import { Box } from '@mui/material';

function ModelCreatePage({ isMobile }) {
    const location = useLocation()
    const { isCreate } = location.state || {};
    return (
        <div>
            <BackArrow path={"/models"} name={"Models"} />
            <ModelCreate isMobile={isMobile} isCreate={isCreate} />
        </div>
    )
}

export default ModelCreatePage