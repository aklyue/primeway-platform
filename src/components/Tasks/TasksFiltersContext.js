// src/components/Tasks/TasksFiltersContext.js

import React, { createContext, useState } from 'react';

export const TasksFiltersContext = createContext();

export const TasksFiltersProvider = ({ children }) => {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("deploy");
  const [isScheduledFilter, setIsScheduledFilter] = useState(false);

  return (
    <TasksFiltersContext.Provider
      value={{
        selectedStatus,
        setSelectedStatus,
        selectedJobType,
        setSelectedJobType,
        isScheduledFilter,
        setIsScheduledFilter,
      }}
    >
      {children}
    </TasksFiltersContext.Provider>
  );
};