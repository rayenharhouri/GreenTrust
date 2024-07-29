import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from "antd";
import UploadPage from './pages/upload';
import FilePage from './pages/file';
import './main.css'

import {
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient()


const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <UploadPage />
    ),
  },

  {
    path: "/files/:uuid",
    element: (
      <FilePage />
    ),
  },
]);
 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App>
        <RouterProvider router={router}/>
      </App>
    </QueryClientProvider>
  </React.StrictMode>,
)
