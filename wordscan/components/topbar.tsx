"use client"
import * as React from "react";  
import { ModeToggle } from "@/components/modetoogle";  
import { getWPScanCredits } from "@/lib/api";  
  
export default function Topbar() {  
    const [credits, setCredits] = React.useState<number | null>(null);  

  
  React.useEffect(() => {  
    getWPScanCredits().then((response) => {  
      setCredits(response.data.wpscan_credit_remaining);  
    }).catch((error) => {  
      console.error(error);  
    });  
  }, []);  
  
  return (  
    <div className="grid grid-cols-2 w-full mt-8">  
        <span className="col-span-1 ml-8">Remaining Credits: {credits}</span>  
        <span className="col-span-1 flex justify-end mr-8"><ModeToggle/></span>  
    </div>  
  );  
}  