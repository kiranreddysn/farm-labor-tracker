import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorker } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Download, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface WorkerImport {
  name: string;
  status: "active" | "inactive" | "on-leave";
  avatarUrl?: string;
}

export function BulkImportDialog({
  open,
  onOpenChange,
  onSuccess,
}: BulkImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const csvContent =
      "name,status,avatarUrl\nJohn Doe,active,https://api.dicebear.com/7.x/avataaars/svg?seed=john\nJane Smith,active,https://api.dicebear.com/7.x/avataaars/svg?seed=jane\n";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "worker_import_template.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setImportResults(null);
    }
  };

  const parseCSV = (text: string): WorkerImport[] => {
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    const headers = lines[0].split(",");

    return lines.slice(1).map((line) => {
      const values = line.split(",");
      const worker: any = {};

      headers.forEach((header, index) => {
        worker[header.trim()] = values[index]?.trim() || "";
      });

      return worker;
    });
  };

  const validateWorker = (worker: WorkerImport): string | null => {
    if (!worker.name) return "Name is required";
    if (!worker.status) return "Status is required";
    if (
      worker.status !== "active" &&
      worker.status !== "inactive" &&
      worker.status !== "on-leave"
    )
      return `Invalid status: ${worker.status}. Must be active, inactive, or on-leave`;
    return null;
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setImportResults(null);

    try {
      const text = await file.text();
      const workers = parseCSV(text);

      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[],
      };

      // Process each worker
      for (const worker of workers) {
        const validationError = validateWorker(worker);

        if (validationError) {
          results.failed++;
          results.errors.push(
            `Error with worker "${worker.name}": ${validationError}`,
          );
          continue;
        }

        try {
          await createWorker({
            name: worker.name,
            status: worker.status as "active" | "inactive" | "on-leave",
            avatarUrl: worker.avatarUrl,
          });
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(
            `Failed to import worker "${worker.name}": ${error}`,
          );
        }
      }

      setImportResults(results);

      if (results.success > 0 && results.failed === 0) {
        toast({
          title: "Import Successful",
          description: `Successfully imported ${results.success} workers`,
        });
        onSuccess();
      } else if (results.success > 0) {
        toast({
          title: "Partial Import",
          description: `Imported ${results.success} workers with ${results.failed} failures`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Import Failed",
          description: "Failed to import any workers",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse CSV file",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-full sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Bulk Import Workers</DialogTitle>
          <DialogDescription>
            Import multiple workers at once using a CSV file.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="csv-file">Upload CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-500">
              File must be in CSV format with columns: name, status, avatarUrl
              (optional)
            </p>
          </div>

          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>

            <Button
              type="button"
              onClick={handleImport}
              disabled={!file || importing}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              {importing ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import Workers
                </>
              )}
            </Button>
          </div>

          {importResults && (
            <div className="mt-4 space-y-4">
              {importResults.success > 0 && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    Successfully imported {importResults.success} workers
                  </AlertDescription>
                </Alert>
              )}

              {importResults.failed > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Errors</AlertTitle>
                  <AlertDescription>
                    <p>Failed to import {importResults.failed} workers</p>
                    {importResults.errors.length > 0 && (
                      <div className="mt-2 max-h-40 overflow-y-auto text-sm">
                        <ul className="list-disc pl-5 space-y-1">
                          {importResults.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
