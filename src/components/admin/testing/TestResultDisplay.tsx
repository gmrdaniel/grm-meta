
interface TestResultDisplayProps {
  result: any;
  title?: string;
}

export default function TestResultDisplay({ result, title = "Resultado" }: TestResultDisplayProps) {
  if (!result) return null;
  
  return (
    <div className="mt-4">
      <h3 className="font-medium mb-2">{title} ({result.timestamp}):</h3>
      <div className="bg-gray-50 p-4 rounded-md border">
        <pre className="whitespace-pre-wrap overflow-auto max-h-80 text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    </div>
  );
}
