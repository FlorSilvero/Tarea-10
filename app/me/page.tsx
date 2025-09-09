"use client";
import { useEffect, useState } from 'react';

export default function PerfilUsuario() {
  const [data, setData] = useState<{ name: string; email: string; reviews: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPerfil() {
      setLoading(true);
      try {
        const res = await fetch('/api/reviews/me');
        const json = await res.json();
        console.log('[PerfilUsuario] Datos recibidos:', json);
        if (!res.ok) throw new Error(json.error || 'Error');
        // Si la respuesta tiene 'items', es la paginada, no la de perfil
        if ('items' in json) {
          setData({ name: '', email: '', reviews: [] });
        } else {
          setData(json);
        }
      } catch (e: any) {
        setError(e?.message || 'Error al cargar perfil');
      } finally {
        setLoading(false);
      }
    }
    fetchPerfil();
  }, []);

  if (loading) return <p>Cargando perfil...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!data) return <p>No hay datos de usuario.</p>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-2">Perfil de usuario</h2>
      <div className="mb-4">
        <div><b>Nombre:</b> {data.name || <span className="text-gray-400">(vacío)</span>}</div>
        <div><b>Correo:</b> {data.email || <span className="text-gray-400">(vacío)</span>}</div>
      </div>
      <h3 className="text-lg font-semibold mb-2">Reseñas escritas</h3>
      <ul className="space-y-3">
        {(!data.reviews || data.reviews.length === 0) && <li>No escribiste ninguna reseña.</li>}
        {(data.reviews || []).map(r => (
          <li key={r._id} className="border rounded p-3">
            <div className="text-xs text-gray-500 mb-1">Título: <b>{r.bookTitle ? r.bookTitle : (r.book ? r.book : r.volumeId)}</b></div>
            <div>Puntaje: {r.rating}★</div>
            <div>{r.text}</div>
            <div className="text-xs text-gray-400 mt-1">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</div>
          </li>
        ))}
      </ul>
      {/* Eliminado el bloque de datos crudos para mostrar solo la UI del perfil */}
    </div>
  );
}
