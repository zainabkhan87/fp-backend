const userModel = require("../models/users");
const bcrypt = require("bcryptjs");

class UserController {
  async getAllUser(req, res) {
    try {
      const users = await userModel
        .find({})
        .populate("allProduct.id", "pName pImages pPrice")
        .populate("user", "name email")
        .sort({ _id: -1 });

      return res.json({ users });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  async getSingleUser(req, res) {
    const { uId } = req.body;
    if (!uId) return res.json({ error: "User ID is required" });

    try {
      const user = await userModel
        .findById(uId)
        .select("name email phoneNumber userImage updatedAt createdAt");

      if (!user) return res.json({ error: "User not found" });

      return res.json({ user });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  async postAddUser(req, res) {
    const { allProduct, user, amount, transactionId, address, phone } = req.body;

    if (!allProduct || !user || !amount || !transactionId || !address || !phone) {
      return res.json({ error: "All fields are required" });
    }

    try {
      const newUser = new userModel({
        allProduct,
        user,
        amount,
        transactionId,
        address,
        phone,
      });

      await newUser.save();
      return res.json({ success: "User created successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to create user" });
    }
  }

  async postEditUser(req, res) {
    const { uId, name, phoneNumber } = req.body;

    if (!uId || !name || !phoneNumber) {
      return res.json({ error: "All fields are required" });
    }

    try {
      await userModel.findByIdAndUpdate(uId, {
        name,
        phoneNumber,
        updatedAt: Date.now(),
      });

      return res.json({ success: "User updated successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to update user" });
    }
  }

  async getDeleteUser(req, res) {
    const { oId, status } = req.body;

    if (!oId || !status) {
      return res.json({ error: "Order ID and status are required" });
    }

    try {
      await userModel.findByIdAndUpdate(oId, {
        status,
        updatedAt: Date.now(),
      });

      return res.json({ success: "User status updated successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to update status" });
    }
  }

  async changePassword(req, res) {
    const { uId, oldPassword, newPassword } = req.body;

    if (!uId || !oldPassword || !newPassword) {
      return res.json({ error: "All fields are required" });
    }

    try {
      const user = await userModel.findById(uId);
      if (!user) return res.json({ error: "User not found" });

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.json({ error: "Old password is incorrect" });
      }

      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      await userModel.findByIdAndUpdate(uId, { password: hashedPassword });

      return res.json({ success: "Password updated successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to change password" });
    }
  }
}

const userController = new UserController();
module.exports = userController;
