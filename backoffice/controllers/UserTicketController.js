const UserTicket = require("../models/UserTicket");

let userTicketController = {};

userTicketController.countUserTickets = (criteria = {}) => {
  return UserTicket.countDocuments(criteria).exec();
};

userTicketController.getUserTickets = (criteria = {}) => {
  return UserTicket.find(criteria);
};

userTicketController.getUserTicket = (criteria = {}) => {
  return UserTicket.findOne(criteria).exec();
};

userTicketController.createUserTicket = (userTicket) => {
  return new UserTicket(userTicket).save();
};

userTicketController.updateUserTicket = (criteria, userTicket) => {
  return UserTicket.findOneAndUpdate(criteria, userTicket).exec();
};

userTicketController.aggregate = (criteria = {}) => {
  return UserTicket.aggregate([
    {$match: criteria},
    {$lookup: {from: "tickets", localField: "ticket_id", foreignField: "_id", as: "ticket"}},
    {$unwind: "$ticket"},
    {$lookup: {from: "events", localField: "ticket.event_id", foreignField: "_id", as: "event"}},
    {$unwind: "$event"},
    {$lookup: {from: "patrimonies", localField: "event.patrimony_id", foreignField: "_id", as: "patrimony"}},
    {$unwind: "$patrimony"},
    {$lookup: {from: "users", localField: "user_id", foreignField: "_id", as: "user"}},
    {$unwind: "$user"},
  ]);
};

userTicketController.aggregateCountUserTickets = () => {
  return UserTicket.aggregate([
    {$group: {_id: "$ticket_id", count: {$sum: 1}, totalValue: {$sum: "$price"}}},
    {$lookup: {from: "tickets", localField: "_id", foreignField: "_id", as: "ticket"}},
    {$unwind: "$ticket"},
    {$lookup: {from: "events", localField: "ticket.event_id", foreignField: "_id", as: "event"}},
    {$unwind: "$event"},
    {$lookup: {from: "patrimonies", localField: "event.patrimony_id", foreignField: "_id", as: "patrimony"}},
    {$unwind: "$patrimony"},
    {$sort: {count: -1}},
  ]);
};

userTicketController.findTop3Users = () => {
  return UserTicket.aggregate([
    {$group: {_id: "$user_id", count: {$sum: 1}}},
    {$lookup: {from: "users", localField: "_id", foreignField: "_id", as: "user"}},
    {$unwind: "$user"},
    {$sort: {count: -1}},
    {$project: {_id: 0, count: 1, user: 1}},
    {$limit: 3},
  ]).exec();
};

userTicketController.findTop3Tickets = (criteria = {}) => {
  return UserTicket.aggregate([
    {$group: {_id: "$ticket_id", count: {$sum: 1}}},
    {$sort: {count: -1}},
    {$limit: 3},
    {$lookup: {from: "tickets", localField: "_id", foreignField: "_id", as: "ticket"}},
    {$unwind: "$ticket"},
    {$lookup: {from: "events", localField: "ticket.event_id", foreignField: "_id", as: "event"}},
    {$unwind: "$event"},
    {$project: {_id: 0, count: 1, ticket: 1, event: 1}},
  ]).exec();
};

userTicketController.findBottom3Tickets = () => {
  return UserTicket.aggregate([
    {$group: {_id: "$ticket_id", count: {$sum: 1}}},
    {$sort: {count: 1}},
    {$limit: 3},
    {$lookup: {from: "tickets", localField: "_id", foreignField: "_id", as: "ticket"}},
    {$unwind: "$ticket"},
    {$lookup: {from: "events", localField: "ticket.event_id", foreignField: "_id", as: "event"}},
    {$unwind: "$event"},
    {$project: {_id: 0, count: 1, ticket: 1, event: 1}},
  ]).exec();
};

userTicketController.averageMoneyByUsers = () => {
  return UserTicket.aggregate([
    {$group: {_id: "$user_id", count: {$sum: "$price"}}},
    {$group: {_id: null, average: {$avg: "$count"}}},
  ]).exec();
};

userTicketController.getLastTickets = () => {
  return UserTicket.aggregate([
    {$lookup: {from: "tickets", localField: "ticket_id", foreignField: "_id", as: "ticket"}},
    {$unwind: "$ticket"},
    {$lookup: {from: "events", localField: "ticket.event_id", foreignField: "_id", as: "event"}},
    {$unwind: "$event"},
    {$lookup: {from: "users", localField: "user_id", foreignField: "_id", as: "user"}},
    {$unwind: "$user"},
    {$sort: {"_id": -1}},
    {$limit: 10},
  ]).exec();
};

userTicketController.totalMoney = (criteria = {}) => {
  return UserTicket.aggregate([
    {$match: criteria},
    {$group: {_id: null, total: {$sum: "$price"}}},
  ]).exec();
}

module.exports = userTicketController;
