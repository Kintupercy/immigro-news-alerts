import { ReactNode } from 'react';

interface SecureAdminWrapperProps {
  children: ReactNode;
  requireSession?: boolean;
}

// Since this is now a public site without user authentication,
// this wrapper simply passes through the children
const SecureAdminWrapper = ({ children }: SecureAdminWrapperProps) => {
  return <>{children}</>;
};

export default SecureAdminWrapper;