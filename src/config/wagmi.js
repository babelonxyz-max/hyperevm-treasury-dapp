import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { defineChain } from 'viem';

// HyperEVM chain configuration
export const hyperevm = defineChain({
  id: 999,
  name: 'HyperEVM',
  nativeCurrency: {
    name: 'HYPE',
    symbol: 'HYPE',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyperliquid.xyz/evm'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HyperEVM Explorer',
      url: 'https://explorer.hyperliquid-testnet.xyz',
    },
  },
});

// Wagmi configuration
export const wagmiConfig = createConfig({
  chains: [hyperevm],
  connectors: [
    injected(),
    // Rabby (and most browser wallets) are detected via the injected connector
  ],
  transports: {
    [hyperevm.id]: http('https://rpc.hyperliquid.xyz/evm'),
  },
  ssr: false, // Vite SPA: keep SSR disabled
});
