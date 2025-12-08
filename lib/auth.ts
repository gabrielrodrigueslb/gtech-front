interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface loginRequestParams {
  email: string;
  password: string;
}

export async function loginRequest({
  email,
  password,
}: loginRequestParams): Promise<LoginResponse> {
  const res = await fetch('http://localhost:3333/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 🔥 OBRIGATÓRIO
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Erro ao logar');
  }

  return res.json();
}

export async function getMe() {
  const res = await fetch('http://localhost:3333/api/auth/me', {
    credentials: 'include',
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}
