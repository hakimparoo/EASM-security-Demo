import React, { createContext, useContext, useMemo, useState } from "react";

type Plan = "free" | "pro" | "enterprise";
type Org = { name: string; domain: string; plan: Plan };

type Ctx = {
  org: Org;
  isAuthed: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;

  // new
  setPlan: (plan: Plan) => void;
};

const OrganizationContext = createContext<Ctx | null>(null);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState<boolean>(() => {
    return localStorage.getItem("easm_authed") === "1";
  });

  const [plan, setPlanState] = useState<Plan>(() => {
    const saved = localStorage.getItem("easm_plan") as Plan | null;
    return saved ?? "pro";
  });

  const org: Org = useMemo(
    () => ({
      name: "Demo Organization",
      domain: "demo.example.com",
      plan,
    }),
    [plan]
  );

  const login = (email: string, password: string) => {
    if (!email || !password) return;
    localStorage.setItem("easm_authed", "1");
    setIsAuthed(true);
  };

  const logout = () => {
    localStorage.removeItem("easm_authed");
    setIsAuthed(false);
  };

  const setPlan = (next: Plan) => {
    localStorage.setItem("easm_plan", next);
    setPlanState(next);
  };

  return (
    <OrganizationContext.Provider value={{ org, isAuthed, login, logout, setPlan }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const ctx = useContext(OrganizationContext);
  if (!ctx) throw new Error("useOrganization must be used within OrganizationProvider");
  return ctx;
}
