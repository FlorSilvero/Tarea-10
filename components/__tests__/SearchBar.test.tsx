// components/__tests__/SearchBar.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ---- MOCKS (antes de importar el componente) ----
const push = vi.fn();
let currentQuery = '';

function setSearchParam(value: string) {
  currentQuery = value;
}

vi.mock('next/navigation', () => {
  return {
    useRouter: () => ({ push }),
    useSearchParams: () => ({
      get: (k: string) => (k === 'q' ? (currentQuery || null) : null),
    }),
  };
});

// Para importar el componente DESPUÉS de los mocks
let SearchBar: any;

describe('<SearchBar />', () => {
  beforeEach(async () => {
    push.mockClear();
    setSearchParam('');
    // importa el componente con los mocks ya activos
  const mod = await import('../SearchBar'); // o import('../../SearchBar')
    SearchBar = mod.default;
  });

  it('renderiza el input y el botón de búsqueda', () => {
    render(<SearchBar />);
    expect(screen.getByPlaceholderText('Título, autor o ISBN')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buscar/i })).toBeInTheDocument();
  });

  it('llama a onSearch con el texto ingresado (trimeado) y NO navega', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByPlaceholderText('Título, autor o ISBN');

    await user.type(input, '   dune   ');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(onSearch).toHaveBeenCalledWith('dune');
    expect(push).not.toHaveBeenCalled();
  });

  it('sin onSearch: navega a /search?q=… con encodeURIComponent', async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    const input = screen.getByPlaceholderText('Título, autor o ISBN');
    await user.type(input, 'Cien años de soledad');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(push).toHaveBeenCalledWith('/search?q=Cien%20a%C3%B1os%20de%20soledad');
  });

  it('sin onSearch y query vacío: navega a /search (sin q)', async () => {
    const user = userEvent.setup();
    render(<SearchBar />);
    await user.click(screen.getByRole('button', { name: /buscar/i }));
    expect(push).toHaveBeenCalledWith('/search');
  });

  it('usa estado inicial desde ?q=…', async () => {
    setSearchParam('Harry%20Potter'); // mockeamos la URL
  const mod = await import('../SearchBar');
    const SB = mod.default;
    render(<SB />);
    const input = screen.getByPlaceholderText('Título, autor o ISBN') as HTMLInputElement;
    expect(input.value).toBe('Harry%20Potter'); // refleja lo que retorna useSearchParams.get
  });
});

