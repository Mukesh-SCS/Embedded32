import React, { useEffect } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BusLoadIndicator from '../src/components/BusLoadIndicator';
import { DashboardProvider, useDashboard } from '../src/hooks/useDashboardState';

function SeedStats({ busLoad, framesPerSec }: { busLoad: number; framesPerSec: number }) {
  const { dispatch } = useDashboard();
  useEffect(() => {
    dispatch({ type: 'UPDATE_BUS_STATS', stats: { busLoad, framesPerSec } });
  }, [dispatch, busLoad, framesPerSec]);
  return null;
}

describe('BusLoadIndicator', () => {
  it('renders bus load percentage from dashboard state', () => {
    render(
      <DashboardProvider>
        <SeedStats busLoad={62.3} framesPerSec={25} />
        <BusLoadIndicator />
      </DashboardProvider>
    );

    expect(screen.getByText('62.3%')).toBeTruthy();
    expect(screen.getByText('25')).toBeTruthy();
  });

  it('shows warning styling above 50% load', () => {
    const { container } = render(
      <DashboardProvider>
        <SeedStats busLoad={75} framesPerSec={10} />
        <BusLoadIndicator />
      </DashboardProvider>
    );

    expect(screen.getByText('75.0%')).toBeTruthy();
    const bar = container.querySelector('div[style*="width: 75%"]');
    expect(bar).toBeTruthy();
  });
});
