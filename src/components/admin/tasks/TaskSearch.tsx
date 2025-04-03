
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { executeTaskSearch } from "@/services/tasksService";

interface SearchFormValues {
  sqlQuery: string;
}

interface QueryResult {
  data: any[] | null;
  error: string | null;
  columns: string[];
}

export function TaskSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult>({
    data: null,
    error: null,
    columns: []
  });
  
  const form = useForm<SearchFormValues>({
    defaultValues: {
      sqlQuery: "SELECT * FROM tasks LIMIT 10"
    }
  });
  
  const onSubmit = async (values: SearchFormValues) => {
    setIsLoading(true);
    
    try {
      // Ensure query only contains SELECT statements to prevent data modification
      const query = values.sqlQuery.trim().toLowerCase();
      
      if (!query.startsWith('select')) {
        toast.error("Solo se permiten consultas SELECT");
        setQueryResult({
          data: null,
          error: "Solo se permiten consultas SELECT para garantizar la seguridad de los datos.",
          columns: []
        });
        setIsLoading(false);
        return;
      }
      
      // Execute the SQL query using our service
      const data = await executeTaskSearch(values.sqlQuery);
      
      // Extract column names from the first result
      const columns = data && data.length > 0 
        ? Object.keys(data[0]) 
        : [];
      
      setQueryResult({
        data: data,
        error: null,
        columns
      });
      
      toast.success("Consulta ejecutada correctamente");
    } catch (error) {
      console.error("Error inesperado:", error);
      setQueryResult({
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
        columns: []
      });
      toast.error("Error en la consulta SQL");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Búsqueda SQL de Tareas</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="sqlQuery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consulta SQL</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ingrese su consulta SQL (solo SELECT)"
                        className="font-mono h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Ejecutando..." : "Ejecutar Consulta"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          {queryResult.error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200">
              <p className="font-semibold">Error:</p>
              <p>{queryResult.error}</p>
            </div>
          ) : queryResult.data === null ? (
            <div className="text-center text-gray-500 p-8">
              Ejecute una consulta para ver resultados
            </div>
          ) : queryResult.data.length === 0 ? (
            <div className="text-center text-gray-500 p-8">
              La consulta no retornó resultados
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {queryResult.columns.map((column) => (
                      <TableHead key={column}>{column}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queryResult.data.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {queryResult.columns.map((column) => (
                        <TableCell key={column}>
                          {typeof row[column] === 'object' 
                            ? JSON.stringify(row[column]) 
                            : String(row[column] ?? '')}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
