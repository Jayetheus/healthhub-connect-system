
import { createContext, useContext, useState, ReactNode, useEffect } from "react";


export type Role = "admin" | "doctor" | "pharmacist" | "patient";

interface UserContextType {
    name: string;
    surname: string;
    setName: (name: String)=> void;
    setSurname: (surname: String) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [name, setNameState] = useState<string>(() => {
    const savedName = localStorage.getItem("name");
    return (savedName as string) || "John";
  });

  // Update role handler that also saves to localStorage
  const setName = (newName: string) => {
    setNameState(newName);
    localStorage.setItem("name", newName);
  };

  const [surname, setSurnameState] = useState<string>(() => {
    const savedSurname = localStorage.getItem("surname");
    return (savedSurname as string) || "Doe";
  });

  // Update role handler that also saves to localStorage
  const setSurname = (newSurname: string) => {
    setSurnameState(newSurname);
    localStorage.setItem("surname", newSurname);
  };

  return (
    <UserContext.Provider value={{ name, surname , setName, setSurname }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a RoleProvider");
  }
  return context;
}
