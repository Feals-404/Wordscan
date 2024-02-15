"use client"
import * as React from "react";
import { DialogContent } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from "@/components/ui/table";
import { FaDownload, FaTrashAlt, FaSearch } from 'react-icons/fa';
import { getAllScanResults, downloadScanResult, deleteScanResult } from "@/lib/api";
import { ScanListResult } from "@/types/types"
import { FetchContext } from "@/components/fetchcontext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"


const PrintScans: React.FC = () => {
    const fetchContext = React.useContext(FetchContext);
    const [scanResults, setScanResults] = React.useState<ScanListResult[]>([]);
    const deleteFile = (id: string) => {
        deleteScanResult(id)
            .then(() => { 
                if (fetchContext) {
                    fetchContext.setShouldFetch(true);
                }
            })
            .catch((error) => {
                console.error('Error deleting scan result:', error);
            });
    };

    const downloadFile = (id: string) => {
        downloadScanResult(id)
            .then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `scan_${id}.json`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            })
            .catch((error) => {
                console.error('Error downloading scan result:', error);
            });
    };

    React.useEffect(() => {
        if (fetchContext && fetchContext.shouldFetch) {
            getAllScanResults()
                .then(response => {
                    const filteredResults = Object.values(response.data.scan_results);
                    setScanResults(filteredResults);
                    fetchContext.setShouldFetch(false);
                })
                .catch(error => {
                    console.error('Error fetching scan results:', error);
                });
        }
    }, [fetchContext]);

    return (
        <DialogContent className={"lg:max-w-screen-lg h-4/5 overflow-auto"}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Url</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {scanResults.map((result: ScanListResult) => (
                        <TableRow key={result.id}>
                            <TableCell className="font-medium">{result.url}</TableCell>
                            <TableCell>  {new Date(result.scan_date).toLocaleDateString("en-en", {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                            })}</TableCell>
                            <TableCell>{result.status}</TableCell>
                            <TableCell>
                                <div className="flex text-right">

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <FaDownload onClick={() => downloadFile(result.id)} className="mr-4" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Download Scan report
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <FaTrashAlt onClick={() => deleteFile(result.id)} className="mr-4"/>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Delete Scan
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <FaSearch/>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                View Scan Result
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </DialogContent>
    );
}
export default PrintScans;  
