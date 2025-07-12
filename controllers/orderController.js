// import CompletedOrder from "../models/completedOrder.js";
// import BuyerOrder from "../models/buyerOrder.js";
// import SellerOrder from "../models/sellerOrder.js";
import { pool } from "../config/db.js";
// import { decryptRSA } from "../utils/rsa.js";

export const addNewBuyerOrder = async (req, res) => {
  // try {
  //   const json = decryptRSA({aesKey,payload,iv});
  //   data = JSON.parse(json);
  // } catch {
  //   return res.status(400).json({ error: "Invalid encrypted payload" });
  // }

  const { buyer_qty, buyer_price } = req.body;
  if (
    !buyer_qty ||
    !buyer_price ||
    isNaN(buyer_qty) ||
    isNaN(buyer_price) ||
    buyer_qty <= 0 ||
    buyer_price <= 0
  ) {
    return res.status(400).json({ error: "Invalid buyer input" });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const insertBuyer = await client.query(
      `INSERT INTO buyer_orders (buyer_qty, buyer_price)
      VALUES ($1, $2)
      RETURNING id , buyer_qty`,
      [buyer_qty, buyer_price]
    );

    const buyerOrder = insertBuyer.rows[0];

    const sellerRes = await client.query(
      `SELECT id, seller_qty
       FROM seller_orders 
       WHERE seller_price = $1 AND is_completed = false
       ORDER BY id
       LIMIT 1
       FOR UPDATE`,
      [buyer_price]
    );

    if (sellerRes.rows.length) {
      const sellerOrder = sellerRes.rows[0];
      const matchQty = Math.min(buyerOrder.buyer_qty, sellerOrder.seller_qty);

      await client.query(
        `INSERT INTO completed_orders (price, qty, buyer_id, seller_id)
        VALUES ($1, $2, $3, $4)`,
        [buyer_price, matchQty, buyerOrder.id, sellerOrder.id]
      );

      if (sellerOrder.seller_qty > matchQty) {
        await client.query(
          `UPDATE seller_orders
           SET seller_qty = seller_qty - $1
           WHERE id = $2`,
          [matchQty, sellerOrder.id]
        );
      } else {
        await client.query(`DELETE FROM seller_orders WHERE id = $1`, [
          sellerOrder.id,
        ]);
      }

      if (buyerOrder.buyer_qty > matchQty) {
        await client.query(
          `UPDATE buyer_orders
           SET buyer_qty = buyer_qty - $1
           WHERE id = $2`,
          [matchQty, buyerOrder.id]
        );
      } else {
        await client.query(
          `UPDATE buyer_orders SET is_completed = true WHERE id = $1`,
          [buyerOrder.id]
        );
      }
    }
    await client.query("COMMIT");

    res
      .status(201)
      .json({ message: "Buyer order placed & matched if possible" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).send("Server Error");
  } finally {
    client.release();
  }
};

// get all buyer
export const getAllBuyerOrders = async (req, res) => {
  try {
    const orders = await pool.query(`SELECT * FROM buyer_orders`);
    res.json(orders.rows);
  } catch (error) {
    console.error("Error fetching buyer orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get all seller
export const getAllSellerOrders = async (req, res) => {
  try {
    const orders = await pool.query(`SELECT * FROM seller_orders`);
    res.json(orders.rows);
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// this is better code
export const getAllCompletedOrders = async (req, res) => {
  try {
    const completedData = await pool.query(`SELECT * FROM completed_orders`);
    res.json(completedData.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add a new seller order
export const addNewSellerOrder = async (req, res) => {
  const { seller_qty, seller_price } = req.body;
  if (
    !seller_qty ||
    !seller_price ||
    isNaN(seller_qty) ||
    isNaN(seller_price) ||
    seller_qty <= 0 ||
    seller_price <= 0
  ) {
    return res.status(400).json({ error: "Invalid seller input" });
  }
  try {
    const client = await pool.connect();
    await client.query("BEGIN");

    // 1️⃣ Insert new seller order
    const insertSeller = await client.query(
      `INSERT INTO seller_orders (seller_qty, seller_price)
       VALUES ($1, $2)
       RETURNING id, seller_qty`,
      [seller_qty, seller_price]
    );
    const sellerOrder = insertSeller.rows[0];

    // 2️⃣ Lock & fetch matching buyer
    const buyerRes = await client.query(
      `SELECT id, buyer_qty
       FROM buyer_orders
       WHERE buyer_price = $1 AND is_completed = false
       ORDER BY id
       LIMIT 1
       FOR UPDATE`,
      [seller_price]
    );

    if (buyerRes.rows.length) {
      const buyerOrder = buyerRes.rows[0];
      const matchQty = Math.min(buyerOrder.buyer_qty, sellerOrder.seller_qty);

      // 3️⃣ Record completed trade
      await client.query(
        `INSERT INTO completed_orders (price, qty, buyer_id, seller_id)
         VALUES ($1, $2, $3, $4)`,
        [seller_price, matchQty, buyerOrder.id, sellerOrder.id]
      );

      // 4️⃣ Update or delete buyer order
      if (buyerOrder.buyer_qty > matchQty) {
        await client.query(
          `UPDATE buyer_orders
           SET buyer_qty = buyer_qty - $1
           WHERE id = $2`,
          [matchQty, buyerOrder.id]
        );
      } else {
        await client.query(
          `UPDATE buyer_orders SET is_completed = true WHERE id = $1`,
          [buyerOrder.id]
        );
      }

      // 5️⃣ Update or delete seller order
      if (sellerOrder.seller_qty > matchQty) {
        await client.query(
          `UPDATE seller_orders
           SET seller_qty = seller_qty - $1
           WHERE id = $2`,
          [matchQty, sellerOrder.id]
        );
      } else {
        await client.query(`DELETE FROM seller_orders WHERE id = $1`, [
          sellerOrder.id,
        ]);
      }
    }

    await client.query("COMMIT");
    res
      .status(201)
      .json({ message: "Seller order placed & matched if possible" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error in addNewSellerOrder:", err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

// export const getAllCompletedOrders = async (req, res) => {
//   try {
//     const buyerOrders = await BuyerOrder.find();
//     const sellerOrders = await SellerOrder.find();

//     const matchedOrders = [];
//     const completedOrders = [];
//     const buyerIdsToDelete = [];
//     const sellerIdsToDelete = [];

//     for (const buyerOrder of buyerOrders) {
//       for (const sellerOrder of sellerOrders) {
//         if (buyerOrder.buyer_price === sellerOrder.seller_price) {
//           matchedOrders.push({ buyerOrder, sellerOrder });

//           const completedOrder = await CompletedOrder.create({
//             price: sellerOrder.seller_price,
//             qty: sellerOrder.seller_qty,
//             sellerOrderId: sellerOrder._id,
//             buyerOrderId: buyerOrder._id,
//           });

//           completedOrders.push(completedOrder);
//           buyerIdsToDelete.push(buyerOrder._id);
//           sellerIdsToDelete.push(sellerOrder._id);

//           const sellerIndex = sellerOrders.findIndex((order) =>
//             order._id.equals(sellerOrder._id)
//           );
//           if (sellerIndex > -1) {
//             sellerOrders.splice(sellerIndex, 1);
//           }

//           break; // Move to the next buyerOrder
//         }
//       }
//     }

//     // Deleting matched orders from the database
//     if (buyerIdsToDelete.length > 0) {
//       await BuyerOrder.deleteMany({ _id: { $in: buyerIdsToDelete } });
//     }
//     if (sellerIdsToDelete.length > 0) {
//       await SellerOrder.deleteMany({ _id: { $in: sellerIdsToDelete } });
//     }

//     console.log("Completed Orders Array:", completedOrders);

//     try {
//       const completedMatchedOrders = await CompletedOrder.find();
//       res.status(200).json({
//         message: "Matching orders moved to Completed Order Table and removed from Pending Orders",
//         completedMatchedOrders
//       });
//     } catch (error) {
//       console.error("Error fetching completed orders:", error);
//       res.status(500).json({ message: "Internal server error" });
//     }

//   } catch (error) {
//     console.error(
//       "Error moving matching orders to Completed Order Table:",
//       error
//     );
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
