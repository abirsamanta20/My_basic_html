const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const port = 3010;
const app = express();

// Middleware
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/employee");
const db = mongoose.connection;
db.once("open", () => {
  console.log("MongoDB connection successful...");
});

// Mongoose schema and model
const userSchema = new mongoose.Schema({
  reg_no: String,
  f_name: String,
  l_name: String,
  email: String,
  designation: String,
});
const Users = mongoose.model("emp_details", userSchema);

// Serve form.html on root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "form.html"));
});

// ✅ Form submission route — save and redirect to only that employee
app.post("/post", async (req, res) => {
  try {
    const { reg_no, f_name, l_name, email, designation } = req.body;
    const user = new Users({ reg_no, f_name, l_name, email, designation });
    await user.save();

    // Render the success page with employee ID
    res.render("success", { employeeId: user._id });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).send("Server Error");
  }
});

// ✅ Show all employees (optional)
app.get("/employees", async (req, res) => {
  try {
    const allEmployees = await Users.find();
    res.render("employee-list", { employees: allEmployees });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).send("Server Error");
  }
});

// ✅ Show a single employee (after submission)
app.get("/employee/:id", async (req, res) => {
  try {
    const employee = await Users.findById(req.params.id);
    if (!employee) return res.status(404).send("Employee not found");

    res.render("employee-list", { employees: [employee] }); // Send single as array
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).send("Server Error");
  }
});

// Optional: success page (if you still want it for manual testing)
app.get("/success", (req, res) => {
  res.render("success");
});

// Start the server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
