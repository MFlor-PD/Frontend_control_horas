import * as FileSystem from "expo-file-system/legacy"; // Para móviles
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";
import { Fichaje } from "../api";

/**
 * Genera un archivo Excel con los fichajes
 * Compatible con Web y Móvil
 */
export const generarFichajesExcel = async (fichajes: Fichaje[], user: any) => {
  if (!fichajes || fichajes.length === 0) return;

  // 🔹 Transformar fichajes a filas Excel
  const data = fichajes.map((f) => ({
    Fecha: new Date(f.fecha).toLocaleDateString("es-ES"),
    Entrada: f.inicio,
    Salida: f.fin || "",
    "Horas trabajadas": Number(f.duracionHoras?.toFixed(2) || 0),
    Extra: f.extra ? "Sí" : "No",
  }));

  // 🔹 Crear hoja y workbook
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Fichajes");

  // 🔹 Generar archivo Excel en base64
  const excelBase64 = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });

  // 🔹 Nombre seguro de archivo
  const safeName = (user.nombre || "usuario").replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
  const dateStr = new Date().toISOString().slice(0, 7);
  const fileName = `fichajes_${safeName}_${dateStr}.xlsx`;

  // 🔹 Web: descarga directa
  if (typeof window !== "undefined") {
    const link = document.createElement("a");
    link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelBase64}`;
    link.download = fileName;
    document.body.appendChild(link); // Para Firefox
    link.click();
    document.body.removeChild(link);
    return;
  }

  // 🔹 Móvil: guardar y compartir
  if (!FileSystem.documentDirectory) {
    console.warn("No se puede acceder a documentDirectory en este dispositivo.");
    return;
  }

  const fileUri = `${FileSystem.documentDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, excelBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  await Sharing.shareAsync(fileUri, {
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    dialogTitle: "Exportar fichajes",
  });
};
