const Ticket = require("../models/Ticket");
const userTicketController = require("./UserTicketController");

let ticketController = {};

ticketController.countTickets = (criteria = {}) => {
  return Ticket.countDocuments(criteria).exec();
};

ticketController.getTickets = (criteria = {}) => {
  return Ticket.find(criteria);
};

ticketController.getTicket = (criteria = {}) => {
  return Ticket.findOne(criteria).exec();
};

ticketController.createTicket = (ticket) => {
  return new Ticket(ticket).save();
};

ticketController.updateTicket = (criteria, ticket) => {
  return Ticket.findOneAndUpdate(criteria, ticket).exec();
};

ticketController.deleteTicket = async (criteria) => {
  const ticket = await ticketController.getTicket(criteria);
  if (!ticket) throw new Error("Erro ao encontrar o bilhete para o apagar");
  if (await userTicketController.countUserTickets({ticket_id: ticket._id}) > 0) throw new Error("Erro ao apagar o bilhete, existem bilhetes comprados!");
  return Ticket.deleteOne(criteria).exec();
};

ticketController.aggregateUserTickets = (criteria = {}) => {
  return Ticket.aggregate([
    {$match: criteria},
    {$lookup: {from: "usertickets", localField: "_id", foreignField: "ticket_id", as: "userticket"}},
    {$addFields: {"userticket_count": {$size: "$userticket"}}},
    {$unwind: "$userticket"},
  ]);
};

ticketController.aggregateEvents = (criteria = {}) => {
  return Ticket.aggregate([
    {$match: criteria},
    {$lookup: {from: "events", localField: "event_id", foreignField: "_id", as: "event"}},
    {$addFields: {"event_count": {$size: "$event"}}},
    {$unwind: "$event"},
  ]);
};

ticketController.aggregateEventsPatrimony = (criteria = {}) => {
  return Ticket.aggregate([
    {$match: criteria},
    {$lookup: {from: "events", localField: "event_id", foreignField: "_id", as: "event"}},
    {$addFields: {"event_count": {$size: "$event"}}},
    {$unwind: "$event"},
    {$lookup: {from: "patrimonies", localField: "event.patrimony_id", foreignField: "_id", as: "patrimony"}},
    {$addFields: {"patrimony_count": {$size: "$patrimony"}}},
    {$unwind: "$patrimony"},
  ]);
};

module.exports = ticketController;
