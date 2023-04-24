const Event = require("../models/Event");
const ticketController = require("./TicketController");

let eventController = {};

eventController.countEvents = (criteria = {}) => {
  return Event.countDocuments(criteria).exec();
};

eventController.getEvents = (criteria = {}) => {
  return Event.find(criteria);
};

eventController.getEvent = (criteria = {}) => {
  return Event.findOne(criteria).exec();
};

eventController.createEvent = (event) => {
  return new Event(event).save();
};

eventController.updateEvent = (criteria, event) => {
  return Event.findOneAndUpdate(criteria, event).exec();
};

eventController.deleteEvent = async (criteria) => {
  const event = await eventController.getEvent(criteria);
  if (!event) throw new Error("Erro ao encontrar o evento para o apagar");
  if (await ticketController.countTickets({event_id: event._id}) > 0) throw new Error("Erro ao apagar o evento, existem bilhetes associados a ele");
  return Event.deleteOne(criteria).exec();
};

eventController.getTop3EventsWithMoreTickets = (criteria = {}) => {
  return Event.aggregate([
    {$match: criteria},
    {$lookup: {from: "tickets", localField: "_id", foreignField: "event_id", as: "tickets"}},
    {$addFields: {tickets_count: {$size: {"$ifNull": ["$tickets", []]}}}},
    {$sort: {"tickets_count": -1}},
    {$limit: 3}
  ]).exec();
};

module.exports = eventController;
