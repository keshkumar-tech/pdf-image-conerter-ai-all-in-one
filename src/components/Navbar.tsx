import React from 'react';
import { TopNav } from './TopNav';

interface NavbarProps {
  hasActiveNotes: boolean;
  activeVideoTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  hasActiveNotes,
  activeVideoTitle,
}) => {
  return <TopNav />;
};
