import { useState, useEffect } from "react";

export function useAuth() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/check", {
          credentials: "include",
        });
        if (res.ok) setLoggedIn(true);
        else setLoggedIn(false);
      } catch {
        setLoggedIn(false);
      }
      setLoading(false);
    }

    checkAuth();
  }, []);

  return { loggedIn, loading };
}
