/**
 * Configuración de adaptadores: el ÚNICO lugar donde viven rutas absolutas de
 * esta máquina. Premisa del proyecto: las rutas no entran al esquema canónico
 * ni a la UI (preparación para despliegue web futuro).
 */
export const adapterConfig = {
  vaultRoot:
    "/Users/andresortegacorpus/Library/Mobile Documents/com~apple~CloudDocs/code/Brain/Cerebro",
  projectRoots: [
    "/Users/andresortegacorpus/Library/Mobile Documents/com~apple~CloudDocs/code",
  ],
  ollamaUrl: process.env.OLLAMA_URL ?? "http://127.0.0.1:11434",
  ollamaModel: process.env.OLLAMA_MODEL ?? "qwen2.5:7b",
};
