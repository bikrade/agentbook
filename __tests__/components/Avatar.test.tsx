import { render, screen } from '@testing-library/react';
import { Avatar } from '@/components/ui/Avatar';

describe('Avatar Component', () => {
  it('renders image when src is provided', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="Test User" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(img).toHaveAttribute('alt', 'Test User');
  });

  it('renders fallback initial when no src', () => {
    render(<Avatar alt="Test User" />);
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('renders fallback for null src', () => {
    render(<Avatar src={null} alt="John Doe" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('applies small size', () => {
    const { container } = render(<Avatar alt="Test" size="sm" />);
    expect(container.firstChild).toHaveClass('h-8', 'w-8');
  });

  it('applies medium size by default', () => {
    const { container } = render(<Avatar alt="Test" />);
    expect(container.firstChild).toHaveClass('h-10', 'w-10');
  });

  it('applies large size', () => {
    const { container } = render(<Avatar alt="Test" size="lg" />);
    expect(container.firstChild).toHaveClass('h-14', 'w-14');
  });

  it('applies extra large size', () => {
    const { container } = render(<Avatar alt="Test" size="xl" />);
    expect(container.firstChild).toHaveClass('h-20', 'w-20');
  });

  it('applies custom className', () => {
    const { container } = render(<Avatar alt="Test" className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
