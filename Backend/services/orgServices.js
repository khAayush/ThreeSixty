const Organization = require("../models/Organization");

const findOrgByDomain = (domain) => {
  return Organization.findOne({ domain });
};

const createOrgFromDomain = (domain) => {
  const name = domain.split(".")[0].replace(/[-_]/g, " ");
  return Organization.create({ name, domain, status: "PENDING" });
};

module.exports = { findOrgByDomain, createOrgFromDomain };