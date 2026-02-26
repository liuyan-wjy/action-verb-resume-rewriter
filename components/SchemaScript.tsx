interface SchemaScriptProps {
  data: Record<string, unknown>;
}

export function SchemaScript({ data }: SchemaScriptProps) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
