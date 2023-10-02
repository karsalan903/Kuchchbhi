const mongoose = require("mongoose");
const plm = require('passport-local-mongoose');

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/n13dataAssociation");

const userSchema = mongoose.Schema({
    username: String,
    password: String,
    photo: String,
    email: String,
    cart: [{type:mongoose.Schema.Types.ObjectId, ref: "product"}],
    products: [{type: mongoose.Schema.Types.ObjectId, ref: "product"}]
});

userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema);
