import express from "express";
import getExpenses from "../middlewares/getExpenses.mjs";
import accountAlreadyExists from "../middlewares/accountAlreadyExists.mjs";

import { prisma } from "../lib/prisma.mjs";

const router = express.Router();

// Retorna os gastos de uma conta
router.get("/expenses", accountAlreadyExists, async (request, response) => {
  const { account } = request;

  const statements = await prisma.statements.findMany({
    where: { accountId: account.id },
  });

  const expenses = getExpenses(statements);

  return response.json(expenses);
});

// Retorna gastos totais (somando os gastos de todas as contas)
router.get("/expenses/all", async (request, response) => {
  const allAccounts = await prisma.accounts.findMany({
    include: {
      statements: true,
    },
  });

  const balances = allAccounts.map((account) =>
    getExpenses(account.statements)
  );
  let sum = balances.reduce((acc, balance) => {
    return acc + balance;
  });

  return response.json(sum);
});

export default router;
