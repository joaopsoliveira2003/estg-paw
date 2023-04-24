const fs = require("fs");

const Patrimony = require("../models/Patrimony");
const eventController = require("./EventController");

let patrimonyController = {};

patrimonyController.countPatrimonies = (criteria = {}) => {
  return Patrimony.countDocuments(criteria).exec();
};

patrimonyController.getPatrimonies = (criteria = {}) => {
  return Patrimony.find(criteria);
};

patrimonyController.getPatrimony = (criteria = {}) => {
  return Patrimony.findOne(criteria).exec();
};

patrimonyController.createPatrimony = (patrimony) => {
  return new Patrimony(patrimony).save();
};

patrimonyController.updatePatrimony = (criteria, patrimony) => {
  return Patrimony.findOneAndUpdate(criteria, patrimony).exec();
};

patrimonyController.deletePatrimony = async (criteria) => {
  let patrimony = await patrimonyController.getPatrimony(criteria);
  if (!patrimony) throw new Error("Erro ao encontrar o património para o apagar");
  if (await eventController.countEvents({patrimony_id: patrimony._id}) > 0) throw new Error("Erro ao apagar o património, existem eventos associados a ele");
  if (patrimony.files.length > 0) {
    for (let i = 0; i < patrimony.files.length; i++) {
      fs.unlinkSync(patrimony.files[i].path);
    }
  }
  return Patrimony.deleteOne(criteria).exec();
};

patrimonyController.getTop3PatrimoniesWithMoreEvents = (criteria = {}) => {
  return Patrimony.aggregate([
    {
      $match: criteria
    },
    {
      $lookup: { from: "events", localField: "_id", foreignField: "patrimony_id", as: "events" }
    },
    {
      $addFields: { events_count: { $size: { "$ifNull": [ "$events", [] ] } } }
    },
    {
      $sort: { "events_count": -1 }
    },
    {
      $limit: 3
    }
]);
};

module.exports = patrimonyController;
