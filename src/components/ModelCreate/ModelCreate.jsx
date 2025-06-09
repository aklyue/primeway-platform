import React from 'react'
import ConfigureModelForm from '../ConfigureModelForm'

function ModelCreate({ isMobile, isCreate }) {
  return (
    <div style={{ border: "1px solid lightgray", borderRadius: isMobile? "10px" : "30px", overflow: "hidden" }}>
      <ConfigureModelForm isCreate={isCreate} />
    </div>
  )
}

export default ModelCreate