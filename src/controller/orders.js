const orderModel = require("../models/orders");

class Order {
  async getAllOrders(req, res) {
    try {
      let Orders = await orderModel
        .find({})
        .populate("allProduct.id", "pName pImages pPrice")
        .populate("user", "name email")
        .sort({ _id: -1 });

      return res.json({ Orders });
    } catch (err) {
      console.log(err);
    }
  }

  async getOrderByUser(req, res) {
    const { uId } = req.body;

    if (!uId) {
      return res.json({ message: "All fields must be required" });
    }

    try {
      const Order = await orderModel
        .find({ user: uId })
        .populate("allProduct.id", "pName pImages pPrice")
        .populate("user", "name email")
        .sort({ _id: -1 });

      return res.json({ Order });
    } catch (err) {
      console.log(err);
    }
  }

  async postCreateOrder(req, res) {
    const { allProduct, user, amount, transactionId, address, phone } = req.body;

    if (!allProduct || !user || !amount || !transactionId || !address || !phone) {
      return res.json({ message: "All fields must be required" });
    }

    try {
      const newOrder = new orderModel({
        allProduct,
        user,
        amount,
        transactionId,
        address,
        phone,
      });

      await newOrder.save();

      return res.json({ success: "Order created successfully" });
    } catch (err) {
      console.log(err);
      return res.json({ error: "Error while creating order" });
    }
  }

  async postUpdateOrder(req, res) {
    const { oId, status } = req.body;

    if (!oId || !status) {
      return res.json({ message: "All fields must be required" });
    }

    try {
      await orderModel.findByIdAndUpdate(oId, {
        status: status,
        updatedAt: Date.now(),
      });

      return res.json({ success: "Order updated successfully" });
    } catch (err) {
      console.log(err);
      return res.json({ error: "Failed to update order" });
    }
  }

  async postDeleteOrder(req, res) {
    const { oId } = req.body;

    if (!oId) {
      return res.json({ error: "All fields must be required" });
    }

    try {
      const deleteOrder = await orderModel.findByIdAndDelete(oId);

      if (deleteOrder) {
        return res.json({ success: "Order deleted successfully" });
      }
    } catch (err) {
      console.log(err);
      return res.json({ error: "Error deleting order" });
    }
  }
}

const ordersController = new Order();
module.exports = ordersController;
