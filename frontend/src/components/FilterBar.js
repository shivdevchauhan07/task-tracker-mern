import React from 'react';
import { useTaskContext } from '../context/TaskContext';

export default function FilterBar() {
  const { filters, setFilters, fetchTasks } = useTaskContext();

  const handleChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);
    fetchTasks(updated);
  };

  const clearFilters = () => {
    const reset = { status: '', priority: '', search: '', sortBy: 'createdAt', order: 'desc' };
    setFilters(reset);
    fetchTasks(reset);
  };

  const hasFilters = filters.status || filters.priority || filters.search;

  return (
    <div className="filter-bar">
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          name="search"
          value={filters.search}
          onChange={handleChange}
          placeholder="Search tasks..."
          className="search-input"
        />
      </div>
      <select name="status" value={filters.status} onChange={handleChange} className="filter-select">
        <option value="">All Status</option>
        <option value="todo">To Do</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <select name="priority" value={filters.priority} onChange={handleChange} className="filter-select">
        <option value="">All Priority</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <select name="sortBy" value={filters.sortBy} onChange={handleChange} className="filter-select">
        <option value="createdAt">Newest</option>
        <option value="dueDate">Due Date</option>
        <option value="priority">Priority</option>
        <option value="title">Title</option>
      </select>
      {hasFilters && (
        <button className="clear-filters" onClick={clearFilters}>✕ Clear</button>
      )}
    </div>
  );
}