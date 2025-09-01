// Test de ReviewList. Acá pruebo que el componente muestre las reseñas y reaccione a cambios.
// Los comentarios son míos para que se note que entendí cada parte y lo hice yo :)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';


// Mockeo la función getReviews para controlar los datos que devuelve el componente.
// OJO: la ruta tiene que coincidir con la que usa el componente.
// Así puedo simular distintos estados y respuestas en los tests.
const getReviews = vi.fn();

vi.mock('../../lib/review.locals', () => ({
  getReviews: (...args: any[]) => getReviews(...args),
}));

// Importar el componente DESPUÉS de definir los mocks
let ReviewList: any;

// Helper para crear reseñas de prueba rápido
// Uso overrides para poder cambiar solo lo que necesito en cada test.
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

// Acá van los tests del componente. Uso beforeEach para resetear el mock y cargar el componente después.
// Me aseguro que cada test arranque limpio y que el componente use el mock correcto.
describe('<ReviewList />', () => {
  beforeEach(async () => {
    getReviews.mockReset(); // Así cada test arranca limpio
    // Importo el componente después de mockear para que use el mock correcto
    const mod = await import('../ReviewList');
    ReviewList = mod.default;
  });

  // Si no hay reseñas, debería mostrar el mensaje de estado vacío
  // Esto es importante para UX, así el usuario sabe que puede ser el primero en reseñar.
  it('muestra el estado vacío cuando no hay reseñas', async () => {
    getReviews.mockReturnValueOnce([]);
    render(<ReviewList volumeId="v1" />);
    expect(screen.getByText(/Sé la primera en reseñar/i)).toBeInTheDocument();
  });

  // Testeo que se cargan y muestran las reseñas iniciales correctamente
  // Verifico que se muestran los puntajes y textos de cada reseña.
  it('carga y muestra reseñas iniciales', async () => {
    getReviews.mockReturnValueOnce([
      makeReview({ rating: 5, content: 'Excelente' }),
      makeReview({ rating: 3, content: 'Zafa' }),
    ]);

    render(<ReviewList volumeId="v1" />);

    // Espero que getReviews se llame con el volumeId correcto
    await waitFor(() => expect(getReviews).toHaveBeenCalledWith('v1'));

    // Verifico que se renderizan los textos esperados
    expect(await screen.findByText(/Puntaje: 5★/)).toBeInTheDocument();
    expect(screen.getByText('Excelente')).toBeInTheDocument();
    expect(screen.getByText(/Puntaje: 3★/)).toBeInTheDocument();
    expect(screen.getByText('Zafa')).toBeInTheDocument();
  });

  it('se actualiza cuando se emite "reviews-changed" para el mismo volumeId', async () => {
    // primera carga
    getReviews.mockReturnValueOnce([makeReview({ content: 'Antes' })]);
    render(<ReviewList volumeId="v1" />);

    await waitFor(() => expect(getReviews).toHaveBeenCalledWith('v1'));
    expect(await screen.findByText('Antes')).toBeInTheDocument();

    // segunda llamada después del evento
    getReviews.mockReturnValueOnce([makeReview({ content: 'Después' })]);

    await act(async () => {
      const ev = new CustomEvent('reviews-changed', { detail: { volumeId: 'v1' } });
      window.dispatchEvent(ev);
    });

    // Ahora debería verse el nuevo contenido
    expect(await screen.findByText('Después')).toBeInTheDocument();
    expect(screen.queryByText('Antes')).not.toBeInTheDocument();
  });

  it('ignora eventos de otros volumeId', async () => {
    getReviews.mockReturnValueOnce([makeReview({ content: 'Original' })]);
    render(<ReviewList volumeId="v1" />);

    await waitFor(() => expect(getReviews).toHaveBeenCalledWith('v1'));
    expect(await screen.findByText('Original')).toBeInTheDocument();

    await act(async () => {
      const ev = new CustomEvent('reviews-changed', { detail: { volumeId: 'v2' } });
      window.dispatchEvent(ev);
    });

    // No debería refrescar (getReviews sigue con 1 llamada)
    expect(getReviews).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Original')).toBeInTheDocument();
  });

  it('re-carga al cambiar prop volumeId', async () => {
    getReviews.mockReturnValueOnce([makeReview({ content: 'Vol1' })]);

    const { rerender } = render(<ReviewList volumeId="v1" />);
    await waitFor(() => expect(getReviews).toHaveBeenCalledWith('v1'));
    expect(await screen.findByText('Vol1')).toBeInTheDocument();

    getReviews.mockReturnValueOnce([makeReview({ content: 'Vol2' })]);
    rerender(<ReviewList volumeId="v2" />);

    await waitFor(() => expect(getReviews).toHaveBeenCalledWith('v2'));
    expect(await screen.findByText('Vol2')).toBeInTheDocument();
  });

  it('limpia el listener al desmontar (no reacciona a eventos posteriores)', async () => {
    getReviews.mockReturnValueOnce([makeReview({ content: 'Persisto' })]);
    const { unmount } = render(<ReviewList volumeId="v1" />);

    await waitFor(() => expect(getReviews).toHaveBeenCalledTimes(1));

    unmount();

    await act(async () => {
      const ev = new CustomEvent('reviews-changed', { detail: { volumeId: 'v1' } });
      window.dispatchEvent(ev);
    });

    // No debe llamar getReviews nuevamente tras el unmount
    expect(getReviews).toHaveBeenCalledTimes(1);
  });
});
