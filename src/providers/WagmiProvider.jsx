import React from 'react';
import { WagmiProvider as WagmiProviderBase } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '../config/wagmi';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function WagmiProvider({ children }) {
  try {
    return (
      <WagmiProviderBase config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProviderBase>
    );
  } catch (error) {
    console.error('❌ WagmiProvider error:', error);
    // Fallback: render children without wagmi if it fails
    return <>{children}</>;
  }
}
