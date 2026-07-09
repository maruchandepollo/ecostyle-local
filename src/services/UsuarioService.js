import { encryptPassword } from '../utils/encryptionUtils.js';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const LOCAL_USERS_KEY = 'ecostyle_local_users';
let localUsersMemory = [];

const defaultUsers = () => [
  {
    email: 'admin@ecostyle.com',
    password: 'admin123',
    nombre: 'Admin',
    rut: '00000000-0',
    tipo: 'ADMIN',
  },
];

const getLocalUsers = () => {
  try {
    const storedUsers = localStorage.getItem(LOCAL_USERS_KEY);

    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      if (Array.isArray(parsedUsers)) {
        localUsersMemory = parsedUsers;
      }
    }
  } catch (error) {
    console.warn('No se pudieron leer los usuarios locales:', error);
  }

  if (localUsersMemory.length === 0) {
    localUsersMemory = defaultUsers();
  }

  return [
    ...defaultUsers().filter((user) => user.email?.toLowerCase() !== 'admin@ecostyle.com'),
    ...localUsersMemory.filter((user) => user.email?.toLowerCase() !== 'admin@ecostyle.com'),
    ...defaultUsers().filter((user) => user.email?.toLowerCase() === 'admin@ecostyle.com'),
  ];
};

const saveLocalUsers = (users) => {
  localUsersMemory = users;
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.warn('No se pudo guardar usuarios locales:', error);
  }
};

const readJsonResponse = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const normalizeEmail = (email) => (email || '').trim().toLowerCase();

export const registrarUsuario = async (usuarioData) => {
  try {
    const passwordEncriptada = encryptPassword(usuarioData.pass);

    const datosMapeados = {
      nombre: usuarioData.name,
      email: usuarioData.email,
      password: passwordEncriptada,
      rut: usuarioData.rut,
    };

    const response = await fetch(`${BASE_URL}/usuarios/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datosMapeados),
    });

    if (!response.ok) {
      const errorData = await readJsonResponse(response);
      throw new Error(errorData?.error || errorData?.message || 'Error al registrar usuario');
    }

    const usuario = await response.json();

    if (usuario.token) {
      localStorage.setItem('token', usuario.token);
    }

    return usuario;
  } catch (error) {
    console.warn('Backend no disponible, registrando usuario en modo local:', error.message);

    const users = getLocalUsers();
    const normalizedEmail = normalizeEmail(usuarioData.email);

    if (users.some((user) => normalizeEmail(user.email) === normalizedEmail)) {
      throw new Error('El email ya está registrado');
    }

    const nuevoUsuario = {
      email: normalizedEmail,
      password: usuarioData.pass,
      nombre: usuarioData.name,
      rut: usuarioData.rut,
      tipo: 'USER',
    };

    saveLocalUsers([...users, nuevoUsuario]);
    localStorage.setItem('token', 'local-token');
    localStorage.setItem('usuarioActual', JSON.stringify({ ...nuevoUsuario, token: 'local-token' }));

    return { ...nuevoUsuario, token: 'local-token' };
  }
};

export const loginUsuario = async (email, password) => {
  try {
    let passwordFinal = password;

    if (normalizeEmail(email) !== 'admin@ecostyle.com') {
      passwordFinal = encryptPassword(password);
    }

    const credentials = {
      email,
      password: passwordFinal,
    };

    const response = await fetch(`${BASE_URL}/usuarios/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await readJsonResponse(response);
      throw new Error(errorData?.error || errorData?.message || 'Email o contraseña incorrectos');
    }

    const usuario = await response.json();

    if (usuario.token) {
      localStorage.setItem('token', usuario.token);
      localStorage.setItem('usuarioActual', JSON.stringify(usuario));
    }

    return usuario;
  } catch (error) {
    console.warn('Backend no disponible, usando autenticación local:', error.message);

    const users = getLocalUsers();
    const normalizedEmail = normalizeEmail(email);
    const usuarioLocal = users.find((user) => normalizeEmail(user.email) === normalizedEmail && user.password === password);

    if (!usuarioLocal) {
      throw new Error('Email o contraseña incorrectos');
    }

    const usuario = {
      email: usuarioLocal.email,
      nombre: usuarioLocal.nombre || usuarioLocal.name,
      tipo: usuarioLocal.tipo || 'USER',
      rut: usuarioLocal.rut,
      token: 'local-token',
    };

    localStorage.setItem('token', usuario.token);
    localStorage.setItem('usuarioActual', JSON.stringify(usuario));

    return usuario;
  }
};

export const listarUsuarios = async () => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${BASE_URL}/usuarios/listar`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token || ''}`,
      },
    });

    if (!response.ok) {
      const errorData = await readJsonResponse(response);
      throw new Error(errorData?.error || errorData?.message || 'Error al listar usuarios');
    }

    return await response.json();
  } catch (error) {
    console.warn('Usando usuarios locales por fallback:', error.message);
    return getLocalUsers();
  }
};

export const obtenerUsuarioPorEmail = async (email) => {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });

    if (!response.ok) {
      const errorData = await readJsonResponse(response);
      throw new Error(errorData?.error || errorData?.message || 'Usuario no encontrado');
    }

    return await response.json();
  } catch (error) {
    console.warn('Usando usuario local por fallback:', error.message);
    return getLocalUsers().find((user) => normalizeEmail(user.email) === normalizeEmail(email)) || null;
  }
};

export const actualizarUsuario = async (email, usuarioData) => {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/editar/${email}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
      body: JSON.stringify(usuarioData),
    });

    if (!response.ok) {
      const errorData = await readJsonResponse(response);
      throw new Error(errorData?.error || errorData?.message || 'Error al actualizar usuario');
    }

    const usuarioActualizado = await response.json();
    localStorage.setItem('usuarioActual', JSON.stringify(usuarioActualizado));

    return usuarioActualizado;
  } catch (error) {
    console.warn('No se pudo actualizar el usuario en backend, usando modo local:', error.message);
    const users = getLocalUsers();
    const updatedUsers = users.map((user) => (normalizeEmail(user.email) === normalizeEmail(email) ? { ...user, ...usuarioData } : user));
    saveLocalUsers(updatedUsers);
    const usuarioActualizado = updatedUsers.find((user) => normalizeEmail(user.email) === normalizeEmail(email));
    localStorage.setItem('usuarioActual', JSON.stringify(usuarioActualizado));
    return usuarioActualizado;
  }
};

export const eliminarUsuario = async (email) => {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/eliminar/${email}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });

    if (!response.ok) {
      const errorData = await readJsonResponse(response);
      throw new Error(errorData?.error || errorData?.message || 'Error al eliminar usuario');
    }

    localStorage.removeItem('token');
    localStorage.removeItem('usuarioActual');

    return await response.json();
  } catch (error) {
    console.warn('No se pudo eliminar el usuario en backend, usando modo local:', error.message);
    const users = getLocalUsers().filter((user) => normalizeEmail(user.email) !== normalizeEmail(email));
    saveLocalUsers(users);
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioActual');
    return { ok: true, message: 'Usuario eliminado localmente' };
  }
};

export const logoutUsuario = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuarioActual');
};

export const obtenerUsuarioActual = () => {
  const usuarioJSON = localStorage.getItem('usuarioActual');
  return usuarioJSON ? JSON.parse(usuarioJSON) : null;
};

export const tieneTokenValido = () => {
  return !!localStorage.getItem('token');
};
