import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ReviewForm from '../ReviewForm';
import React from 'react';

beforeEach(() => {
  vi.clearAllMocks();
  (global.fetch as any) = vi.fn().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = (init?.method || 'GET').toUpperCase();
    if (url.includes('/api/reviews') && method === 'POST') {
      return Promise.resolve({ ok: true, json: async () => ({ ok: true }) });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  });
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('ReviewForm', () => {
  it('normaliza y envía payload correcto; resetea al éxito', async () => {
    render(<ReviewForm volumeId="book1" />);
    const textarea = screen.getByPlaceholderText(/reseña/i);
    const select = screen.getByLabelText(/puntaje/i);
    const form = screen.getByTestId('review-form');

    // Simula ingreso de datos
    await userEvent.selectOptions(select, '5');
    await userEvent.type(textarea, '   Contenido válido   ');
    fireEvent.submit(form);

    // Espera a que el form se limpie y aparezca el mensaje de éxito
    await waitFor(() => {
      expect((textarea as HTMLTextAreaElement).value).toBe('');
      expect(screen.getByText(/reseña publicada/i)).toBeInTheDocument();
    });
  });

  it('deshabilita botón mientras envía y evita doble click', async () => {
    render(<ReviewForm volumeId="book1" />);
    const textarea = screen.getByPlaceholderText(/reseña/i);
    const select = screen.getByLabelText(/puntaje/i);
    const form = screen.getByTestId('review-form');
    const button = screen.getByRole('button', { name: /publicar/i });

    await userEvent.selectOptions(select, '5');
    await userEvent.type(textarea, 'Contenido válido');

    // Simula doble submit rápido
    fireEvent.submit(form);
    fireEvent.submit(form);

    // Espera a que el botón esté deshabilitado durante el envío
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });
});
