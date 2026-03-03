import { getTransactionFormData } from '@/lib/actions/transactions';
import TransactionForm from '@/components/transactions/TransactionForm';

export default async function NewTransactionPage() {
    const { accounts, categories, creditCards } = await getTransactionFormData();

    return (
        <div className="container mx-auto px-4">
            <TransactionForm accounts={accounts} categories={categories} creditCards={creditCards} />
        </div>
    );
}

