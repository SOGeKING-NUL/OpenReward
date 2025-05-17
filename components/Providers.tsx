"use client";

import { FC, PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CivicAuthProvider } from "@civic/auth-web3/nextjs";
import { baseSepolia, sepolia, mainnet } from "viem/chains"; //does not suport base mainnet yet so will have to add it manually
import { Chain, http } from "viem";
import { createConfig, WagmiProvider } from "wagmi";
import { embeddedWallet } from "@civic/auth-web3/wagmi";

const queryClient = new QueryClient();

export const supportedChains = [sepolia] as [
  Chain,
  ...Chain[],
];

const wagmiConfig = createConfig({
  chains: supportedChains,
  transports: {
    [sepolia.id]: http(),
  },
  connectors: [embeddedWallet()],
  ssr: true,
});

type ProvidersProps = PropsWithChildren<{
  onSessionEnd?: () => void;
}>;

export const Providers: FC<ProvidersProps> = ({ children }) => {
  return (
      <QueryClientProvider client={queryClient}>
            <WagmiProvider config={wagmiConfig}>
              {/* The need for initialChain here will be removed in an upcoming version of @civic/auth-web3 */}
              <CivicAuthProvider initialChain={sepolia}>
                {children}
              </CivicAuthProvider>
            </WagmiProvider>
      </QueryClientProvider>
  );
};
