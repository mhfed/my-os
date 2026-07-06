import { render, screen } from '@testing-library/react-native';
import { StatTile } from '../StatTile';

describe('StatTile', () => {
  it('renders label and value', () => {
    render(
      <StatTile icon='star' accent='#ff0000' label='Tasks Done' value={42} />,
    );

    expect(screen.getByText('Tasks Done')).toBeTruthy();
    expect(screen.getByText('42')).toBeTruthy();
  });
});
