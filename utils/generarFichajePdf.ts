import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { Fichaje, User } from "../api";

export async function generarFichajesPDF(fichajes: Fichaje[], user: User) {
  if (!fichajes || fichajes.length === 0) return;

  const filasHtml = fichajes
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .map((f) => {
      const fecha = new Date(f.fecha).toLocaleDateString("es-ES");

      // Convertir a hora local
      const inicioLocal = f.inicio
        ? new Date(f.inicio).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "--";

      const finLocal = f.fin
        ? new Date(f.fin).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "--";

      return `
        <tr>
          <td>${fecha}</td>
          <td>${inicioLocal}</td>
          <td>${finLocal}</td>
          <td>${(f.duracionHoras || 0).toFixed(2)} h</td>
          <td>${f.extra ? "✅" : ""}</td>
          <td>${(f.importeDia || 0).toFixed(2)} ${user.moneda || "EUR"}</td>
        </tr>
      `;
    })
    .join("");

  const totalHoras = fichajes.reduce((acc, f) => acc + (f.duracionHoras || 0), 0);
  const totalImporte = fichajes.reduce((acc, f) => acc + (f.importeDia || 0), 0);

  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial; padding: 24px; color: #333; }
          h1,h2{text-align:center;}
          table{width:100%; border-collapse: collapse; margin-top:20px;}
          th,td{border:1px solid #ccc; padding:8px; font-size:12px; text-align:center;}
          th{background-color:#f2f2f2;}
          .totales{margin-top:20px;font-size:14px;}
        </style>
      </head>
      <body>
        <h1>Historial de Fichajes</h1>
        <h2>${user.nombre}</h2>
        <table>
          <thead>
            <tr>
              <th>Fecha</th><th>Entrada</th><th>Salida</th><th>Horas</th><th>Extra</th><th>Importe</th>
            </tr>
          </thead>
          <tbody>
            ${filasHtml}
          </tbody>
        </table>
        <div class="totales">
          <p><strong>Total horas:</strong> ${totalHoras.toFixed(2)} h</p>
          <p><strong>Total importe:</strong> ${totalImporte.toFixed(2)} ${user.moneda || "EUR"}</p>
        </div>
      </body>
    </html>
  `;

  if (Platform.OS === "web") {
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
      newWindow.focus();
      newWindow.print();
      newWindow.close();
    }
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri);
}
