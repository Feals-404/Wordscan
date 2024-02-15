"use client"
import * as React from "react";  
import { Input } from "@/components/ui/input";  
import { BsFillPlayFill } from "react-icons/bs";  
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"  
import { ExclamationTriangleIcon, RocketIcon } from "@radix-ui/react-icons" 
import { launchScan } from "@/lib/api";  
  
type AlertData = {  
    success: boolean;  
    message: string;  
}  

export default function SearchBar() {  
    const [inputValue, setInputValue] = React.useState("");  
    const [isUrl, setIsUrl] = React.useState(false);  
    const [alertData, setAlertData] = React.useState<AlertData | null>(null);  
  
    const urlRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;  
  
    React.useEffect(() => {  
        setIsUrl(urlRegex.test(inputValue));  
    }, [inputValue, urlRegex]);
  
    const handleSearch = async (event: React.FormEvent) => {  
        event.preventDefault();  
        if (isUrl) {  
            try {  
                const response = await launchScan(inputValue);  
                setAlertData(response.data);  
                setInputValue('');
            } catch (error) {  
                setAlertData({  
                    success: false,  
                    message: "An error occurred while scanning the URL.",  
                });  
            }  
        }  
    };  
  
    const renderAlert = () => {  
        if (!alertData) return null;  
        if (alertData.success) { 
            setTimeout(() => {  
                setAlertData(null);  
            }, 1500);    
            return (  
                <Alert className="fixed top-0 left-1/2 transform -translate-x-1/2 w-auto z-50 mt-5">  
                    <RocketIcon className="h-4 w-4" />  
                    <AlertTitle>Success</AlertTitle>  
                    <AlertDescription>  
                        {alertData.message}  
                    </AlertDescription>  
                </Alert>  
            );  
        } else {  
            setTimeout(() => {  
                setAlertData(null);  
            }, 1500);   
            return (  
                <Alert variant="destructive" className="fixed top-0 left-1/2 transform -translate-x-1/2 w-auto z-50 mt-5 text-">  
                    <ExclamationTriangleIcon className="h-4 w-4" />  
                    <AlertTitle>Error</AlertTitle>  
                    <AlertDescription>  
                        {alertData.message}  
                    </AlertDescription>  
                </Alert>  
            );  
        }  
    };  
  
    return (  
        <div className="flex flex-col justify-center items-center h-screen">  
            {renderAlert()}  
            <div className="flex flex-col w-full items-start max-w-md">  
                <div>  
                    <h1 className="mb-4 text-2xl">Wordscan</h1>  
                </div>  
                <form className="flex items-center w-full relative" onSubmit={handleSearch}>  
                    <Input  
                        className="w-full"  
                        value={inputValue}  
                        onChange={e => setInputValue(e.target.value)}  
                    />  
                    {isUrl && (  
                        <BsFillPlayFill  
                            className="ml-2 text-2xl absolute right-4 top-1/2 transform -translate-y-1/2"  
                            onClick={handleSearch}  
                        />  
                    )}  
                </form>  
            </div>  
        </div>   
    );  
}  
