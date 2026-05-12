const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// REEMPLAZAR CON TU ACCESS TOKEN DE PRUEBA O PRODUCCIÓN
const ACCESS_TOKEN = 'APP_USR-3041147366273569-051012-60126b1286743fdd3a5acd7368469f69-3390920072';

const client = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN, options: { timeout: 5000 } });

// Inicializar SQLite
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al abrir la base de datos', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT,
      last_name TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      zip_code TEXT,
      total INTEGER,
      status TEXT,
      items_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

// Endpoint de Checkout (Crea la orden local y la preferencia en MP)
app.post('/api/checkout', async (req, res) => {
  try {
    const { items, buyer } = req.body;

    // Calcular total
    let total = 0;
    const mpItems = items.map(item => {
      const priceNum = parseInt(item.price.replace(/[^0-9]/g, ''));
      total += priceNum * item.quantity;
      return {
        id: item.id,
        title: item.title + (item.colorName ? ` - ${item.colorName}` : '') + (item.size ? ` (Talle: ${item.size})` : ''),
        quantity: item.quantity,
        unit_price: priceNum,
        currency_id: 'ARS',
        picture_url: item.image,
      };
    });

    // 1. Guardar orden en SQLite como 'pending'
    const insertQuery = `INSERT INTO orders (first_name, last_name, email, phone, address, city, zip_code, total, status, items_json) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(insertQuery, [
      buyer.firstName, buyer.lastName, buyer.email, buyer.phone, buyer.address, buyer.city, buyer.zipCode,
      total, 'pending', JSON.stringify(items)
    ], async function(err) {
      if (err) {
        console.error('Error guardando la orden:', err);
        return res.status(500).json({ error: 'Error guardando la orden' });
      }

      const orderId = this.lastID; // ID generado por SQLite

      try {
        // 2. Crear preferencia en Mercado Pago
        const preference = new Preference(client);
        const response = await preference.create({
          body: {
            items: mpItems,
            payer: {
              name: buyer.firstName,
              surname: buyer.lastName,
              email: buyer.email,
              phone: { area_code: '', number: buyer.phone },
              address: { zip_code: buyer.zipCode, street_name: buyer.address, street_number: '' }
            },
            external_reference: orderId.toString(), // ID que vincula el pago con nuestra DB
            back_urls: {
              success: 'http://localhost:5500/index.html', // Cambiar en producción
              failure: 'http://localhost:5500/index.html',
              pending: 'http://localhost:5500/index.html'
            },
            auto_return: 'approved',
            // notification_url: 'https://TU-URL-PUBLICA.com/webhook' // Necesitas HTTPS para probar webhooks (ngrok)
          }
        });

        res.json({
          id: response.id,
          init_point: response.init_point
        });
      } catch (mpError) {
        console.error('Error creando preferencia en MP:', mpError);
        res.status(500).json({ error: 'Error comunicándose con Mercado Pago' });
      }
    });

  } catch (error) {
    console.error('Error en checkout:', error);
    res.status(500).json({ error: 'Error procesando el checkout' });
  }
});

// Endpoint Webhook para recibir notificaciones de MP
app.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;
    
    // Solo nos interesan las notificaciones de pagos
    if (type === 'payment' && data && data.id) {
      console.log(`Notificación de pago recibida. ID de Pago: ${data.id}`);
      
      // Consultar la API de Mercado Pago para verificar el estado del pago
      const paymentClient = new Payment(client);
      const paymentInfo = await paymentClient.get({ id: data.id });
      
      const status = paymentInfo.status; // 'approved', 'rejected', etc.
      const orderId = paymentInfo.external_reference;
      
      if (orderId) {
        // Actualizar la base de datos
        db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, orderId], function(err) {
          if (err) {
            console.error(`Error actualizando orden ${orderId}:`, err);
          } else {
            console.log(`Orden ${orderId} actualizada a estado: ${status}`);
          }
        });
      }
    }
    
    // Siempre responder 200 a Mercado Pago para que deje de enviar notificaciones
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error en webhook:', error);
    res.status(500).send('Error');
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
