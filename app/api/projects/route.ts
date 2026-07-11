import { getProjects } from "@/lib/controlp";

export async function GET() {
  const projects = await getProjects();
  return Response.json({
    generatedAt: new Date().toISOString(),
    projects,
  });
}
