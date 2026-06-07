import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'docs', 'swagger.yaml');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'text/yaml',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'No se pudo cargar el archivo Swagger.yaml' }, { status: 500 });
  }
}
