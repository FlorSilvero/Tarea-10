import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mocks por defecto (para la suite STRICT)
vi.mock('../../lib/review.locals', () => ({
  createReview: vi.fn(),
}));
import * as reviews from '../../lib/review.locals';
import ReviewForm from '../ReviewForm';
type VMock = Mock;

const deferred = <T,>() => {
  let resolve!: (v: T) => void;
  let reject!: (e?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe('ReviewForm', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // ----------------- [BÁSICO] -----------------
  describe('[BÁSICO]', () => {
    it('persiste en localStorage y limpia el textarea cuando es válido', async () => {
      // Re-ejecutamos el test con módulos REALES (sin mocks)
      vi.resetModules();
      vi.doUnmock('../../lib/review.locals');
      vi.doUnmock('../ReviewForm');

      const Real = await import('../../lib/review.locals');
      const { default: RealForm } = await import('../ReviewForm');

      render(<RealForm volumeId="book1" />);

      await userEvent.type(
        screen.getByPlaceholderText(/escribí tu reseña/i),
        'Contenido válido'
      );
      await userEvent.selectOptions(screen.getByLabelText(/puntaje/i), '5');
      fireEvent.submit(screen.getByTestId('review-form'));

      const textarea = screen.getByPlaceholderText(/escribí tu reseña/i) as HTMLTextAreaElement;
      await waitFor(() => {
        expect(textarea.value).toBe('');
      });

      const saved = Real.getReviews('book1');
      expect(saved).toHaveLength(1);
      expect(saved[0].content).toBe('Contenido válido');
      expect(saved[0].rating).toBe(5);
    });

    it('muestra error si el contenido es muy corto', async () => {
      // Volvemos a un entorno con mocks para el resto de la suite
      vi.resetModules();
      vi.mock('../../lib/review.locals', () => ({ createReview: vi.fn() }));
      const { default: FormAgain } = await import('../ReviewForm');

      render(<FormAgain volumeId="book1" />);
      await userEvent.type(screen.getByPlaceholderText(/escribí tu reseña/i), 'hey');
      fireEvent.submit(screen.getByTestId('review-form'));
      expect(await screen.findByText(/al menos 5 caracteres/i)).toBeInTheDocument();
    });
  });

  // ----------------- [STRICT] -----------------
  describe('[STRICT]', () => {
    it('valida rating requerido (sin default)', async () => {
      render(<ReviewForm volumeId="book1" />);
      await userEvent.type(screen.getByPlaceholderText(/escribí tu reseña/i), 'texto válido');
      fireEvent.submit(screen.getByTestId('review-form'));
      expect(
        await screen.findByText('Seleccioná un puntaje y escribí al menos 5 caracteres.')
      ).toBeInTheDocument();
    });

    it('normaliza y envía payload correcto; resetea al éxito', async () => {
      const mockCreate = reviews.createReview as unknown as VMock;
      mockCreate.mockResolvedValueOnce({ ok: true });

      render(<ReviewForm volumeId="book1" />);

      await userEvent.type(
        screen.getByPlaceholderText(/escribí tu reseña/i),
        '   Contenido válido   '
      );
      await userEvent.selectOptions(screen.getByLabelText(/puntaje/i), '5');
      fireEvent.submit(screen.getByTestId('review-form'));

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith('book1', {
          rating: 5,
          content: '   Contenido válido   ',
        });
      });

      const textarea = screen.getByPlaceholderText(/escribí tu reseña/i) as HTMLTextAreaElement;
      await waitFor(() => expect(textarea.value).toBe(''));
    });

    it('deshabilita botón mientras envía y evita doble click', async () => {
      const d = deferred<void>();
      const mockCreate = reviews.createReview as unknown as VMock;
      mockCreate.mockReturnValueOnce(d.promise);

      render(<ReviewForm volumeId="book1" />);

      await userEvent.type(screen.getByPlaceholderText(/escribí tu reseña/i), 'Contenido válido');
      await userEvent.selectOptions(screen.getByLabelText(/puntaje/i), '5');

      const button = screen.getByRole('button', { name: /publicar reseña/i });
      expect(button).not.toBeDisabled();

      fireEvent.submit(screen.getByTestId('review-form'));
      await waitFor(() => expect(button).toBeDisabled());

      fireEvent.submit(screen.getByTestId('review-form'));
      expect(mockCreate).toHaveBeenCalledTimes(1);

      d.resolve();
      await waitFor(() => expect(button).not.toBeDisabled());
    });

    it('muestra error si createReview rechaza', async () => {
      const mockCreate = reviews.createReview as unknown as VMock;
      mockCreate.mockRejectedValueOnce(new Error('network'));

      render(<ReviewForm volumeId="book1" />);

      await userEvent.type(screen.getByPlaceholderText(/escribí tu reseña/i), 'Contenido válido');
      await userEvent.selectOptions(screen.getByLabelText(/puntaje/i), '5');
      fireEvent.submit(screen.getByTestId('review-form'));

      expect(
        await screen.findByText(/Ocurrió un error al publicar/i)
      ).toBeInTheDocument();
    });
  });
});
