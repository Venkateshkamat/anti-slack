import React from 'react';

const ManagementPanel = ({
  users,
  tasks,
  newUserName,
  setNewUserName,
  newTaskName,
  setNewTaskName,
  handleAddUser,
  handleAddTask,
  handleDeleteUser,
  handleDeleteTask
}) => {
  return (
    <div className="fade-in">
      <div className="management-grid">
        {/* Users Management */}
        <div className="card">
          <div className="card-header">
            <h2>Users Management</h2>
          </div>
          
          <form onSubmit={handleAddUser} className="form-group">
            <div className="form-row">
              <div className="form-group">
                <input
                  className="form-control"
                  type="text"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  placeholder="Enter user name"
                />
              </div>
              <div className="form-group">
                <button type="submit" className="btn btn-success">Add User</button>
              </div>
            </div>
          </form>
          
          <div>
            <h3>Current Users:</h3>
            {users.map(user => (
              <div key={user} className="list-item">
                <span className="list-item-name">{user}</span>
                <button 
                  onClick={() => handleDeleteUser(user)}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks Management */}
        <div className="card">
          <div className="card-header">
            <h2>Tasks Management</h2>
          </div>
          
          <form onSubmit={handleAddTask} className="form-group">
            <div className="form-row">
              <div className="form-group">
                <input
                  className="form-control"
                  type="text"
                  value={newTaskName}
                  onChange={e => setNewTaskName(e.target.value)}
                  placeholder="Enter task name"
                />
              </div>
              <div className="form-group">
                <button type="submit" className="btn btn-success">Add Task</button>
              </div>
            </div>
          </form>
          
          <div>
            <h3>Current Tasks:</h3>
            {tasks.map(task => (
              <div key={task} className="list-item">
                <span className="list-item-name">{task}</span>
                <button 
                  onClick={() => handleDeleteTask(task)}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementPanel; 