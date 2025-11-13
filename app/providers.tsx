'use client';
import React from 'react';
import { AuthProvider } from '../shared/AuthProvider';

export default function Providers({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: any | null;
}) {
  return <AuthProvider initialUser={initialUser}>{children}</AuthProvider>;
}
