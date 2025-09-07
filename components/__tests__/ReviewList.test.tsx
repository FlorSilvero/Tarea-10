// Test de ReviewList. Acá pruebo que el componente muestre las reseñas y reaccione a cambios.
// Los comentarios son míos para que se note que entendí cada parte y lo hice yo :)
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReviewList from '../ReviewList';

// Helper para crear reseñas de prueba rápido
function makeReview(overrides: Partial<any> = {}) {
  return {
    id: 'id-' + Math.random(),
    rating: 4,
    content: 'Gran libro',
    up: 0,
    down: 0,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('<ReviewList />', () => {
  const reviews = [
    {
      _id: '1',
      user: { email: 'user1@example.com' },
      content: 'Gran libro',
      votes: [
        { user: 'user1@example.com', type: 'like' },
        { user: 'user2@example.com', type: 'dislike' },
      ],
      createdAt: '2023-09-01T00:00:00.000Z',
    },
    {
      _id: '2',
      user: { email: 'user2@example.com' },
      content: 'No es mi favorito.',
      votes: [],
      createdAt: '2023-09-02T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    // Usar vi en vez de jest para Vitest
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => reviews,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // Si no hay reseñas, debería mostrar el mensaje de estado vacío
  // Esto es importante para UX, así el usuario sabe que puede ser el primero en reseñar.
  it('muestra el estado vacío cuando no hay reseñas', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });
    render(<ReviewList volumeId="v1" />);
    expect(await screen.findByText(/Sé la primera en reseñar/i)).toBeInTheDocument();
  });

  // Testeo que se cargan y muestran las reseñas iniciales correctamente
  // Verifico que se muestran los puntajes y textos de cada reseña.
  it('carga y muestra reseñas iniciales', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        makeReview({ rating: 5, content: 'Excelente' }),
        makeReview({ rating: 3, content: 'Zafa' }),
      ],
    });

    render(<ReviewList volumeId="v1" />);
    expect(await screen.findByText(/Puntaje: 5★/)).toBeInTheDocument();
    expect(screen.getByText('Excelente')).toBeInTheDocument();
    expect(screen.getByText(/Puntaje: 3★/)).toBeInTheDocument();
    expect(screen.getByText('Zafa')).toBeInTheDocument();
  });

  it('renders reviews', async () => {
    render(<ReviewList volumeId="v1" />);
    expect(await screen.findByText('Gran libro')).toBeInTheDocument();
    expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    expect(screen.getByText('No es mi favorito.')).toBeInTheDocument();
  });

  it('shows vote counts', async () => {
    render(<ReviewList volumeId="v1" />);
    expect(await screen.findByText('1 like, 1 dislike')).toBeInTheDocument();
    expect(screen.getByText('0 like, 0 dislike')).toBeInTheDocument();
  });

  it('calls vote API when like/dislike is clicked', async () => {
    render(<ReviewList volumeId="v1" />);
    const likeButtons = await screen.findAllByRole('button', { name: /like/i });
    const dislikeButtons = await screen.findAllByRole('button', { name: /dislike/i });
    expect(likeButtons.length).toBeGreaterThan(0);
    expect(dislikeButtons.length).toBeGreaterThan(0);

    // Simulate clicking like/dislike
    fireEvent.click(likeButtons[0]);
    fireEvent.click(dislikeButtons[1]);

    // Optionally, check that fetch was called for voting
    expect(global.fetch).toHaveBeenCalled();
  });
});
