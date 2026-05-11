import Scaffold from '@/components/Scaffold';
import { LagoonVaultProvider } from '@/context/lagoon-vault-context';
import PoolVaultChrome from '@/components/pool/PoolVaultChrome';

export default function PoolLayout({ children }: { children: React.ReactNode }) {
  return (
    <Scaffold>
      <LagoonVaultProvider>
        <PoolVaultChrome>{children}</PoolVaultChrome>
      </LagoonVaultProvider>
    </Scaffold>
  );
}
