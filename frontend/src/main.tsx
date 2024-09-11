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
import HomePage from './pages/home';
import { PetraWallet } from "petra-plugin-wallet-adapter";
import {MartianWallet} from "@martianwallet/aptos-wallet-adapter"
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";

const wallets = [new PetraWallet(), new MartianWallet];

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <HomePage />
    ),
  },
  {
    path: "/upload",
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
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
      <App>
        <RouterProvider router={router}/>
      </App>
    </AptosWalletAdapterProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
