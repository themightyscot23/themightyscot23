import { NextRequest, NextResponse } from 'next/server';
import {
  getTransactions,
  getTransactionsByMonth,
  getAvailableMonths,
  updateTransactionCategory,
  getTransaction,
} from '@/lib/db';
import { getEffectiveCategory } from '@/lib/categories';
import { AppCategory, CashFlowSummary, CategorySpending } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const month = searchParams.get('month');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const accountId = searchParams.get('account_id');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const summary = searchParams.get('summary');

    // If summary requested for a month, return aggregated data
    if (summary === 'true' && month) {
      const transactions = getTransactionsByMonth(month);

      // Calculate cash flow
      let income = 0;
      let expenses = 0;

      // Category spending map
      const categoryMap = new Map<AppCategory, number>();

      for (const txn of transactions) {
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
        month,
        cashFlow,
        categoryBreakdown,
        transactionCount: transactions.length,
      });
    }

    // Get list of available months
    if (searchParams.get('available_months') === 'true') {
      const months = getAvailableMonths();
      return NextResponse.json({ months });
    }

    // Otherwise return filtered transactions
    let transactions;

    if (month) {
      transactions = getTransactionsByMonth(month);
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
    const { id, user_category } = await request.json();

    if (!id || !user_category) {
      return NextResponse.json(
        { error: 'Missing id or user_category' },
        { status: 400 }
      );
    }

    updateTransactionCategory(id, user_category);

    const updated = getTransaction(id);

    return NextResponse.json({
      success: true,
      transaction: updated
        ? {
            ...updated,
            effective_category: getEffectiveCategory(updated.user_category, updated.plaid_category),
          }
        : null,
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}
