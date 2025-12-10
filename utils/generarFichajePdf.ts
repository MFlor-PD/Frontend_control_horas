import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Fichaje, User } from "../api";

export async function generarFichajesPDF(
  fichajes: Fichaje[],
  user: User
) {
  const filas = fichajes
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .map((f) => {
      const fecha = new Date(f.fecha).toLocaleDateString("es-ES");
      return `
        <tr>
          <td>${fecha}</td>
          <td>${f.inicio}</td>
          <td>${f.fin || "--"}</td>
          <td>${(f.duracionHoras || 0).toFixed(2)} h</td>
          <td>${f.extra ? "✅" : ""}</td>
          <td>
            ${(f.importeDia || 0).toFixed(2)} ${user.moneda || "EUR"}
          </td>
        </tr>
      `;
    })
    .join("");

  const totalHoras = fichajes.reduce(
    (acc, f) => acc + (f.duracionHoras || 0),
    0
  );

  const totalImporte = fichajes.reduce(
    (acc, f) => acc + (f.importeDia || 0),
    0
  );

  const html = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial;
            padding: 24px;
            color: #333;
          }
          h1, h2 {
            text-align: center;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            font-size: 12px;
            text-align: center;
          }
          th {
            background-color: #f2f2f2;
          }
          .totales {
            margin-top: 20px;
            font-size: 14px;
          }
        </style>
      </head>

      <body>
        <h1>Historial de Fichajes</h1>
        <h2>${user.nombre}</h2>

        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th>Horas</th>
              <th>Extra</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            ${filas}
          </tbody>
        </table>

        <div class="totales">
          <p><strong>Total horas:</strong> ${totalHoras.toFixed(2)} h</p>
          <p><strong>Total importe:</strong> ${totalImporte.toFixed(2)} ${
    user.moneda || "EUR"
  }</p>
        </div>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri);
}
