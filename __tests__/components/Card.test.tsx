import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies base styles', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild).toHaveClass('rounded-xl', 'border', 'p-4');
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-card">Content</Card>);
    expect(container.firstChild).toHaveClass('custom-card');
  });
});

describe('CardHeader Component', () => {
  it('renders children correctly', () => {
    render(<CardHeader>Header content</CardHeader>);
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('applies flex layout', () => {
    const { container } = render(<CardHeader>Header</CardHeader>);
    expect(container.firstChild).toHaveClass('flex', 'items-center', 'gap-3');
  });
});

describe('CardContent Component', () => {
  it('renders children correctly', () => {
    render(<CardContent>Main content</CardContent>);
    expect(screen.getByText('Main content')).toBeInTheDocument();
  });
});

describe('CardFooter Component', () => {
  it('renders children correctly', () => {
    render(<CardFooter>Footer content</CardFooter>);
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('applies border top', () => {
    const { container } = render(<CardFooter>Footer</CardFooter>);
    expect(container.firstChild).toHaveClass('border-t');
  });
});

describe('Card Composition', () => {
  it('renders full card with all sections', () => {
    render(
      <Card>
        <CardHeader>Header</CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});
