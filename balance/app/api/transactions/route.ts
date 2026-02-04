import { NextRequest, NextResponse } from 'next/server';
import {
  getTransactions,
  getTransactionsByMonth,
  getAvailableMonths,
  updateTransactionCategory,
  getTransaction,
  createOrUpdateCategoryRule,
  applyCategoriesToMatchingTransactions,
} from '@/lib/db';
import { getEffectiveCategory } from '@/lib/categories';
import { AppCategory, CashFlowSummary, CategorySpending } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const month = searchParams.get('month');
    const months = searchParams.get('months'); // comma-separated list of months
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const accountId = searchParams.get('account_id');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const summary = searchParams.get('summary');

    // Parse months list
    const monthsList = months ? months.split(',').filter(Boolean) : month ? [month] : [];

    // If summary requested, return aggregated data for all selected months
    if (summary === 'true' && monthsList.length > 0) {
      // Collect transactions from all selected months
      let allTransactions: ReturnType<typeof getTransactionsByMonth> = [];
      for (const m of monthsList) {
        const monthTxns = getTransactionsByMonth(m);
        allTransactions = allTransactions.concat(monthTxns);
      }

      // Calculate cash flow
      let income = 0;
      let expenses = 0;

      // Category spending map
      const categoryMap = new Map<AppCategory, number>();

      for (const txn of allTransactions) {
        const effectiveCategory = getEffectiveCategory(txn.user_category, txn.plaid_category);

        // Plaid uses positive for expenses, negative for income
        if (txn.amount < 0) {
          income += Math.abs(txn.amount);
        } else {
          expenses += txn.amount;

          // Only count expenses in category breakdown
          if (effectiveCategory !== 'Income' && effectiveCategory !== 'Transfer') {
            const current = categoryMap.get(effectiveCategory) || 0;
            categoryMap.set(effectiveCategory, current + txn.amount);
          }
        }
      }

      // Convert category map to sorted array
      const categoryBreakdown: CategorySpending[] = Array.from(categoryMap.entries())
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: expenses > 0 ? (amount / expenses) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      const cashFlow: CashFlowSummary = {
        income,
        expenses,
        net: income - expenses,
      };

      return NextResponse.json({
        months: monthsList,
        cashFlow,
        categoryBreakdown,
        transactionCount: allTransactions.length,
      });
    }

    // Get list of available months
    if (searchParams.get('available_months') === 'true') {
      const availableMonths = getAvailableMonths();
      return NextResponse.json({ months: availableMonths });
    }

    // Otherwise return filtered transactions
    let transactions: ReturnType<typeof getTransactions> = [];

    if (monthsList.length > 0) {
      // Get transactions from all selected months
      for (const m of monthsList) {
        const monthTxns = getTransactionsByMonth(m);
        transactions = transactions.concat(monthTxns);
      }
      // Sort by date descending
      transactions.sort((a, b) => b.date.localeCompare(a.date));
    } else {
      transactions = getTransactions({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        accountId: accountId || undefined,
        category: category || undefined,
        search: search || undefined,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      });
    }

    // Add effective category to each transaction
    const enrichedTransactions = transactions.map((txn) => ({
      ...txn,
      effective_category: getEffectiveCategory(txn.user_category, txn.plaid_category),
    }));

    return NextResponse.json({ transactions: enrichedTransactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, user_category, merchant_name, create_rule = true } = await request.json();

    if (!id || !user_category) {
      return NextResponse.json(
        { error: 'Missing id or user_category' },
        { status: 400 }
      );
    }

    // Update the transaction category
    updateTransactionCategory(id, user_category);

    let rulesApplied = 0;

    // Create a category rule for this merchant if merchant_name is provided
    if (create_rule && merchant_name) {
      createOrUpdateCategoryRule(merchant_name, user_category);

      // Apply this rule to all other matching transactions
      rulesApplied = applyCategoriesToMatchingTransactions(merchant_name, user_category);
      console.log(`Created rule: ${merchant_name} -> ${user_category}, applied to ${rulesApplied} other transactions`);
    }

    const updated = getTransaction(id);

    return NextResponse.json({
      success: true,
      transaction: updated
        ? {
            ...updated,
            effective_category: getEffectiveCategory(updated.user_category, updated.plaid_category),
          }
        : null,
      rule_created: create_rule && !!merchant_name,
      rules_applied: rulesApplied,
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}
