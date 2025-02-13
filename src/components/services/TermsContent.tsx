
interface TermsContentProps {
  terms_conditions: string | null;
}

export function TermsContent({ terms_conditions }: TermsContentProps) {
  return (
    <div className="bg-white p-3 rounded-md">
      <h5 className="text-sm font-medium text-gray-700 mb-2">Terms & Conditions</h5>
      {terms_conditions ? (
        <div 
          className="prose prose-sm max-w-none text-gray-600 [&>*]:p-0 [&>*]:m-0"
          dangerouslySetInnerHTML={{ __html: terms_conditions }}
        />
      ) : (
        <p className="text-xs text-gray-500 italic">No terms and conditions provided</p>
      )}
    </div>
  );
}
