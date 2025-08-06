import React, { useState } from 'react';
import './App.css';

// Import components
import TabNavigation from './components/TabNavigation';
import DutyTracker from './components/DutyTracker';
import ManagementPanel from './components/ManagementPanel';

// Import custom hook
import { useDutyData } from './hooks/useDutyData';

function App() {
  const [activeTab, setActiveTab] = useState('tracker');
  
  // Use custom hook for all data management
  const dutyData = useDutyData();

  return (
    <div className="container">
      <div className="app-header">
        <h1>Roommate Duties Tracker</h1>
      </div>

      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'tracker' ? (
        <DutyTracker {...dutyData} />
      ) : (
        <ManagementPanel {...dutyData} />
      )}
    </div>
  );
}

export default App;
