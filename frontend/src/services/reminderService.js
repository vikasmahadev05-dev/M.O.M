import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

export const createReminder = async (data, token) => {
  const res = await axios.post(`${API_URL}/reminders`, data, getHeaders(token));
  return res.data;
};

export const getRemindersByEvent = async (eventId, token) => {
  const res = await axios.get(`${API_URL}/reminders/event/${eventId}`, getHeaders(token));
  return res.data;
};

export const deleteReminder = async (id, token) => {
  const res = await axios.delete(`${API_URL}/reminders/${id}`, getHeaders(token));
  return res.data;
};

export const snoozeReminder = async (id, minutes, token) => {
  const res = await axios.post(`${API_URL}/reminders/${id}/snooze`, { minutes }, getHeaders(token));
  return res.data;
};

export const triggerReminder = async (id, token) => {
  // Note: Trigger might be called by QStash without a user token, 
  // but from frontend we should send it if available.
  const res = await axios.post(`${API_URL}/reminders/trigger/${id}`, {}, token ? getHeaders(token) : {});
  return res.data;
};

export const dismissReminder = async (id, token) => {
  const res = await axios.post(`${API_URL}/reminders/${id}/dismiss`, {}, getHeaders(token));
  return res.data;
};
