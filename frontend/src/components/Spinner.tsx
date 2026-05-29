/* Carbon Design System — Loading spinner
   Usa los colores IBM blue en lugar de Tailwind blue */
export default function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-carbon-gray-20 border-t-carbon-blue-60" />
    </div>
  );
}
