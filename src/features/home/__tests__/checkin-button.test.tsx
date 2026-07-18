/// <reference types="vitest/globals" />
import React from 'react';
import { render } from '@testing-library/react-native';
import { CheckInPanel } from '@/features/home/components/CheckInPanel';
import { ThemeProvider } from '@/providers/ThemeProvider';

// Minimal theme provider wrapper so useTheme() resolves light tokens.
function renderWithLight(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('CheckInPanel Save check-in button (light theme)', () => {
  it('renders the button with a visible (non-transparent) brand background when a mood is selected', async () => {
    const { getByLabelText } = await renderWithLight(
      <CheckInPanel
        visible={true}
        selectedMood={5}
        onSelectMood={() => {}}
        reflectionNote=""
        onReflectionChange={() => {}}
        reflectionInputRef={{ current: null }}
        isSaving={false}
        onSubmit={() => {}}
        onDismiss={() => {}}
      />
    );
    const btn = getByLabelText('Save check-in');
    const style = (btn.props.style as any[]).flat().reduce((acc, s) => ({ ...acc, ...s }), {});
    console.log('SAVE_CHECKIN_STYLE', JSON.stringify(style));
    expect(style.backgroundColor).toBeTruthy();
    expect(style.backgroundColor).not.toBe('transparent');
    expect(style.backgroundColor).not.toBe(undefined);
  });
});
