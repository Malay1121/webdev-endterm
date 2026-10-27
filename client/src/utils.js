export const money = (n) => {
  return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
};

export const formatDate = (d) => {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export const categories = ["Food", "Travel", "Rent", "Shopping", "Entertainment", "Bills", "Other"];
