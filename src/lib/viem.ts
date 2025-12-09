import { createPublicClient, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';

//Determine which chain we are on based on environment variables
const chain = process.env.NEXT_PUBLIC_CHAIN === 'base' ? base : baseSepolia;


export const publicClient = createPublicClient({
  chain,
  transport: http(), 
  
});


export const chainId = chain.id;


export const explorerUrl = chain.blockExplorers?.default.url;