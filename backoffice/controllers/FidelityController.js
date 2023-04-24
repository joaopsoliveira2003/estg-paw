const fs = require("fs");

let fidelityController = {};

fidelityController.getFidelity = () => {
  const default_fidelity = {
    points: "", acquisitions: "", years: "", age: {
      young: "", junior: "", adult: "", senior: "",
    },
  };
  try {
    let file = fs.readFileSync("fidelity.json");
    return JSON.parse(file);
  } catch (err) {
    fs.writeFileSync("fidelity.json", JSON.stringify(default_fidelity));
    return default_fidelity;
  }
}

fidelityController.updateFidelity = (fidelity) => {
  fs.writeFileSync("fidelity.json", JSON.stringify(fidelity));
}

module.exports = fidelityController;