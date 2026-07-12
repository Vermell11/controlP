import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

/** Compuerta de lint oficial del proyecto (Next 16 eliminó `next lint`). */
const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "graphify-out/**", "runtime/**"] },
  ...coreWebVitals,
  ...typescript,
  {
    // React Three Fiber muta objetos de GPU (materiales, uniforms, rotaciones)
    // dentro de useFrame: es el patrón imperativo oficial de R3F, fuera del
    // render de React. Las reglas de inmutabilidad del compiler no aplican ahí.
    files: ["app/components/vault-core/**"],
    rules: {
      "react-hooks/immutability": "off",
    },
  },
];

export default eslintConfig;
