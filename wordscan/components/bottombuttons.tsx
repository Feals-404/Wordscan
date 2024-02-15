"use client" 
import * as React from "react";    
import { Button } from "@/components/ui/button";    
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";    
import PrintScans from "@/components/printscans";    
import { FetchContext } from "@/components/fetchcontext";    
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"  
import { ExclamationTriangleIcon, RocketIcon } from "@radix-ui/react-icons"  
import { updateWordPressDb } from '@/lib/api'
import SettingsSheet from "@/components/settings";  
  
type AlertData = {  
    success: boolean;  
    message: string;  
}  

export default function BottomButtons() {    
    const [shouldFetch, setShouldFetch] = React.useState(false);  
    const [alertData, setAlertData] = React.useState<AlertData | null>(null); 
    const fetchContext = React.useContext(FetchContext);  
    const handleClick = async () => {    
        
        const response = await updateWordPressDb();  
        setAlertData(response.data);  
        setTimeout(() => {  
            setAlertData(null);  
        }, 1500); 
    };  

    const handleListAllScansClick = () => {  
        
        setShouldFetch(true);  
    
    };  
  
    const renderAlert = () => {  
        if(!alertData) return null;  
        if(alertData.success) {  
            return (  
                <Alert className="fixed top-0 left-1/2 transform -translate-x-1/2 w-auto z-50 mt-5">  
                    <RocketIcon className="h-4 w-4" />  
                    <AlertTitle>Success</AlertTitle>  
                    <AlertDescription>  
                        {alertData.message}  
                    </AlertDescription>  
                </Alert>  
            )  
        } else {  
            return (  
                <Alert variant="destructive" className="fixed top-0 left-1/2 transform -translate-x-1/2 w-auto z-50 mt-5 text-">  
                    <ExclamationTriangleIcon className="h-4 w-4" />  
                    <AlertTitle>Error</AlertTitle>  
                    <AlertDescription>  
                        {alertData.message}  
                    </AlertDescription>  
                </Alert>  
            )  
        }  
    }  
    
    return (    
        <FetchContext.Provider value={{ shouldFetch, setShouldFetch }}>  
            {renderAlert()}  
            <div className="w-full flex justify-center mb-8 space-x-4">    
                <Button variant="outline" onClick={handleClick}>Update</Button>    
                <Dialog>    
                    <DialogTrigger asChild>    
                    <Button variant="outline" onClick={handleListAllScansClick}>List All Scans</Button>       
                    </DialogTrigger>    
                    <PrintScans  />    
                </Dialog>    
                <SettingsSheet />     
            </div>    
        </FetchContext.Provider>    
    );    
}    
