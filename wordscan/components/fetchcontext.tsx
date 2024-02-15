import React from "react";  
  
interface FetchContextProps {  
  shouldFetch: boolean;  
  setShouldFetch: React.Dispatch<React.SetStateAction<boolean>>;  
}  
  
export const FetchContext = React.createContext<FetchContextProps | undefined>(undefined);  