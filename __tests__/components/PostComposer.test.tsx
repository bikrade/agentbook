import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostComposer } from '@/components/posts/PostComposer';

describe('PostComposer Component', () => {
  const defaultProps = {
    authorAvatar: null,
    authorHandle: 'test-agent',
    onSubmit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders textarea with placeholder', () => {
    render(<PostComposer {...defaultProps} />);
    expect(screen.getByPlaceholderText("What's on your mind?")).toBeInTheDocument();
  });

  it('renders custom placeholder', () => {
    render(<PostComposer {...defaultProps} placeholder="Share your thoughts..." />);
    expect(screen.getByPlaceholderText('Share your thoughts...')).toBeInTheDocument();
  });

  it('renders Post button', () => {
    render(<PostComposer {...defaultProps} />);
    expect(screen.getByRole('button', { name: /post/i })).toBeInTheDocument();
  });

  it('disables Post button when content is empty', () => {
    render(<PostComposer {...defaultProps} />);
    expect(screen.getByRole('button', { name: /post/i })).toBeDisabled();
  });

  it('enables Post button when content is entered', async () => {
    const user = userEvent.setup();
    render(<PostComposer {...defaultProps} />);
    
    await user.type(screen.getByRole('textbox'), 'Hello world');
    
    expect(screen.getByRole('button', { name: /post/i })).toBeEnabled();
  });

  it('shows character count', async () => {
    const user = userEvent.setup();
    render(<PostComposer {...defaultProps} />);
    
    await user.type(screen.getByRole('textbox'), 'Hello');
    
    // 2000 - 5 = 1995
    expect(screen.getByText('1995')).toBeInTheDocument();
  });

  it('shows warning color when near limit', async () => {
    const user = userEvent.setup();
    render(<PostComposer {...defaultProps} />);
    
    // Type 1950 characters
    const longText = 'a'.repeat(1950);
    await user.type(screen.getByRole('textbox'), longText);
    
    const charCount = screen.getByText('50');
    expect(charCount).toHaveClass('text-yellow-500');
  });

  it('shows error color when over limit', async () => {
    const user = userEvent.setup();
    render(<PostComposer {...defaultProps} />);
    
    // Type 2001 characters
    const longText = 'a'.repeat(2001);
    await user.type(screen.getByRole('textbox'), longText);
    
    const charCount = screen.getByText('-1');
    expect(charCount).toHaveClass('text-red-500');
  });

  it('disables Post button when over character limit', async () => {
    const user = userEvent.setup();
    render(<PostComposer {...defaultProps} />);
    
    const longText = 'a'.repeat(2001);
    await user.type(screen.getByRole('textbox'), longText);
    
    expect(screen.getByRole('button', { name: /post/i })).toBeDisabled();
  });

  it('calls onSubmit with content when Post is clicked', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<PostComposer {...defaultProps} onSubmit={onSubmit} />);
    
    await user.type(screen.getByRole('textbox'), 'Test post');
    await user.click(screen.getByRole('button', { name: /post/i }));
    
    expect(onSubmit).toHaveBeenCalledWith('Test post');
  });

  it('clears content after successful submission', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<PostComposer {...defaultProps} onSubmit={onSubmit} />);
    
    await user.type(screen.getByRole('textbox'), 'Test post');
    await user.click(screen.getByRole('button', { name: /post/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('textbox')).toHaveValue('');
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    let resolveSubmit: () => void;
    const onSubmit = jest.fn().mockImplementation(() => new Promise(r => { resolveSubmit = r; }));
    render(<PostComposer {...defaultProps} onSubmit={onSubmit} />);
    
    await user.type(screen.getByRole('textbox'), 'Test post');
    await user.click(screen.getByRole('button', { name: /post/i }));
    
    expect(screen.getByRole('button', { name: /posting/i })).toBeInTheDocument();
    
    resolveSubmit!();
  });
});
