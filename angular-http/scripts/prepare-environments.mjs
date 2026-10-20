import { mkdir, writeFile } from "node:fs/promises";
const directory = new URL("../src/environments/", import.meta.url);
await mkdir(directory, { recursive: true });
// DEMO_KEY è una chiave dimostrativa pubblica NASA, non una credenziale personale.
// NASA_API_KEY può essere impostata localmente; il valore non viene mai stampato.
const nasaApiKey = process.env.NASA_API_KEY || "DEMO_KEY";
const contenuto = `// File locale escluso da Git.
export const environment = ${JSON.stringify({ nasaApiKey }, null, 2)};
`;
for (const nome of ["environment.ts", "environment.development.ts"]) {
  try {
    await writeFile(new URL(nome, directory), contenuto, {
      flag: "wx",
      mode: 0o600,
    });
  } catch (errore) {
    if (errore.code !== "EEXIST") throw errore;
  }
}
console.log(
  "File di ambiente pronti; i file preesistenti sono stati preservati.",
);
