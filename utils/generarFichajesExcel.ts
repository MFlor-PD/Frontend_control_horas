import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import * as XLSX from "xlsx";
import { Fichaje } from "../api";

/**
 * Genera un archivo Excel con los fichajes
 * Compatible con Web y Móvil
 * Horas ajustadas al horario del dispositivo
 */
export const generarFichajesExcel = async (fichajes: Fichaje[], user: any) => {
  if (!fichajes || fichajes.length === 0) return;

  const data = fichajes.map((f) => {
    // Fecha - viene como ISO string "2025-12-10T21:41:49.048Z"
    let fechaFormateada = "--";
    if (f.fecha) {
      try {
        const fechaObj = new Date(f.fecha);
        const day = fechaObj.getDate().toString().padStart(2, '0');
        const month = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
        const year = fechaObj.getFullYear();
        fechaFormateada = `${day}/${month}/${year}`;
      } catch (e) {
        console.error("Error formateando fecha:", e, f.fecha);
      }
    }

    // Entrada - viene como ISO string "2025-12-10T21:41:49.048Z"
    let horaInicio = "--";
    if (f.inicio) {
      try {
        const inicioObj = new Date(f.inicio);
        const h = inicioObj.getHours();
        const m = inicioObj.getMinutes();
        horaInicio = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      } catch (e) {
        console.error("Error formateando inicio:", e, f.inicio);
      }
    }

    // Salida - viene como ISO string "2025-12-10T21:41:59.069Z"
    let horaFin = "--";
    if (f.fin) {
      try {
        const finObj = new Date(f.fin);
        const h = finObj.getHours();
        const m = finObj.getMinutes();
        horaFin = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      } catch (e) {
        console.error("Error formateando fin:", e, f.fin);
      }
    }

    return {
      Fecha: fechaFormateada,
      Entrada: horaInicio,
      Salida: horaFin,
      "Horas trabajadas": f.duracionHoras ? Number(f.duracionHoras.toFixed(2)) : 0,
      Extra: f.extra ? "Sí" : "No",
      Importe: f.importeDia ? Number(f.importeDia.toFixed(2)) : 0,
    };
  });

  // Crear hoja y workbook
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Fichajes");

  // Generar base64
  const excelBase64 = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });

  // Nombre seguro
  const safeName = (user?.nombre || "usuario")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "");
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const fileName = `fichajes_${safeName}_${dateStr}.xlsx`;

  // Web
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const link = document.createElement("a");
    link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelBase64}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Móvil
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