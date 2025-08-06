import React from 'react';

const TabNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <div className="tab-navigation">
      <button
        className={`tab-button ${activeTab === 'tracker' ? 'active' : ''}`}
        onClick={() => setActiveTab('tracker')}
      >
        Duty Tracker
      </button>
      <button
        className={`tab-button ${activeTab === 'management' ? 'active' : ''}`}
        onClick={() => setActiveTab('management')}
      >
        Manage Users & Tasks
      </button>
    </div>
  );
};

export default TabNavigation; 