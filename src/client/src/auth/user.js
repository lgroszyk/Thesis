import jwt_decode from 'jwt-decode';

// Odczytuje JWT z local storage.
const getJwt = () => localStorage.getItem('jwt');

// Zapisuje (lub nadpisuje, jeśli już istnieje) JWT z local storage.
const setJwt = jwt => {
  if (getJwt()) {
    localStorage.removeItem('jwt');
  }
  localStorage.setItem('jwt', jwt);
};

// Usuwa JWT z local storage.
const removeJwt = () => {
  localStorage.removeItem('jwt');
}

// Wskazuje, czy użytkownik jest aktualnie zalogowany.
const isLoggedIn = () => {
  return Boolean(getJwt() && !isJwtExpired());  
}

// Odczytuje dane z JWT.
const decode = jwt => jwt_decode(jwt);

// Wskazuje, czy data ważności JWT została przekroczona.
const isJwtExpired = () => {
  if (!getJwt()) {
    return false;
  }

  const jwt = getJwt();
  const data = decode(jwt);
  const expiration = data.exp;

  if(!expiration) {
    return false;
  }

  const expDate = new Date(0).setUTCSeconds(expiration);

  return new Date() >= expDate;  
}

// Wskazuje, czy użytkownik strony jest zalogowany jako administrator.
const isUserAdmin = () => {
  if (!getJwt()) {
    return false;
  }

  const jwt = getJwt();
  const data = decode(jwt);
  const roles = data.roles;
  if (!roles) {
    return false;
  }

  if (Array.isArray(roles)) {
    if (!roles.includes('Admin')) {
      return false;
    }
  } 
  else {
    if (roles !== 'Admin') {
      return false;
    }
  }

  return true;
}

// Odczytuje nazwę zalogowanego użytkownika z JWT.
const getUsername = () => {
  if (!getJwt()) {
    return false;
  }

  const jwt = getJwt();
  const data = decode(jwt);
  const username = data.sub;
  return username;
}

export { getJwt, setJwt, removeJwt, isLoggedIn, isJwtExpired, isUserAdmin, getUsername };
