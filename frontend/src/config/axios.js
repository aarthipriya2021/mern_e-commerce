import axios from 'axios'

// console.log("BASE_URL:", process.env.REACT_APP_BASE_URL); // <- Add this to debug

export const axiosi = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  withCredentials: true,
})