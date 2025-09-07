// components/__tests__/ReviewList.test.tsx
// Test de ReviewList. Acá pruebo que el componente muestre las reseñas y reaccione a cambios.


import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
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

// Helper local para moquear TODAS las llamadas GET /api/reviews en un test
const mockGetReviews = (payload: any[]) => {
  (global.fetch as unknown as Mock).mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = (init?.method || 'GET').toUpperCase();

    if (url.includes('/api/reviews') && method === 'GET') {
      return Promise.resolve({
        ok: true,
        json: async () => payload,
      } as unknown as Response);
    }

    // PATCH /vote → OK (por si el test lo toca)
    if (url.includes('/api/reviews/vote') && method === 'PATCH') {
      return Promise.resolve({
        ok: true,
        json: async () => ({ ok: true }),
      } as unknown as Response);
    }

    // fallback
    return Promise.resolve({
      ok: true,
      json: async () => ({}),
    } as unknown as Response);
  });
};

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
      createdAt: '2023-09-01T12:00:00.000Z',
    },
    {
      _id: '2',
      user: { email: 'user2@example.com' },
      content: 'No es mi favorito.',
      votes: [],
      createdAt: '2023-09-02T12:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock por defecto de la suite:
    // - GET /api/reviews → devuelve "reviews" (con votes[])
    // - PATCH /api/reviews/vote → ok
    (global.fetch as unknown as Mock) = vi.fn().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method || 'GET').toUpperCase();

      if (url.includes('/api/reviews/vote') && method === 'PATCH') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ ok: true }),
        } as unknown as Response);
      }

      if (url.includes('/api/reviews') && method === 'GET') {
        return Promise.resolve({
          ok: true,
          json: async () => reviews,
        } as unknown as Response);
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      } as unknown as Response);
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // Si no hay reseñas, debería mostrar el mensaje de estado vacío
  // Esto es importante para UX, así el usuario sabe que puede ser el primero en reseñar.
  it('muestra el estado vacío cuando no hay reseñas', async () => {
    vi.clearAllMocks();          // Aísla este test del mock por defecto
    mockGetReviews([]);          // Fuerza [] en TODAS las llamadas GET de este test

    render(<ReviewList volumeId="v1" />);

    expect(await screen.findByText(/Sé la primera en reseñar/i)).toBeInTheDocument();
  });

  // Testeo que se cargan y muestran las reseñas iniciales correctamente
  // Verifico que se muestran los puntajes y textos de cada reseña.
  it('carga y muestra reseñas iniciales', async () => {
    vi.clearAllMocks();
    const now = new Date().toISOString();
    mockGetReviews([
      makeReview({ id: 'a', rating: 5, content: 'Excelente', createdAt: now }),
      makeReview({ id: 'b', rating: 3, content: 'Zafa',      createdAt: now }),
    ]);

    render(<ReviewList volumeId="v1" />);

    // Permite espacios/saltos en el DOM entre "Puntaje:" y "5★"
    expect(await screen.findByText(/Puntaje:\s*5★/)).toBeInTheDocument();
    expect(screen.getByText('Excelente')).toBeInTheDocument();
    expect(screen.getByText(/Puntaje:\s*3★/)).toBeInTheDocument();
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

    // userEvent ya usa act(...) internamente
    await userEvent.click(likeButtons[0]);
    await userEvent.click(dislikeButtons[1]);

    // Se llamó al endpoint de votos
    await waitFor(() => {
      expect((global.fetch as unknown as Mock)).toHaveBeenCalledWith(
        expect.stringContaining('/api/reviews/vote'),
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });
});
