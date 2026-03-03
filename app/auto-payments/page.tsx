import { redirect } from 'next/navigation';

export default function AutoPaymentsRedirect() {
    redirect('/fixed-expenses');
}
