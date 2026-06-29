import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { taskAPI } from '../utils/api';
import toast from 'react-hot-toast';

const TaskContext = createContext();

const initialState = {
  tasks: [],
  stats: { todo: 0, 'in-progress': 0, completed: 0, total: 0 },
  loading: false,
  error: null,
  filters: { status: '', priority: '', search: '', sortBy: 'createdAt', order: 'desc' },
  pagination: { page: 1, totalPages: 1, total: 0 }
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload, loading: false };
    case 'SET_TASKS': return {
      ...state, tasks: action.payload.tasks,
      pagination: { page: action.payload.page, totalPages: action.payload.totalPages, total: action.payload.total },
      loading: false
    };
    case 'SET_STATS': return { ...state, stats: action.payload };
    case 'ADD_TASK': return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK': return {
      ...state,
      tasks: state.tasks.map(t => t._id === action.payload._id ? action.payload : t)
    };
    case 'DELETE_TASK': return {
      ...state,
      tasks: state.tasks.filter(t => t._id !== action.payload)
    };
    case 'SET_FILTERS': return { ...state, filters: { ...state.filters, ...action.payload } };
    default: return state;
  }
}

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchTasks = useCallback(async (params = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const mergedParams = { ...state.filters, ...params };
      const data = await taskAPI.getAll(mergedParams);
      dispatch({ type: 'SET_TASKS', payload: data });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      toast.error(err.message);
    }
  }, [state.filters]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await taskAPI.getStats();
      dispatch({ type: 'SET_STATS', payload: data });
    } catch (err) {
      console.error('Stats error:', err);
    }
  }, []);

  const createTask = useCallback(async (taskData) => {
    try {
      const task = await taskAPI.create(taskData);
      dispatch({ type: 'ADD_TASK', payload: task });
      toast.success('Task created!');
      fetchStats();
      return task;
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  }, [fetchStats]);

  const updateTask = useCallback(async (id, taskData) => {
    try {
      const task = await taskAPI.update(id, taskData);
      dispatch({ type: 'UPDATE_TASK', payload: task });
      toast.success('Task updated!');
      fetchStats();
      return task;
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  }, [fetchStats]);

  const deleteTask = useCallback(async (id) => {
    try {
      await taskAPI.delete(id);
      dispatch({ type: 'DELETE_TASK', payload: id });
      toast.success('Task deleted!');
      fetchStats();
    } catch (err) {
      toast.error(err.message);
    }
  }, [fetchStats]);

  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  return (
    <TaskContext.Provider value={{
      ...state, fetchTasks, fetchStats,
      createTask, updateTask, deleteTask, setFilters
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTaskContext = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be used within TaskProvider');
  return ctx;
};