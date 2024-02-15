import { Button } from "@/components/ui/button"
import * as React from "react";    
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { getConfig, updateConfig } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"  
import { ExclamationTriangleIcon, RocketIcon } from "@radix-ui/react-icons"  

type AlertData = {    
    success: boolean;    
    message: string;    
}   
  
const SettingsSheet: React.FC = () => {    
    const [config, setConfig] = React.useState<any | null>(null);    
    const [alertData, setAlertData] = React.useState<AlertData | null>(null);  
      
    React.useEffect(() => {    
      getConfig()    
        .then(response => {    
          setConfig(response.data.config);    
        })    
        .catch(error => {    
          console.error('Error fetching config:', error);  
          setAlertData({ success: false, message: 'An error occurred. Please try again later.' });
            
        });    
    }, []);    
      
    const handleSave = () => {    
      updateConfig(config)    
        .then(() => {    
          console.log('Config updated successfully');  
          setAlertData({ success: true, message: 'Config updated successfully.' });  
        })    
        .catch(error => {    
          console.error('Error updating config:', error);  
          setAlertData({ success: false, message: 'An error occurred. Please try again later.' });  
        });    
    };  
  
    const handleInputChange = (field: string, value: any) => {    
        setConfig({...config, [field]: value });    
    };  

    const renderAlert = () => {  
        if(!alertData) return null;  
        if(alertData.success) {
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
            )  
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
            )  
        }  
    }  
    
    return (   
        <>  
            {renderAlert()}  
        <Sheet>    
          <SheetTrigger asChild>    
            <Button variant="outline">Settings</Button>    
          </SheetTrigger>    
          <SheetContent side="bottom">    
            <SheetHeader>    
              <SheetTitle>Settings</SheetTitle>    
              <SheetDescription>    
                Update your settings here. Click save when you&#39;re done.    
              </SheetDescription>    
            </SheetHeader>    
            <div className="grid gap-4 py-4">    
              <div className="grid grid-cols-4 items-center gap-4">    
                <Label htmlFor="user_agent" className="text-right">    
                  User Agent    
                </Label>    
                <Input id="user_agent" value={config?.user_agent} onChange={e => handleInputChange('user_agent', e.target.value)} className="col-span-3" />    
              </div>    
              <div className="grid grid-cols-4 items-center gap-4">    
                <Label htmlFor="threads" className="text-right">    
                  Threads    
                </Label>    
                <Input id="threads" type="number" value={config?.threads} onChange={e => handleInputChange('threads', e.target.value)} className="col-span-3" />    
              </div>    
              <div className="grid grid-cols-4 items-center gap-4">    
                <Label htmlFor="ignore_code" className="text-right">    
                  Ignore Code    
                </Label>    
                <Input id="ignore_code" value={config?.ignore_code.join(', ')} onChange={e => handleInputChange('ignore_code', e.target.value.split(', '))} className="col-span-3" />    
              </div>    
              <div className="grid grid-cols-4 items-center gap-4">    
                <Label htmlFor="ignore_size" className="text-right">    
                  Ignore Size    
                </Label>    
                <Input id="ignore_size" value={config?.ignore_size.join(', ')} onChange={e => handleInputChange('ignore_size', e.target.value.split(', '))} className="col-span-3" />    
              </div>    
              <div className="grid grid-cols-4 items-center gap-4">    
                <Label htmlFor="apiTokens" className="text-right">    
                  API Tokens    
                </Label>    
                <Input id="apiTokens" value={config?.apiTokens.join(', ')} onChange={e=> handleInputChange('apiTokens', e.target.value.split(', '))} className="col-span-3" />    
            </div>    
          </div>    
          <SheetFooter>    
            <SheetClose asChild>    
              <Button type="submit" onClick={handleSave}>Save changes</Button>    
            </SheetClose>    
          </SheetFooter>    
        </SheetContent>    
      </Sheet>  
      </>    
    );    
};    
  
export default SettingsSheet;  