// URL base del backend 
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const PRODUCTOS_LOCALES = [
  {
    id: 1001,
    nombre: 'Monstera Deliciosa',
    precio: 24990,
    precioOriginal: 19990,
    estado: 'oferta',
    stock: 10,
    img: '/assets/images/monstera2.jpg',
    descripcion: 'Planta tropical de hojas perforadas',
    descuento: 20,
  },
  {
    id: 1002,
    nombre: 'Sansevieria Trifasciata',
    precio: 15725,
    stock: 15,
    img: '/assets/images/sansevieria-trifasciata.jpg',
    descripcion: 'Lengua de tigre - Purificadora de aire',
    descuento: 0,
  },
  {
    id: 1003,
    nombre: 'Poto Dorado',
    precio: 13590,
    precioOriginal: 13590,
    estado: 'oferta',
    stock: 5,
    img: '/assets/images/Poto-dorado.jpg',
    descripcion: 'Planta colgante de fácil cuidado',
    descuento: 0,
  },
  {
    id: 1004,
    nombre: 'Alocasia Polly',
    precio: 32500,
    precioOriginal: 22750,
    estado: 'oferta',
    stock: 8,
    img: '/assets/images/alocasia-polly.jpg',
    descripcion: 'Planta ornamental de hojas grandes',
    descuento: 30,
  },
  {
    id: 1005,
    nombre: 'Schlumbergera Truncata',
    precio: 21990,
    stock: 0,
    img: '/assets/images/schlumbergera-truncata.jpg',
    descripcion: 'Una planta muy apreciada por su belleza',
    descuento: 0,
  },
  {
    id: 1006,
    nombre: 'Ficus Lyrata',
    precio: 28990,
    stock: 12,
    img: '/assets/images/ficuslyrata.jpg',
    descuento: 0,
  },
  {
    id: 1007,
    nombre: 'Areca Palm',
    precio: 33990,
    stock: 0,
    img: '/assets/images/arecapalm.JPG',
    descripcion: 'Palmera purificadora que da un toque tropical al hogar',
    descuento: 0,
  },
  {
    id: 1008,
    nombre: 'Calathea Orbifolia',
    precio: 27500,
    stock: 7,
    img: '/assets/images/calathea-orbifolia.jpg',
    descripcion: 'Planta de hojas anchas y patrón elegante, necesita humedad',
    descuento: 0,
  },
  {
    id: 1009,
    nombre: 'Helecho Boston',
    precio: 16990,
    precioOriginal: 12740,
    estado: 'oferta',
    stock: 0,
    img: '/assets/images/helecho-boston.jpg',
    descripcion: 'Helecho frondoso ideal para mejorar la calidad del aire',
    descuento: 25,
  },
  {
    id: 1010,
    nombre: 'Hoya Carnosa',
    precio: 18990,
    stock: 3,
    img: '/assets/images/hoya-carnosa.jpg',
    descripcion: 'Planta colgante resistente con hojas cerosas y flores aromáticas',
    descuento: 0,
  },
  {
    id: 1011,
    nombre: 'Bambú de la Suerte',
    precio: 12990,
    stock: 20,
    img: '/assets/images/bambu.jpg',
    descripcion: 'Planta de interior que atrae la buena suerte',
    descuento: 0,
  },
];

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const readJsonResponse = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const crearProducto = async (productoData) => {
  try {
    if (!productoData.nombre || !productoData.precio || productoData.stock === undefined) {
      throw new Error('Datos del producto incompletos');
    }

    const headers = getAuthHeaders();
    const response = await fetch(`${BASE_URL}/productos/crear`, {
      method: 'POST',
      headers,
      body: JSON.stringify(productoData),
    });

    if (!response.ok) {
      const errorData = await readJsonResponse(response);
      throw new Error(errorData?.error || errorData?.message || 'Error al crear el producto');
    }

    return await response.json();
  } catch (error) {
    console.warn('No se pudo crear el producto en backend, usando modo local:', error.message);
    return { ...productoData, id: Date.now() };
  }
};


export const listarProductos = async () => {
  try {
    const response = await fetch(`${BASE_URL}/productos/listar`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await readJsonResponse(response);
      throw new Error(errorData?.error || errorData?.message || 'Error al listar productos');
    }

    return await response.json();
  } catch (error) {
    console.warn('Usando productos locales por fallback:', error.message);
    return PRODUCTOS_LOCALES.map((producto) => ({ ...producto }));
  }
};


export const obtenerProductoPorId = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/productos/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await readJsonResponse(response);
      throw new Error(errorData?.error || errorData?.message || 'Producto no encontrado');
    }

    return await response.json();
  } catch (error) {
    console.warn('Usando producto local por fallback:', error.message);
    return PRODUCTOS_LOCALES.find((producto) => producto.id === Number(id)) || null;
  }
};


export const actualizarProducto = async (id, productoData) => {
  try {
    const response = await fetch(`${BASE_URL}/productos/editar/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productoData),
    });

    if (!response.ok) {
      const errorData = await readJsonResponse(response);
      throw new Error(errorData?.error || errorData?.message || 'Error al actualizar el producto');
    }

    return await response.json();
  } catch (error) {
    console.warn('No se pudo actualizar el producto en backend, usando modo local:', error.message);
    return { id: Number(id), ...productoData };
  }
};


export const eliminarProducto = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/productos/eliminar/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await readJsonResponse(response);
      throw new Error(errorData?.error || errorData?.message || 'Error al eliminar producto');
    }

    return await response.json();
  } catch (error) {
    console.warn('No se pudo eliminar el producto en backend, usando modo local:', error.message);
    return { ok: true, message: 'Producto eliminado localmente' };
  }
};
